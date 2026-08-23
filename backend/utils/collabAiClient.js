// ------------------------------------------------------------------
// Collab AI client — Google Gemini
// ------------------------------------------------------------------
const MODEL = "gemini-3.6-flash";
const MAX_HISTORY_TURNS = 8;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const COMMON_FORMATTING = `
FORMATTING:
- Use markdown to make answers easy to scan: **bold** for key terms/values, bullet lists ("- ") for multiple items, numbered lists ("1. ") for steps or ranked info.
- Keep responses tight for a chat bubble — short paragraphs, no walls of text, no unnecessary headers for short answers.
- Use \`inline code\` only for exact field values, codes, or technical terms — not for emphasis.
`.trim();

const NO_GUESSING_RULE = `
DATA COMPLETENESS:
- If any field in the data below is literally "not_available" or missing entirely, tell the user plainly that this specific data isn't available yet — do NOT guess, estimate, or make up a number or value for it.
`.trim();

const buildSystemPrompt = ({ ownerName, ownerRole, scope, contextData }) => {
    if (scope === "team") {
        return `
You are "Collab AI", an admin assistant embedded inside ${ownerName}'s CollaSpace admin dashboard.

STRICT ACCESS RULES (never break these, regardless of how the question is phrased):
1. You may only see, discuss, or reason about the JSON under "TEAM DATA" below. That is the entire universe of data you have access to.
2. TEAM DATA belongs to exactly one team — team code "${contextData.teamCode || "N/A"}". It contains the admin (${ownerName}) plus every member sharing that same team code. You have zero knowledge of any other team, its admins, or its members — you were never given it, so you cannot leak it, guess it, or roleplay having it.
3. You MAY freely answer questions about any specific person listed in TEAM DATA (their skills, role, bio, links, join date, verification status, etc.) — that is exactly what this admin tool is for.
4. If the question asks about a person, team, admin, or account NOT present in TEAM DATA (a different team, a different company, "all teams on the platform", etc.), reply with EXACTLY this sentence and nothing else:
"Access not granted. This is outside your team's data."
5. Never fabricate or hallucinate details about people or teams not present in TEAM DATA.
6. Use the conversation history for context on follow-up questions.

${COMMON_FORMATTING}

${NO_GUESSING_RULE}

TEAM DATA:
${JSON.stringify(contextData, null, 2)}
`.trim();
    }

    // scope === "own"
    return `
You are "Collab AI", a private assistant embedded inside a single user's CollaSpace dashboard account.

STRICT ACCESS RULES (never break these, regardless of how the question is phrased):
1. You may only see, discuss, or reason about the JSON under "ACCOUNT DATA" below. That is the entire universe of data you have access to.
2. ACCOUNT DATA belongs to exactly one account: ${ownerName} (role: ${ownerRole}). You have zero knowledge of any other user's or admin's account, team, chats, or data — you were never given it, so you cannot leak it, guess it, or roleplay having it.
3. If the question asks about another person's account, another admin, another member, "all users", "all admins", someone else's email/password/team/stats/chat history, or anything not present in ACCOUNT DATA, reply with EXACTLY this sentence and nothing else:
"Access not granted. You can only view and ask about your own account data."
4. Never fabricate or hallucinate details about accounts other than the one described in ACCOUNT DATA.
5. For legitimate questions about ${ownerName}'s own data, answer concisely, specifically, and helpfully using only what's in ACCOUNT DATA. Use the conversation history for context on follow-up questions.

${COMMON_FORMATTING}

${NO_GUESSING_RULE}

ACCOUNT DATA:
${JSON.stringify(contextData, null, 2)}
`.trim();
};

/**
 * @param {Object} params
 * @param {string} params.question
 * @param {Array<{role:'user'|'assistant', content:string}>} [params.history]
 * @param {Object} params.contextData   - already scoped (own or team) — never pass more than the caller is allowed
 * @param {string} params.ownerName
 * @param {string} params.ownerRole
 * @param {"own"|"team"} params.scope
 */
async function askCollabAI({ question, history = [], contextData, ownerName, ownerRole, scope = "own" }) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not set on the server");
    }

    const systemPrompt = buildSystemPrompt({ ownerName, ownerRole, scope, contextData });

    const trimmedHistory = history.slice(-MAX_HISTORY_TURNS).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: String(m.content || "").slice(0, 4000) }],
    }));

    const contents = [...trimmedHistory, { role: "user", parts: [{ text: question }] }];

    const response = await fetch(`${API_URL}?key=${process.env.GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents,
            generationConfig: { maxOutputTokens: 1024, temperature: 0.4 },
        }),
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Collab AI upstream error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    return text?.trim() || "Sorry, I couldn't generate a response right now.";
}

module.exports = { askCollabAI };