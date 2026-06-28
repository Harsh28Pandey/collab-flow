import React from "react";

const SummaryCard = ({
    title,
    value,
    icon,
}) => {

    return (

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300">

            <div className="flex justify-between items-center">

                <div>

                    <p className="text-sm text-gray-500">

                        {title}

                    </p>

                    <h2 className="text-3xl font-bold text-gray-900 mt-2">

                        {value}

                    </h2>

                </div>

                <div className="bg-blue-50 rounded-xl p-4 text-blue-600">

                    {icon}

                </div>

            </div>

        </div>

    );

};

export default SummaryCard;