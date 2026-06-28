import React from "react";
import {
    Eye,
    Check,
    X
} from "lucide-react";

const ActionButtons = ({
    row,
    onView,
    onApprove,
    onReject,
}) => {

    return (

        <div className="flex gap-2">

            <button
                onClick={() => onView(row)}
                className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
            >
                <Eye size={16} />
            </button>

            <button
                onClick={() => onApprove(row)}
                className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"
            >
                <Check size={16} />
            </button>

            <button
                onClick={() => onReject(row)}
                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
            >
                <X size={16} />
            </button>

        </div>

    );

};

export default ActionButtons;