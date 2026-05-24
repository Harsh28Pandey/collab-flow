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

        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm overflow-y-auto animate-fadeIn">

            {/* MODAL WRAPPER */}
            <div className="min-h-screen flex items-center justify-center p-3 sm:p-5">

                {/* MODAL */}
                <div className="w-full max-w-2xl max-h-[95vh] bg-white rounded-[28px] shadow-2xl overflow-hidden animate-modalPop flex flex-col">

                    {/* HEADER */}
                    <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-gray-100 shrink-0">

                        <div className="flex items-center gap-3 min-w-0">

                            <div className="h-11 w-11 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">

                                <BarChart3
                                    size={22}
                                    className="text-blue-600"
                                />
                            </div>

                            <div className="min-w-0">

                                <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                                    Create New Poll
                                </h2>

                                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 truncate">
                                    Create polls and collect votes
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="cursor-pointer h-10 w-10 rounded-2xl hover:bg-gray-100 transition-all duration-200 flex items-center justify-center shrink-0"
                        >
                            <X
                                size={20}
                                className="text-gray-600"
                            />
                        </button>
                    </div>

                    {/* BODY */}
                    <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-5 custom-scrollbar">

                        <div className="space-y-5">

                            {/* QUESTION */}
                            <div>

                                <label className="text-sm font-semibold text-gray-700 block mb-2">
                                    Poll Question
                                </label>

                                <textarea
                                    rows={3}
                                    value={question}
                                    onChange={(e) =>
                                        setQuestion(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Ask your poll question..."
                                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm transition-all"
                                />
                            </div>

                            {/* OPTIONS */}
                            <div>

                                <div className="flex items-center justify-between mb-3">

                                    <label className="text-sm font-semibold text-gray-700">
                                        Poll Options
                                    </label>

                                    <span className="text-xs text-gray-400">
                                        {options.length}/6
                                    </span>
                                </div>

                                {/* OPTIONS WRAPPER */}
                                <div
                                    className={`
                                        space-y-3 transition-all duration-300
                                        ${options.length >= 5
                                            ? "max-h-[250px] overflow-y-auto pr-2 custom-scrollbar"
                                            : ""
                                        }
                                    `}
                                >

                                    {options.map((opt, index) => (

                                        <div
                                            key={index}
                                            className="border border-gray-200 rounded-2xl px-3 py-2.5 flex items-center gap-3 hover:border-blue-300 hover:bg-gray-50 transition-all duration-200"
                                        >

                                            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-sm font-semibold shrink-0">
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
                                                className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400"
                                            />

                                            {options.length > 2 && (

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeOption(index)
                                                    }
                                                    className="cursor-pointer h-9 w-9 rounded-xl hover:bg-red-50 text-red-500 flex items-center justify-center transition-all duration-200 shrink-0"
                                                >
                                                    <Trash2 size={15} />
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
                                        className="cursor-pointer mt-4 h-11 w-full rounded-2xl border border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 transition-all duration-200 text-sm font-semibold flex items-center justify-center gap-2"
                                    >

                                        <Plus size={17} />

                                        Add Option
                                    </button>
                                )}
                            </div>

                            {/* EXPIRY */}
                            <div>

                                <label className="text-sm font-semibold text-gray-700 block mb-2">
                                    Expiry Date & Time
                                </label>

                                <div className="relative">

                                    <CalendarClock
                                        size={17}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
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
                                        className="w-full h-11 pl-11 pr-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
                                    />
                                </div>
                            </div>

                            {/* ERROR */}
                            {errors && (

                                <div className="border border-red-200 bg-red-50 rounded-2xl px-4 py-3 text-sm text-red-600 animate-shake">
                                    {errors}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div className="border-t border-gray-100 px-4 sm:px-5 py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 shrink-0">

                        <button
                            onClick={onClose}
                            className="cursor-pointer h-11 px-5 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all duration-200 text-sm font-medium text-gray-700"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="cursor-pointer h-11 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-70 transition-all duration-200 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
                        >

                            {loading ? (
                                <>
                                    <Loader2
                                        size={17}
                                        className="animate-spin"
                                    />

                                    Creating...
                                </>
                            ) : (
                                <>
                                    <BarChart3 size={17} />

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
                        width: 6px;
                    }

                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #d1d5db;
                        border-radius: 999px;
                    }

                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }

                    .custom-scrollbar {
                        scrollbar-width: thin;
                        scrollbar-color: #d1d5db transparent;
                    }
                `}
            </style>
        </div>
    );
};

export default CreatePollModal;