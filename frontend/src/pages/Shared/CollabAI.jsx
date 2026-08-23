import React, { useContext, useEffect, useRef, useState } from "react";
import {
    Send, Loader2, ShieldCheck, Sparkles, Trash2,
    Lock, User, ShieldAlert, MessageSquare, Cpu, RefreshCw, AlertCircle,
    Users, Pencil, Copy, Check, X,
} from "lucide-react";
import { LuSparkles } from "react-icons/lu";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import MarkdownMessage from "../../components/Chats/MarkdownMessage.jsx";
import { UserContext } from "../../context/userContext.jsx";

const CollabLogo = ({ box = "w-10 h-10", inner = "rounded-[15px]", icon = 18 }) => (
    <div className={`relative flex items-center justify-center ${box} rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 p-[1px] shadow-[0_0_20px_rgba(99,102,241,0.3)] shrink-0`}>
        <div className={`w-full h-full bg-zinc-950 ${inner} flex items-center justify-center relative overflow-hidden`}>
            <div className="absolute inset-0 bg-blue-500/10" />
            <LuSparkles style={{ width: icon, height: icon }} className="text-blue-400 relative z-10" />
        </div>
    </div>
);

const CollabAI = () => {
    const { user } = useContext(UserContext);
    const isAdmin = user?.role === "admin";

    const [loadingHistory, setLoadingHistory] = useState(true);
    const [sending, setSending] = useState(false);
    const [pageVisible, setPageVisible] = useState(false);

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [error, setError] = useState("");
    const [historyError, setHistoryError] = useState("");

    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [clearing, setClearing] = useState(false);

    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState("");
    const [savingEdit, setSavingEdit] = useState(false);
    const [regeneratingId, setRegeneratingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    const scrollRef = useRef(null);
    const inputRef = useRef(null);
    const editRef = useRef(null);

    const isBusy = sending || !!regeneratingId;

    const fetchHistory = async () => {
        try {
            setLoadingHistory(true);
            setHistoryError("");
            const res = await axiosInstance.get(API_PATHS.COLLAB_AI.HISTORY);
            setMessages(res.data?.messages || []);
        } catch (err) {
            setHistoryError(err?.response?.data?.message || "Couldn't load your conversation. Please retry.");
        } finally {
            setLoadingHistory(false);
            setTimeout(() => setPageVisible(true), 100);
        }
    };

    useEffect(() => { fetchHistory(); }, []);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, sending, regeneratingId]);

    useEffect(() => {
        if (editingId && editRef.current) {
            editRef.current.focus();
            editRef.current.setSelectionRange(editValue.length, editValue.length);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editingId]);

    const sendMessage = async () => {
        const trimmed = input.trim();
        if (!trimmed || isBusy) return;

        setError("");
        setInput("");

        const tempId = `temp-${Date.now()}`;
        setMessages((prev) => [...prev, { _id: tempId, role: "user", content: trimmed }]);
        setSending(true);

        try {
            const res = await axiosInstance.post(API_PATHS.COLLAB_AI.ASK, { message: trimmed });
            setMessages(res.data?.messages || []);
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to reach Collab AI. Please try again.");
            setMessages((prev) => prev.filter((m) => m._id !== tempId));
            setInput(trimmed);
        } finally {
            setSending(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const confirmClear = async () => {
        setClearing(true);
        try {
            await axiosInstance.delete(API_PATHS.COLLAB_AI.CLEAR);
            setMessages([]);
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to clear chat");
        } finally {
            setClearing(false);
            setShowClearConfirm(false);
        }
    };

    const startEdit = (msg) => {
        if (isBusy) return;
        setEditingId(msg._id);
        setEditValue(msg.content);
    };
    const cancelEdit = () => { setEditingId(null); setEditValue(""); };

    const saveEdit = async (id) => {
        const trimmed = editValue.trim();
        if (!trimmed || savingEdit) return;

        setMessages((prev) => {
            const idx = prev.findIndex((m) => m._id === id);
            if (idx === -1) return prev;
            const next = prev.slice(0, idx + 1);
            next[idx] = { ...next[idx], content: trimmed, edited: true };
            return next;
        });
        setEditingId(null);
        setEditValue("");
        setSavingEdit(true);
        setRegeneratingId(id);

        try {
            const res = await axiosInstance.put(API_PATHS.COLLAB_AI.UPDATE_MESSAGE(id), { content: trimmed });
            setMessages(res.data?.messages || []);
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to update message");
        } finally {
            setSavingEdit(false);
            setRegeneratingId(null);
        }
    };

    const handleEditKeyDown = (e, id) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); saveEdit(id); }
        if (e.key === "Escape") cancelEdit();
    };

    const deleteMessage = async (id) => {
        if (isBusy) return;
        setDeletingId(id);
        try {
            const res = await axiosInstance.delete(API_PATHS.COLLAB_AI.DELETE_MESSAGE(id));
            setMessages(res.data?.messages || []);
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to delete message");
        } finally {
            setDeletingId(null);
        }
    };

    const copyMessage = async (id, content) => {
        try {
            await navigator.clipboard.writeText(content);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 1500);
        } catch {
            // clipboard blocked — silently ignore
        }
    };

    const askQuick = (text) => {
        if (isBusy) return;
        setInput(text);
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const Skeleton = ({ className }) => (
        <div className={`relative overflow-hidden bg-zinc-900 border border-white/5 rounded-2xl ${className}`}>
            <div className="absolute inset-0 skeleton-shimmer" />
        </div>
    );

    const TypingDots = () => (
        <div className="flex justify-start">
            <div className="flex items-start gap-3">
                <CollabLogo box="w-8 h-8" inner="rounded-[11px]" icon={14} />
                <div className="rounded-2xl px-4 py-3 bg-zinc-900/50 border border-white/5 shadow-inner flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-bounce" />
                </div>
            </div>
        </div>
    );

    const askCount = messages.filter((m) => m.role === "user").length;

    const QUICK_PROMPTS = isAdmin
        ? [
            "List all members in my team",
            "Who joined the team most recently?",
            "What skills does my team cover overall?",
            "Which members aren't verified yet?",
        ]
        : [
            "What's my role here?",
            "List my skills",
            "Summarize my profile",
            "How is my experience level rated?",
        ];

    return (
        <DashboardLayout activeMenu="Collab AI">

            <div className="space-y-5 sm:space-y-6">

                {/* HEADER */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-5 mb-1 sm:mb-2 px-1 sm:px-0">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <CollabLogo box="w-10 h-10 sm:w-12 sm:h-12" icon={18} />
                        <div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2 sm:gap-3 flex-wrap">
                                Collab AI
                                <span className="text-[9px] sm:text-[10px] font-mono font-bold tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-500/25 rounded-full px-2 sm:px-2.5 py-0.5 sm:py-1 uppercase">
                                    Beta
                                </span>
                                {isAdmin && (
                                    <span className="text-[9px] sm:text-[10px] font-mono font-bold tracking-widest text-purple-400 bg-purple-500/10 border border-purple-500/25 rounded-full px-2 sm:px-2.5 py-0.5 sm:py-1 uppercase flex items-center gap-1.5">
                                        <Users size={11} className="stroke-[2.5]" />
                                        Admin
                                    </span>
                                )}
                            </h1>
                            <p className="text-[11px] sm:text-sm font-mono text-zinc-400 mt-1 leading-relaxed">
                                {isAdmin
                                    ? `Scoped to your team${user?.teamCode ? ` (${user.teamCode})` : ""} — every member's data, nothing outside it.`
                                    : "Your private assistant — scoped to your own account only."}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowClearConfirm(true)}
                        disabled={loadingHistory || messages.length === 0}
                        className="cursor-pointer h-10 sm:h-11 px-4 sm:px-5 rounded-2xl bg-zinc-900/70 border border-white/10 hover:border-rose-500/30 hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 flex items-center justify-center gap-2 text-xs sm:text-sm font-mono font-bold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto shrink-0"
                    >
                        <Trash2 size={14} className="stroke-[2.5] sm:w-[15px] sm:h-[15px]" />
                        Clear Conversation
                    </button>
                </div>

                {loadingHistory ? (

                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                        <Skeleton className="hidden sm:block h-28 xl:col-span-1 animate-pulse" />
                        <Skeleton className="hidden sm:block h-28 xl:col-span-1 animate-pulse" />
                        <Skeleton className="hidden sm:block h-28 xl:col-span-1 animate-pulse" />
                        <Skeleton className="hidden sm:block h-28 xl:col-span-1 animate-pulse" />

                        <div className="xl:col-span-4 bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[1.75rem] sm:rounded-[2.5rem] p-4 sm:p-6 md:p-8 min-h-[420px] sm:min-h-[520px] shadow-[0_15px_50px_rgba(0,0,0,0.6)]">
                            <div className="space-y-4">
                                <Skeleton className="h-16 w-2/3 animate-pulse" />
                                <Skeleton className="h-16 w-1/2 ml-auto animate-pulse" />
                                <Skeleton className="h-20 w-3/4 animate-pulse" />
                                <Skeleton className="h-16 w-1/2 ml-auto animate-pulse" />
                            </div>
                        </div>
                    </div>

                ) : (

                    <div className={`space-y-5 sm:space-y-6 transition-all duration-500 ease-out ${pageVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}>

                        {historyError && (
                            <div className="bg-rose-500/10 border border-rose-500/25 rounded-2xl px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between gap-3 sm:gap-4 flex-wrap shadow-inner">
                                <div className="flex items-center gap-3">
                                    <AlertCircle size={18} className="text-rose-400 stroke-[2.5] shrink-0" />
                                    <p className="text-xs sm:text-sm font-mono font-bold text-rose-300">{historyError}</p>
                                </div>
                                <button
                                    onClick={fetchHistory}
                                    className="h-9 px-4 rounded-xl bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/20 text-rose-300 flex items-center gap-2 text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer shrink-0"
                                >
                                    <RefreshCw size={13} className="stroke-[2.5]" />
                                    Retry
                                </button>
                            </div>
                        )}

                        {/* ================= BENTO STAT TILES — desktop/tablet only ================= */}
                        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">

                            <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 hover:border-cyan-500/20 rounded-[2rem] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center gap-4 transition-all hover:-translate-y-0.5">
                                <div className="h-11 w-11 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center shrink-0 shadow-inner">
                                    {isAdmin
                                        ? <Users size={20} className="text-cyan-400 stroke-[2.5]" />
                                        : <ShieldCheck size={20} className="text-cyan-400 stroke-[2.5]" />}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">Data Scope</p>
                                    <h4 className="text-sm font-mono font-black text-white mt-0.5 truncate">
                                        {isAdmin ? "Full team access" : "Your account only"}
                                    </h4>
                                </div>
                            </div>

                            <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 hover:border-indigo-500/20 rounded-[2rem] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center gap-4 transition-all hover:-translate-y-0.5">
                                <div className="h-11 w-11 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center shrink-0 shadow-inner">
                                    <Lock size={20} className="text-indigo-400 stroke-[2.5]" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
                                        {isAdmin ? "Team Code" : "Role"}
                                    </p>
                                    <h4 className="text-sm font-mono font-black text-white mt-0.5 truncate">
                                        {isAdmin ? (user?.teamCode || "—") : (user?.role || "member")}
                                    </h4>
                                </div>
                            </div>

                            <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 hover:border-purple-500/20 rounded-[2rem] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center gap-4 transition-all hover:-translate-y-0.5">
                                <div className="h-11 w-11 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center shrink-0 shadow-inner">
                                    <MessageSquare size={20} className="text-purple-400 stroke-[2.5]" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">Questions Asked</p>
                                    <h4 className="text-sm font-mono font-black text-white mt-0.5">{askCount}</h4>
                                </div>
                            </div>

                            <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 hover:border-emerald-500/20 rounded-[2rem] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center gap-4 transition-all hover:-translate-y-0.5">
                                <div className="h-11 w-11 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0 shadow-inner">
                                    <Cpu size={20} className="text-emerald-400 stroke-[2.5]" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">Status</p>
                                    <h4 className="text-sm font-mono font-black text-emerald-400 mt-0.5">Ready</h4>
                                </div>
                            </div>

                        </div>

                        {/* ================= CHAT PANEL ================= */}
                        <div className="bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[1.75rem] sm:rounded-[2.5rem] shadow-[0_15px_50px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col h-[min(680px,78vh)] sm:h-[min(640px,75vh)] min-h-[420px]">

                            <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-4 sm:py-5 border-b border-white/5 shrink-0">
                                <div className="flex items-center gap-2.5 sm:gap-3">
                                    <CollabLogo box="w-9 h-9 sm:w-10 sm:h-10" icon={15} />
                                    <div>
                                        <p className="text-xs sm:text-sm font-mono font-black text-white">Collab AI Assistant</p>
                                        <p className="text-[9px] sm:text-[10px] font-mono text-zinc-500">
                                            {isAdmin ? "Analyzing your team's data only" : "Analyzing your account data only"}
                                        </p>
                                    </div>
                                </div>

                                <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
                                    <Lock size={12} className="stroke-[2.5]" />
                                    {isAdmin ? "Isolated per team" : "Isolated per account"}
                                </div>
                            </div>

                            {/* messages */}
                            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 space-y-3.5 sm:space-y-4 custom-scrollbar">

                                {messages.length === 0 && !isBusy && (
                                    <div className="h-full flex flex-col items-center justify-center text-center py-8 sm:py-10">
                                        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 shadow-inner">
                                            <Sparkles size={22} className="text-cyan-400 stroke-[2.5] sm:w-6 sm:h-6" />
                                        </div>
                                        <p className="text-xs sm:text-sm font-mono font-bold text-white px-4">
                                            {isAdmin ? "Ask Collab AI anything about your team" : "Ask Collab AI anything about your account"}
                                        </p>
                                        <p className="text-[11px] sm:text-xs font-mono text-zinc-500 mt-1.5 max-w-sm px-4">
                                            {isAdmin
                                                ? "It can see everyone who shares your team code — nothing outside your team."
                                                : "It can only see and discuss data belonging to you — it has no visibility into any other user's or admin's account."}
                                        </p>

                                        <div className="flex flex-wrap justify-center gap-2 mt-5 sm:mt-6 max-w-lg px-4">
                                            {QUICK_PROMPTS.map((q) => (
                                                <button
                                                    key={q}
                                                    onClick={() => askQuick(q)}
                                                    className="cursor-pointer text-[10px] sm:text-[11px] font-mono font-bold text-zinc-300 bg-zinc-900/70 border border-white/10 hover:border-cyan-500/30 hover:text-cyan-300 rounded-full px-3 sm:px-3.5 py-1.5 sm:py-2 transition-all active:scale-95"
                                                >
                                                    {q}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {messages.map((msg) => {
                                    const isUser = msg.role === "user";
                                    const isBlocked = msg.blocked;
                                    const isEditing = editingId === msg._id;
                                    const isDeleting = deletingId === msg._id;

                                    return (
                                        <div key={msg._id} className={`group flex ${isUser ? "justify-end" : "justify-start"}`}>
                                            <div className={`flex items-start gap-2 sm:gap-3 max-w-[88%] sm:max-w-[85%] md:max-w-[70%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>

                                                {isUser ? (
                                                    <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center shrink-0 border shadow-inner bg-zinc-800 border-white/10 text-zinc-300">
                                                        <User size={13} className="stroke-[2.5] sm:w-3.5 sm:h-3.5" />
                                                    </div>
                                                ) : isBlocked ? (
                                                    <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center shrink-0 border shadow-inner bg-rose-500/10 border-rose-500/25 text-rose-400">
                                                        <ShieldAlert size={13} className="stroke-[2.5] sm:w-3.5 sm:h-3.5" />
                                                    </div>
                                                ) : (
                                                    <CollabLogo box="w-7 h-7 sm:w-8 sm:h-8" inner="rounded-[10px] sm:rounded-[11px]" icon={13} />
                                                )}

                                                <div className="flex flex-col gap-1.5 min-w-0">

                                                    {isEditing ? (
                                                        <div className="rounded-2xl px-3 py-3 bg-zinc-900/90 border border-cyan-500/30 shadow-inner">
                                                            <textarea
                                                                ref={editRef}
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                onKeyDown={(e) => handleEditKeyDown(e, msg._id)}
                                                                rows={2}
                                                                maxLength={2000}
                                                                className="w-full resize-none bg-transparent outline-none text-xs sm:text-sm font-mono text-white placeholder-zinc-600"
                                                            />
                                                            <div className="flex items-center justify-end gap-2 mt-2">
                                                                <button
                                                                    onClick={cancelEdit}
                                                                    className="h-7 px-3 rounded-lg bg-zinc-800/80 border border-white/10 text-zinc-400 hover:text-white text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                                                                >
                                                                    <X size={12} className="stroke-[2.5]" /> Cancel
                                                                </button>
                                                                <button
                                                                    onClick={() => saveEdit(msg._id)}
                                                                    disabled={!editValue.trim()}
                                                                    className="h-7 px-3 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95 disabled:opacity-40"
                                                                >
                                                                    <Check size={12} className="stroke-[2.5]" />
                                                                    Save & Resend
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className={`rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-[12px] sm:text-sm font-mono leading-relaxed shadow-inner border break-words ${isUser
                                                            ? "bg-zinc-900/80 border-white/10 text-white"
                                                            : isBlocked
                                                                ? "bg-rose-500/10 border-rose-500/25 text-rose-300 font-bold"
                                                                : "bg-zinc-900/50 border-white/5 text-zinc-200"
                                                            } ${isDeleting ? "opacity-40" : ""}`}>
                                                            {isUser
                                                                ? msg.content
                                                                : <MarkdownMessage content={msg.content} />
                                                            }
                                                        </div>
                                                    )}

                                                    {/* meta row: timestamp / edited badge / hover actions */}
                                                    {!isEditing && (
                                                        <div className={`flex items-center gap-2 px-1 ${isUser ? "justify-end" : "justify-start"}`}>
                                                            {msg.createdAt && (
                                                                <span className="text-[9px] font-mono text-zinc-600">
                                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                                </span>
                                                            )}
                                                            {msg.edited && (
                                                                <span className="text-[9px] font-mono text-zinc-600 italic">edited</span>
                                                            )}

                                                            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                                {!isUser && !isDeleting && (
                                                                    <button
                                                                        onClick={() => copyMessage(msg._id, msg.content)}
                                                                        title="Copy"
                                                                        className="h-6 w-6 rounded-md flex items-center justify-center text-zinc-500 hover:text-cyan-400 hover:bg-white/5 cursor-pointer transition-all"
                                                                    >
                                                                        {copiedId === msg._id
                                                                            ? <Check size={11} className="stroke-[2.5] text-emerald-400" />
                                                                            : <Copy size={11} className="stroke-[2.5]" />}
                                                                    </button>
                                                                )}
                                                                {isUser && !isDeleting && (
                                                                    <button
                                                                        onClick={() => startEdit(msg)}
                                                                        disabled={isBusy}
                                                                        title="Edit & resend"
                                                                        className="h-6 w-6 rounded-md flex items-center justify-center text-zinc-500 hover:text-cyan-400 hover:bg-white/5 cursor-pointer transition-all disabled:opacity-40"
                                                                    >
                                                                        <Pencil size={11} className="stroke-[2.5]" />
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => deleteMessage(msg._id)}
                                                                    disabled={isDeleting || isBusy}
                                                                    title="Delete"
                                                                    className="h-6 w-6 rounded-md flex items-center justify-center text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-all disabled:opacity-40"
                                                                >
                                                                    {isDeleting
                                                                        ? <Loader2 size={11} className="animate-spin" />
                                                                        : <Trash2 size={11} className="stroke-[2.5]" />}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                            </div>
                                        </div>
                                    );
                                })}

                                {isBusy && <TypingDots />}

                            </div>

                            {/* input */}
                            <div className="px-3 sm:px-6 md:px-8 py-3.5 sm:py-5 border-t border-white/5 shrink-0">
                                {error && (
                                    <p className="text-[11px] font-mono font-bold text-rose-400 mb-2.5 sm:mb-3 px-1">{error}</p>
                                )}
                                <div className="flex items-end gap-2 sm:gap-3">
                                    <textarea
                                        ref={inputRef}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        rows={1}
                                        maxLength={2000}
                                        disabled={isBusy}
                                        placeholder="Ask me anything..."
                                        className="flex-1 resize-none max-h-32 rounded-2xl border border-white/10 bg-zinc-900/80 outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 text-[13px] sm:text-sm font-mono text-white placeholder-zinc-600 px-3.5 sm:px-4 py-2.5 sm:py-3 transition-all shadow-inner disabled:opacity-50"
                                    />

                                    <div className="relative group cursor-pointer shrink-0">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-40 group-hover:opacity-80 transition duration-300" />
                                        <button
                                            onClick={sendMessage}
                                            disabled={isBusy || !input.trim()}
                                            className="relative h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-zinc-950 text-white flex items-center justify-center border border-white/10 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-lg cursor-pointer"
                                        >
                                            {isBusy
                                                ? <Loader2 size={17} className="animate-spin text-cyan-400 sm:w-[18px] sm:h-[18px]" />
                                                : <Send size={17} className="text-cyan-400 stroke-[2.5] sm:w-[18px] sm:h-[18px]" />
                                            }
                                        </button>
                                    </div>
                                </div>
                                <p className="text-[9px] sm:text-[10px] font-mono text-zinc-600 mt-1.5 sm:mt-2 text-right pr-1">{input.length}/2000</p>
                            </div>

                        </div>
                    </div>
                )}
            </div>

            {/* ================= CLEAR CONFIRM MODAL ================= */}
            {showClearConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => !clearing && setShowClearConfirm(false)}
                    />
                    <div className="relative w-full max-w-sm bg-zinc-950/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
                        <div className="h-12 w-12 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center mb-4 shadow-inner">
                            <AlertCircle size={22} className="text-rose-400 stroke-[2.5]" />
                        </div>
                        <h3 className="text-base font-mono font-black text-white">Clear this conversation?</h3>
                        <p className="text-xs font-mono text-zinc-400 mt-2 leading-relaxed">
                            This permanently deletes every message in your Collab AI chat. This can't be undone.
                        </p>
                        <div className="flex items-center gap-3 mt-6">
                            <button
                                onClick={() => setShowClearConfirm(false)}
                                disabled={clearing}
                                className="flex-1 h-11 rounded-2xl bg-zinc-900/80 border border-white/10 text-zinc-300 hover:text-white text-xs font-mono font-bold cursor-pointer transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmClear}
                                disabled={clearing}
                                className="flex-1 h-11 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25 text-xs font-mono font-bold cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                {clearing
                                    ? <Loader2 size={14} className="animate-spin" />
                                    : <Trash2 size={14} className="stroke-[2.5]" />}
                                Delete All
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .skeleton-shimmer {
                    background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0) 100%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite linear;
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .custom-scrollbar::-webkit-scrollbar { width:5px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:999px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background:rgba(255,255,255,0.2); }
            `}</style>

        </DashboardLayout>
    );
};

export default CollabAI;