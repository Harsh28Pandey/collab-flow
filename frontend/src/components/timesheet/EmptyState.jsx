import React from "react";
import { FileX2 } from "lucide-react";

const EmptyState = () => {

    return (

        <div className="flex flex-col items-center justify-center py-20">

            <FileX2
                size={70}
                className="text-gray-300"
            />

            <h2 className="text-xl font-semibold mt-5">

                No Timesheets Found

            </h2>

            <p className="text-gray-500 mt-2">

                Try another search or create a new timesheet.

            </p>

        </div>

    );

};

export default EmptyState;