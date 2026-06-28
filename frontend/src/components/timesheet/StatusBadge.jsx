import React from "react";

const colors = {
    Pending:
        "bg-yellow-100 text-yellow-700",

    Approved:
        "bg-green-100 text-green-700",

    Rejected:
        "bg-red-100 text-red-700",
};

const StatusBadge = ({ status }) => {

    return (

        <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status]}`}
        >
            {status}
        </span>

    );

};

export default StatusBadge;