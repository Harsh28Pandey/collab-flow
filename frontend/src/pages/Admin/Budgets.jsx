import React from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";

const Budgets = () => {
    return (
        <DashboardLayout activeMenu="Budgets">

            <div className="bg-white rounded-3xl border border-gray-200 p-10 min-h-[500px] flex flex-col items-center justify-center text-center">

                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    Budgets Page
                </h1>

                <p className="text-gray-500 text-sm max-w-md">
                    This page is currently under development.
                    Upcoming calendar features and scheduling tools
                    will be available soon.
                </p>
            </div>

        </DashboardLayout>
    );
};

export default Budgets;