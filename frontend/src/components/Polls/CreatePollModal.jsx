import React, { useState } from "react";
import { X, Plus, Trash2, BarChart3, CalendarClock, HelpCircle, CheckCircle2, Loader2 } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";

const CreatePollModal = ({ onClose, onSuccess }) => {
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState(["", ""]);
    const [expiry, setExpiry] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState("");
    const [focusedOption, setFocusedOption] = useState(null);

    // ✅ Get current datetime in "YYYY-MM-DDTHH:MM" format for min attribute
    const getMinDateTime = () => {
        const now = new Date();
        const offset = now.getTimezoneOffset();
        const localNow = new Date(now.getTime() - offset * 60 * 1000);
        return localNow.toISOString().slice(0, 16);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let errorMsg = "";

        const trimmedQuestion = question.trim();
        const trimmedOptions = options.map((opt) => opt.trim());

        if (!trimmedQuestion) {
            errorMsg = "Question is required";
        } else if (trimmedOptions.some((opt) => !opt)) {
            errorMsg = "All options must be filled";
        } else if (new Set(trimmedOptions).size !== trimmedOptions.length) {
            errorMsg = "Duplicate options are not allowed";
        } else if (!expiry) {
            errorMsg = "Expiry date & time is required";
        } else if (new Date(expiry) <= new Date()) {
            errorMsg = "Expiry must be a future date & time";
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

            const createdPoll = res?.data?.poll || res?.data;

            const normalizedPoll = {
                ...createdPoll,
                options: Array.isArray(createdPoll?.options)
                    ? createdPoll.options.map((opt) =>
                        typeof opt === "string" ? { text: opt } : opt
                    )
                    : [],
            };

            onSuccess(normalizedPoll);
            setQuestion("");
            setOptions(["", ""]);
            setExpiry("");
            onClose();
        } catch (err) {
            console.error("Create Poll Error:", err);
            setErrors(
                err?.response?.data?.message || "Failed to create poll. Try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleOptionChange = (index, value) => {
        const updated = [...options];
        updated[index] = value;
        setOptions(updated);
    };

    const addOption = () => {
        if (options.length < 26) setOptions([...options, ""]);
    };

    const removeOption = (index) => {
        if (options.length <= 2) return;
        setOptions(options.filter((_, i) => i !== index));
    };

    // Progress tracking
    const filledQuestion = question.trim().length > 0;
    const filledOptions = options.filter((o) => o.trim()).length >= 2;
    const filledExpiry = expiry !== "";
    const completedSteps = [filledQuestion, filledOptions, filledExpiry].filter(Boolean).length;
    const progressPercent = Math.round((completedSteps / 3) * 100);

    const optionLabels = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    const baseColors = [
        "bg-blue-500", "bg-violet-500", "bg-emerald-500", "bg-amber-500",
        "bg-rose-500", "bg-cyan-500", "bg-orange-500", "bg-pink-500",
        "bg-teal-500", "bg-indigo-500",
    ];
    const optionColors = optionLabels.map((_, i) => baseColors[i % baseColors.length]);

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-end sm:items-center z-50 px-0 sm:px-4"
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                {/* Modal */}
                <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl relative modal-enter overflow-hidden">

                    {/* ── Gradient Header ── */}
                    <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-violet-600 px-6 pt-6 pb-5">

                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/35 text-white transition-all duration-200 hover:scale-110 cursor-pointer"
                        >
                            <X size={16} />
                        </button>

                        {/* Icon + Title */}
                        <div className="flex items-center gap-3 mb-4 pr-10">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                                <BarChart3 size={20} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white leading-tight">
                                    Create New Poll
                                </h2>
                                <p className="text-blue-100 text-xs mt-0.5">
                                    Fill all steps to launch your poll
                                </p>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-1.5 bg-white/25 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-white rounded-full transition-all duration-500"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                            <span className="text-xs text-white/80 font-medium shrink-0">
                                {completedSteps}/3 done
                            </span>
                        </div>
                    </div>

                    {/* ── Scrollable Body ── */}
                    <div className="px-6 py-5 space-y-5 max-h-[62vh] overflow-y-auto">

                        {/* ── Step 1: Question ── */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 ${filledQuestion ? "bg-blue-500" : "bg-gray-200"}`}>
                                    {filledQuestion
                                        ? <CheckCircle2 size={12} className="text-white" />
                                        : <HelpCircle size={12} className="text-gray-400" />
                                    }
                                </div>
                                <label className="text-sm font-semibold text-gray-700">
                                    Your Question
                                </label>
                            </div>
                            <textarea
                                rows={2}
                                placeholder="What would you like to ask? e.g. Which feature should we build next?"
                                className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200 resize-none placeholder-gray-400 text-gray-800"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                            />
                        </div>

                        {/* ── Step 2: Options ── */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 ${filledOptions ? "bg-blue-500" : "bg-gray-200"}`}>
                                        {filledOptions
                                            ? <CheckCircle2 size={12} className="text-white" />
                                            : <span className="text-gray-400 text-xs font-bold">2</span>
                                        }
                                    </div>
                                    <label className="text-sm font-semibold text-gray-700">
                                        Options
                                    </label>
                                </div>
                                <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                                    {options.length}/26
                                </span>
                            </div>

                            <div className="space-y-2.5">
                                {options.map((opt, index) => (
                                    <div
                                        key={index}
                                        className={`flex items-center gap-2.5 rounded-xl border transition-all duration-200 px-3 py-2.5
                                            ${focusedOption === index
                                                ? "border-blue-300 bg-blue-50/60 shadow-sm"
                                                : "border-gray-200 bg-gray-50 hover:border-gray-300"
                                            }`}
                                    >
                                        {/* Colored label badge */}
                                        <span className={`w-6 h-6 rounded-lg ${optionColors[index]} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                                            {optionLabels[index]}
                                        </span>

                                        <input
                                            placeholder={`Option ${index + 1}`}
                                            className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
                                            value={opt}
                                            onFocus={() => setFocusedOption(index)}
                                            onBlur={() => setFocusedOption(null)}
                                            onChange={(e) => handleOptionChange(index, e.target.value)}
                                        />

                                        {options.length > 2 && (
                                            <button
                                                type="button"
                                                onClick={() => removeOption(index)}
                                                className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-150 cursor-pointer shrink-0"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Add option button */}
                            {options.length < 26 && (
                                <button
                                    type="button"
                                    onClick={addOption}
                                    className="flex items-center gap-2 text-blue-600 mt-3 text-sm font-medium cursor-pointer hover:text-blue-700 transition-all group"
                                >
                                    <div className="w-6 h-6 rounded-lg border-2 border-dashed border-blue-300 flex items-center justify-center group-hover:border-blue-500 group-hover:bg-blue-50 transition-all duration-200">
                                        <Plus size={13} />
                                    </div>
                                    Add another option
                                </button>
                            )}
                        </div>

                        {/* ── Step 3: Expiry ── */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 ${filledExpiry ? "bg-blue-500" : "bg-gray-200"}`}>
                                    {filledExpiry
                                        ? <CheckCircle2 size={12} className="text-white" />
                                        : <CalendarClock size={12} className="text-gray-400" />
                                    }
                                </div>
                                <label className="text-sm font-semibold text-gray-700">
                                    Poll Closes At
                                </label>
                            </div>

                            <div className="relative">
                                <CalendarClock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                                <input
                                    type="datetime-local"
                                    className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200 text-gray-800"
                                    value={expiry}
                                    min={getMinDateTime()}
                                    onChange={(e) => setExpiry(e.target.value)}
                                />
                            </div>

                            {/* Date preview */}
                            {expiry && (
                                <div className="mt-2 flex items-center gap-2 text-xs text-blue-600 font-medium bg-blue-50 border border-blue-100 px-3 py-2 rounded-lg">
                                    <CalendarClock size={13} className="shrink-0" />
                                    <span>
                                        Closes on{" "}
                                        <span className="font-bold">
                                            {new Date(expiry).toLocaleString("en-IN", {
                                                weekday: "short",
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                hour12: true,
                                            })}
                                        </span>
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* ── Error Message ── */}
                        {errors && (
                            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                                <X size={15} className="shrink-0" />
                                <span>{errors}</span>
                            </div>
                        )}
                    </div>

                    {/* ── Footer ── */}
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/80 flex items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-200 bg-gray-100 transition-all duration-200 cursor-pointer active:scale-95"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 cursor-pointer
                                ${loading
                                    ? "bg-blue-400 cursor-not-allowed"
                                    : "bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 active:scale-95 shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300"
                                }`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <BarChart3 size={16} />
                                    Launch Poll
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Animations */}
            <style>{`
                .modal-enter {
                    animation: modalSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                @keyframes modalSlideUp {
                    from { transform: translateY(40px); opacity: 0; }
                    to   { transform: translateY(0);    opacity: 1; }
                }
                @media (min-width: 640px) {
                    .modal-enter {
                        animation: modalScale 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
                    }
                    @keyframes modalScale {
                        from { transform: scale(0.92); opacity: 0; }
                        to   { transform: scale(1);    opacity: 1; }
                    }
                }
            `}</style>
        </>
    );
};

export default CreatePollModal;