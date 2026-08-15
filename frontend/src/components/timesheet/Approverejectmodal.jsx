import React, { useState } from "react";
import { X, CheckCircle2, XCircle, Loader2 } from "lucide-react";

const ApproveRejectModal = ({ open, mode, onClose, onConfirm }) => {

    // mode: "approve" | "reject"
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    if (!open) return null;

    const isReject = mode === "reject";

    const handleClose = () => {
        if (submitting) return;
        setReason("");
        setError("");
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!reason.trim()) {
            setError(
                isReject
                    ? "Reject reason is required"
                    : "Approve reason is required"
            );
            return;
        }

        setError("");

        try {
            setSubmitting(true);
            await onConfirm(reason.trim());
            setReason("");
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                `Failed to ${isReject ? "reject" : "approve"} timesheet`
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">

            {/* MODAL WRAPPER */}
            <div className="relative w-full max-w-md bg-zinc-950/90 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden animate-modalPop">

                {/* Top Ambient Cyber Glow Line */}
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-28 h-1 bg-gradient-to-r from-transparent ${isReject ? 'via-rose-500' : 'via-emerald-400'} to-transparent shadow-[0_0_15px_${isReject ? 'rgba(244,63,94,0.8)' : 'rgba(52,211,153,0.8)'}]`}></div>

                {/* HEADER */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">

                    <div className="flex items-center gap-3">
                        <div
                            className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner ${isReject
                                ? "bg-rose-500/10 border-rose-500/25 text-rose-400"
                                : "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                                }`}
                        >
                            {isReject ? (
                                <XCircle size={22} className="stroke-[2.5]" />
                            ) : (
                                <CheckCircle2 size={22} className="stroke-[2.5]" />
                            )}
                        </div>

                        <h2 className="text-base sm:text-lg font-mono font-black text-white tracking-wide">
                            {isReject ? "Reject Timesheet" : "Approve Timesheet"}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="cursor-pointer h-9 w-9 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 transition-all duration-200 flex items-center justify-center shadow-inner text-zinc-400 hover:text-white"
                    >
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">

                    <div>
                        <label className="text-xs font-mono font-bold text-zinc-300 block mb-2 uppercase tracking-wider">
                            {isReject ? "Reason for rejection" : "Reason for approval"}
                        </label>

                        <textarea
                            rows={4}
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                setError("");
                            }}
                            placeholder={
                                isReject
                                    ? "Explain why this timesheet is being rejected..."
                                    : "Add a note for this approval..."
                            }
                            className={`w-full px-4 py-3 rounded-2xl border focus:outline-none focus:ring-2 text-xs sm:text-sm font-mono resize-none transition-all shadow-inner [color-scheme:dark] ${error
                                ? "border-rose-500/50 focus:ring-rose-500/50 bg-rose-500/5 text-white"
                                : "border-white/10 bg-zinc-900/80 focus:ring-cyan-500/50 focus:border-cyan-400 text-white placeholder-zinc-600"
                                }`}
                        />

                        {error && (
                            <p className="text-[10px] font-mono text-rose-400 mt-1.5 font-bold">
                                &gt; {error}
                            </p>
                        )}
                    </div>

                    {isReject && (
                        <div className="border border-rose-500/20 bg-rose-500/10 rounded-2xl px-4 py-3 text-xs font-mono font-bold text-rose-400 shadow-inner">
                            &gt; This will permanently delete the timesheet from the database. This action cannot be undone.
                        </div>
                    )}

                    {/* FOOTER */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-3">

                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={submitting}
                            className="cursor-pointer h-11 px-5 rounded-2xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 transition-all text-xs sm:text-sm font-mono font-bold text-zinc-300 hover:text-white shadow-inner flex-1"
                        >
                            Cancel
                        </button>

                        <div className="relative group cursor-pointer flex-1">
                            <div className={`absolute -inset-0.5 bg-gradient-to-r ${isReject ? 'from-rose-500 to-orange-600' : 'from-emerald-500 to-cyan-600'} rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-300`}></div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`relative cursor-pointer w-full h-11 px-5 rounded-2xl disabled:opacity-70 transition-all text-white text-xs sm:text-sm font-mono font-bold flex items-center justify-center gap-2 border border-white/10 shadow-lg active:scale-95 ${isReject
                                    ? "bg-rose-950 hover:bg-rose-900"
                                    : "bg-emerald-950 hover:bg-emerald-900"
                                    }`}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 size={16} className={`animate-spin ${isReject ? 'text-rose-400' : 'text-emerald-400'}`} />
                                        {isReject ? "Rejecting..." : "Approving..."}
                                    </>
                                ) : (
                                    <>
                                        {isReject ? (
                                            <XCircle size={16} className="text-rose-400" />
                                        ) : (
                                            <CheckCircle2 size={16} className="text-emerald-400" />
                                        )}
                                        {isReject ? "Reject Timesheet" : "Approve Timesheet"}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>

                <style>
                    {`
                        @keyframes modalPop {
                            from { opacity: 0; transform: scale(0.96) translateY(10px); }
                            to { opacity: 1; transform: scale(1) translateY(0); }
                        }
                        @keyframes fadeIn {
                            from { opacity: 0; }
                            to { opacity: 1; }
                        }
                        .animate-modalPop { animation: modalPop .25s ease; }
                        .animate-fadeIn { animation: fadeIn .2s ease; }
                    `}
                </style>
            </div>
        </div>
    );
};

export default ApproveRejectModal;