import React from "react";

const SkeletonCard = () => {
    return (
        <div className="border border-gray-200 rounded-3xl p-4 sm:p-5 animate-pulse">

            {/* TOP ROW — avatar, name, status badge */}
            <div className="flex items-start justify-between gap-3">

                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-11 w-11 rounded-full bg-gray-200 shrink-0" />

                    <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-3.5 w-32 rounded-full bg-gray-200" />
                        <div className="h-3 w-40 rounded-full bg-gray-100" />
                    </div>
                </div>

                <div className="h-7 w-20 rounded-full bg-gray-200 shrink-0" />
            </div>

            {/* DETAILS GRID — date / project / hours / overtime */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-gray-50 rounded-2xl p-3 space-y-2">
                        <div className="h-2.5 w-12 rounded-full bg-gray-200" />
                        <div className="h-3.5 w-16 rounded-full bg-gray-200" />
                    </div>
                ))}
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <div className="flex-1 h-10 rounded-2xl bg-gray-200" />
                <div className="flex-1 h-10 rounded-2xl bg-gray-100" />
            </div>
        </div>
    );
};

const TimesheetSkeleton = () => {

    return (

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {[...Array(6)].map((_, index) => (
                <SkeletonCard key={index} />
            ))}

        </div>

    );

};

export default TimesheetSkeleton;