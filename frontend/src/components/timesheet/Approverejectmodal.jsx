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
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">

            <div className="w-full max-w-md bg-white rounded-[26px] shadow-2xl overflow-hidden animate-[modalPop_.2s_ease]">

                {/* HEADER */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">

                    <div className="flex items-center gap-3">
                        <div
                            className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 ${isReject ? "bg-red-100" : "bg-green-100"
                                }`}
                        >
                            {isReject ? (
                                <XCircle size={22} className="text-red-600" />
                            ) : (
                                <CheckCircle2 size={22} className="text-green-600" />
                            )}
                        </div>

                        <h2 className="text-lg font-bold text-gray-900">
                            {isReject ? "Reject Timesheet" : "Approve Timesheet"}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="cursor-pointer h-10 w-10 rounded-2xl hover:bg-gray-100 transition flex items-center justify-center"
                    >
                        <X size={20} className="text-gray-600" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">

                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">
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
                            className={`w-full px-4 py-3 rounded-2xl border focus:outline-none focus:ring-2 text-sm resize-none ${error
                                    ? "border-red-300 focus:ring-red-400"
                                    : "border-gray-200 focus:ring-blue-500"
                                }`}
                        />

                        {error && (
                            <p className="text-xs text-red-600 mt-1.5">
                                {error}
                            </p>
                        )}
                    </div>

                    {isReject && (
                        <div className="border border-red-200 bg-red-50 rounded-2xl px-4 py-3 text-xs text-red-600">
                            This will permanently delete the timesheet from the database. This action cannot be undone.
                        </div>
                    )}

                    {/* FOOTER */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">

                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={submitting}
                            className="cursor-pointer h-11 px-5 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all text-sm font-medium text-gray-700 flex-1"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={submitting}
                            className={`cursor-pointer h-11 px-5 rounded-2xl disabled:opacity-70 transition-all text-white text-sm font-semibold flex items-center justify-center gap-2 flex-1 ${isReject
                                    ? "bg-red-600 hover:bg-red-700"
                                    : "bg-green-600 hover:bg-green-700"
                                }`}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 size={17} className="animate-spin" />
                                    {isReject ? "Rejecting..." : "Approving..."}
                                </>
                            ) : (
                                <>
                                    {isReject ? (
                                        <XCircle size={17} />
                                    ) : (
                                        <CheckCircle2 size={17} />
                                    )}
                                    {isReject ? "Reject Timesheet" : "Approve Timesheet"}
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <style>
                    {`
                        @keyframes modalPop {
                            from { opacity: 0; transform: scale(0.96); }
                            to { opacity: 1; transform: scale(1); }
                        }
                    `}
                </style>
            </div>
        </div>
    );
};

export default ApproveRejectModal;