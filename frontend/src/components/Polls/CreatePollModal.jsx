// src/components/Polls/CreatePollModal.jsx
import React, { useState } from "react";
import {
    X,
    Plus,
    Trash2,
    BarChart3,
    CalendarClock,
    Loader2,
} from "lucide-react";

import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";

const CreatePollModal = ({ onClose, onSuccess }) => {

    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState(["", ""]);
    const [expiry, setExpiry] = useState("");

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState("");

    // GET MIN DATE
    const getMinDateTime = () => {
        const now = new Date();
        const offset = now.getTimezoneOffset();
        const localNow = new Date(
            now.getTime() - offset * 60 * 1000
        );
        return localNow.toISOString().slice(0, 16);
    };

    // HANDLE OPTION CHANGE
    const handleOptionChange = (index, value) => {
        const updated = [...options];
        updated[index] = value;
        setOptions(updated);
    };

    // ADD OPTION
    const addOption = () => {
        if (options.length < 6) {
            setOptions([...options, ""]);
        }
    };

    // REMOVE OPTION
    const removeOption = (index) => {
        if (options.length <= 2) return;
        setOptions(
            options.filter((_, i) => i !== index)
        );
    };

    // CREATE POLL
    const handleSubmit = async () => {

        let errorMsg = "";

        const trimmedQuestion = question.trim();

        const trimmedOptions = options.map((opt) =>
            opt.trim()
        );

        if (!trimmedQuestion) {
            errorMsg = "Poll question is required";
        } else if (
            trimmedOptions.some((opt) => !opt)
        ) {
            errorMsg = "All options must be filled";
        } else if (
            new Set(trimmedOptions).size !==
            trimmedOptions.length
        ) {
            errorMsg =
                "Duplicate options are not allowed";
        } else if (!expiry) {
            errorMsg =
                "Expiry date & time is required";
        } else if (
            new Date(expiry) <= new Date()
        ) {
            errorMsg =
                "Expiry must be future date & time";
        }

        if (errorMsg) {
            setErrors(errorMsg);
            return;
        }

        setErrors("");

        try {

            setLoading(true);

            const payload = {
                question: trimmedQuestion,
                options: trimmedOptions,
                expiry: new Date(expiry).toISOString(),
            };

            const res = await axiosInstance.post(
                API_PATHS.POLLS.CREATE_POLL,
                payload
            );

            const createdPoll =
                res?.data?.poll || res?.data;

            const normalizedPoll = {
                ...createdPoll,
                options: Array.isArray(
                    createdPoll?.options
                )
                    ? createdPoll.options.map((opt) =>
                        typeof opt === "string"
                            ? { text: opt }
                            : opt
                    )
                    : [],
            };

            onSuccess(normalizedPoll);

            setQuestion("");
            setOptions(["", ""]);
            setExpiry("");

            onClose();

        } catch (err) {

            console.log(err);

            setErrors(
                err?.response?.data?.message ||
                "Failed to create poll"
            );

        } finally {

            setLoading(false);
        }
    };

    const optionLabels = [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
    ];

    return (

        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-zinc-950/85 backdrop-blur-md animate-fadeIn">

            {/* MODAL WRAPPER (Restricted Max Height to 80vh to Avoid Cuts) */}
            <div className="relative w-full max-w-2xl max-h-[80vh] flex flex-col bg-zinc-950/90 backdrop-blur-3xl border border-white/10 rounded-[1.75rem] sm:rounded-[2.25rem] shadow-[0_25px_70px_rgba(0,0,0,0.95)] animate-modalPop overflow-hidden">

                {/* Top Ambient Cyber Glow Line */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(56,189,248,0.8)]"></div>

                {/* HEADER */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/5 shrink-0">

                    <div className="flex items-center gap-3 min-w-0">

                        <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 shadow-inner">
                            <BarChart3
                                size={20}
                                className="text-cyan-400 sm:w-[20px] sm:h-[20px]"
                            />
                        </div>

                        <div className="min-w-0">

                            <h2 className="text-base sm:text-lg font-mono font-black text-white truncate tracking-wide">
                                Create New Poll
                            </h2>

                            <p className="text-[11px] sm:text-xs font-mono text-zinc-400 mt-0.5 truncate">
                                Create polls and collect votes
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="cursor-pointer h-8 w-8 sm:h-9 sm:w-9 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 transition-all duration-200 flex items-center justify-center shrink-0 shadow-inner"
                    >
                        <X
                            size={16}
                            className="text-zinc-400 hover:text-white"
                        />
                    </button>
                </div>

                {/* BODY (Scrollable Area Fix) */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 custom-scrollbar">

                    <div className="space-y-4 sm:space-y-5">

                        {/* QUESTION */}
                        <div>

                            <label className="text-xs font-mono font-bold text-zinc-300 block mb-1.5 uppercase tracking-wider">
                                Poll Question
                            </label>

                            <textarea
                                rows={2}
                                value={question}
                                onChange={(e) =>
                                    setQuestion(
                                        e.target.value
                                    )
                                }
                                placeholder="Ask your poll question..."
                                className="w-full px-4 py-2.5 rounded-2xl border border-white/10 bg-zinc-900/80 outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 resize-none text-xs sm:text-sm font-mono text-white placeholder-zinc-600 transition-all shadow-inner"
                            />
                        </div>

                        {/* OPTIONS */}
                        <div>

                            <div className="flex items-center justify-between mb-2">

                                <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
                                    Poll Options
                                </label>

                                <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded-md">
                                    {options.length}/6
                                </span>
                            </div>

                            {/* OPTIONS WRAPPER */}
                            <div className="space-y-2.5">

                                {options.map((opt, index) => (

                                    <div
                                        key={index}
                                        className="border border-white/5 bg-zinc-900/50 rounded-2xl px-3 py-2 flex items-center gap-3 hover:border-white/20 transition-all duration-200 shadow-inner group"
                                    >

                                        <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-[10px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-mono font-black shrink-0">
                                            {optionLabels[index]}
                                        </div>

                                        <input
                                            type="text"
                                            value={opt}
                                            onChange={(e) =>
                                                handleOptionChange(
                                                    index,
                                                    e.target.value
                                                )
                                            }
                                            placeholder={`Option ${index + 1}`}
                                            className="flex-1 bg-transparent outline-none text-xs sm:text-sm font-mono text-white placeholder-zinc-600 min-w-0"
                                        />

                                        {options.length > 2 && (

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeOption(index)
                                                }
                                                className="cursor-pointer h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 flex items-center justify-center transition-all duration-200 shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
                                            >
                                                <Trash2 size={13} className="sm:w-[14px] sm:h-[14px]" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* ADD OPTION */}
                            {options.length < 6 && (

                                <button
                                    type="button"
                                    onClick={addOption}
                                    className="cursor-pointer mt-3 h-10 w-full rounded-xl border border-dashed border-white/20 bg-zinc-900/30 hover:bg-zinc-900 hover:border-cyan-500/50 text-cyan-400 transition-all duration-200 text-[11px] sm:text-xs font-mono font-bold flex items-center justify-center gap-1.5"
                                >

                                    <Plus size={14} className="stroke-[3]" />

                                    Add Option
                                </button>
                            )}
                        </div>

                        {/* EXPIRY */}
                        <div>

                            <label className="text-xs font-mono font-bold text-zinc-300 block mb-1.5 uppercase tracking-wider">
                                Expiry Date & Time
                            </label>

                            <div className="relative">

                                <CalendarClock
                                    size={15}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none sm:w-[16px] sm:h-[16px]"
                                />

                                <input
                                    type="datetime-local"
                                    value={expiry}
                                    min={getMinDateTime()}
                                    onChange={(e) =>
                                        setExpiry(
                                            e.target.value
                                        )
                                    }
                                    className="w-full h-10 sm:h-11 pl-10 pr-4 rounded-xl border border-white/10 bg-zinc-900/80 outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 text-xs sm:text-sm font-mono text-white transition-all shadow-inner [color-scheme:dark]"
                                />
                            </div>
                        </div>

                        {/* ERROR */}
                        {errors && (

                            <div className="border border-rose-500/20 bg-rose-500/10 rounded-xl px-4 py-2.5 text-[11px] sm:text-xs font-mono font-bold text-rose-400 animate-shake shadow-inner mt-3">
                                &gt; {errors}
                            </div>
                        )}
                    </div>
                </div>

                {/* FOOTER */}
                <div className="border-t border-white/5 px-4 sm:px-6 py-3 sm:py-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 shrink-0">

                    <button
                        onClick={onClose}
                        className="cursor-pointer h-10 sm:h-10 px-5 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 transition-all duration-200 text-[11px] sm:text-xs font-mono font-bold text-zinc-300 hover:text-white shadow-inner"
                    >
                        Cancel
                    </button>

                    <div className="relative group cursor-pointer w-full sm:w-auto">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="relative cursor-pointer w-full sm:w-auto h-10 sm:h-10 px-6 rounded-xl bg-zinc-950 hover:bg-zinc-900 disabled:opacity-70 transition-all duration-300 text-white text-[11px] sm:text-xs font-mono font-bold flex items-center justify-center gap-1.5 border border-white/10 shadow-lg active:scale-95"
                        >

                            {loading ? (
                                <>
                                    <Loader2
                                        size={14}
                                        className="animate-spin text-cyan-400 sm:w-[15px] sm:h-[15px]"
                                    />

                                    Creating...
                                </>
                            ) : (
                                <>
                                    <BarChart3 size={14} className="text-cyan-400 sm:w-[15px] sm:h-[15px]" />

                                    Create Poll
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* ANIMATIONS + SCROLLBAR */}
            <style>
                {`
                    @keyframes modalPop {
                        from {
                            opacity: 0;
                            transform: scale(0.96) translateY(10px);
                        }
                        to {
                            opacity: 1;
                            transform: scale(1) translateY(0);
                        }
                    }

                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                        }
                        to {
                            opacity: 1;
                        }
                    }

                    @keyframes shake {
                        0%, 100% {
                            transform: translateX(0);
                        }
                        25% {
                            transform: translateX(-4px);
                        }
                        75% {
                            transform: translateX(4px);
                        }
                    }

                    .animate-modalPop {
                        animation: modalPop .25s ease;
                    }

                    .animate-fadeIn {
                        animation: fadeIn .2s ease;
                    }

                    .animate-shake {
                        animation: shake .25s ease;
                    }

                    .custom-scrollbar::-webkit-scrollbar {
                        width: 4px;
                    }

                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 999px;
                    }

                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }

                    .custom-scrollbar {
                        scrollbar-width: thin;
                        scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
                    }
                `}
            </style>
        </div>
    );
};

export default CreatePollModal;