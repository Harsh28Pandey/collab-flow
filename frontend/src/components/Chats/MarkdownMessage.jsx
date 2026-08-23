import React from "react";

// ------------------------------------------------------------------
// MarkdownMessage
// ------------------------------------------------------------------
// A small, dependency-free markdown renderer for chat bubbles. Handles
// the subset of markdown AI models actually produce: **bold**, *italic*,
// `inline code`, ```code blocks```, # headers, - / 1. lists, and
// [links](url). No npm install required — pure regex + JSX.
// ------------------------------------------------------------------

// ---- inline-level parsing (bold, italic, code, links) ----
const INLINE_REGEX = /(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

const renderInline = (text, keyPrefix) => {
    const parts = text.split(INLINE_REGEX).filter((p) => p !== "");

    return parts.map((part, i) => {
        const key = `${keyPrefix}-i${i}`;

        if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={key} className="font-bold text-white">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("`") && part.endsWith("`")) {
            return (
                <code key={key} className="bg-zinc-800/80 border border-white/10 rounded px-1.5 py-0.5 text-cyan-300 font-mono text-[11px]">
                    {part.slice(1, -1)}
                </code>
            );
        }
        const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (linkMatch) {
            return (
                <a
                    key={key}
                    href={linkMatch[2]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 underline decoration-cyan-400/40 hover:text-cyan-300 hover:decoration-cyan-300 transition-colors"
                >
                    {linkMatch[1]}
                </a>
            );
        }
        if (part.startsWith("*") && part.endsWith("*")) {
            return <em key={key} className="italic text-zinc-300">{part.slice(1, -1)}</em>;
        }
        return <React.Fragment key={key}>{part}</React.Fragment>;
    });
};

// ---- block-level parsing (paragraphs, headers, lists, code fences) ----
const parseBlocks = (text) => {
    const lines = text.replace(/\r\n/g, "\n").split("\n");
    const blocks = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        // fenced code block
        if (line.trim().startsWith("```")) {
            const codeLines = [];
            i++;
            while (i < lines.length && !lines[i].trim().startsWith("```")) {
                codeLines.push(lines[i]);
                i++;
            }
            i++; // skip closing fence
            blocks.push({ type: "code", content: codeLines.join("\n") });
            continue;
        }

        // header
        const headerMatch = line.match(/^(#{1,3})\s+(.*)/);
        if (headerMatch) {
            blocks.push({ type: "header", level: headerMatch[1].length, content: headerMatch[2] });
            i++;
            continue;
        }

        // unordered list
        if (/^[-*]\s+/.test(line.trim())) {
            const items = [];
            while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
                items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
                i++;
            }
            blocks.push({ type: "ul", items });
            continue;
        }

        // ordered list
        if (/^\d+\.\s+/.test(line.trim())) {
            const items = [];
            while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
                items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
                i++;
            }
            blocks.push({ type: "ol", items });
            continue;
        }

        // blank line — skip
        if (line.trim() === "") {
            i++;
            continue;
        }

        // paragraph — collect until blank line / next special block
        const paraLines = [];
        while (
            i < lines.length &&
            lines[i].trim() !== "" &&
            !lines[i].trim().startsWith("```") &&
            !/^(#{1,3})\s+/.test(lines[i]) &&
            !/^[-*]\s+/.test(lines[i].trim()) &&
            !/^\d+\.\s+/.test(lines[i].trim())
        ) {
            paraLines.push(lines[i]);
            i++;
        }
        blocks.push({ type: "p", content: paraLines.join("\n") });
    }

    return blocks;
};

const HEADER_SIZES = {
    1: "text-sm font-black text-white mt-2 mb-1",
    2: "text-sm font-bold text-white mt-2 mb-1",
    3: "text-xs font-bold text-zinc-200 mt-2 mb-1 uppercase tracking-wide",
};

const MarkdownMessage = ({ content }) => {
    if (!content) return null;

    const blocks = parseBlocks(content);

    return (
        <div className="space-y-2 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            {blocks.map((block, bi) => {
                const key = `b${bi}`;

                if (block.type === "header") {
                    return (
                        <p key={key} className={HEADER_SIZES[block.level] || HEADER_SIZES[3]}>
                            {renderInline(block.content, key)}
                        </p>
                    );
                }

                if (block.type === "code") {
                    return (
                        <pre
                            key={key}
                            className="bg-zinc-950/80 border border-white/10 rounded-xl px-3 py-2.5 overflow-x-auto shadow-inner"
                        >
                            <code className="font-mono text-[11px] text-zinc-200 whitespace-pre">
                                {block.content}
                            </code>
                        </pre>
                    );
                }

                if (block.type === "ul") {
                    return (
                        <ul key={key} className="list-disc list-outside pl-4 space-y-1">
                            {block.items.map((item, ii) => (
                                <li key={`${key}-${ii}`} className="pl-0.5">{renderInline(item, `${key}-${ii}`)}</li>
                            ))}
                        </ul>
                    );
                }

                if (block.type === "ol") {
                    return (
                        <ol key={key} className="list-decimal list-outside pl-4 space-y-1">
                            {block.items.map((item, ii) => (
                                <li key={`${key}-${ii}`} className="pl-0.5">{renderInline(item, `${key}-${ii}`)}</li>
                            ))}
                        </ol>
                    );
                }

                // paragraph — preserve single line breaks as <br/>
                const lines = block.content.split("\n");
                return (
                    <p key={key}>
                        {lines.map((line, li) => (
                            <React.Fragment key={`${key}-${li}`}>
                                {li > 0 && <br />}
                                {renderInline(line, `${key}-${li}`)}
                            </React.Fragment>
                        ))}
                    </p>
                );
            })}
        </div>
    );
};

export default MarkdownMessage;