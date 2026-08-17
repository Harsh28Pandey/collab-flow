import React from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";

const MyProjects = () => {
    return (
        <DashboardLayout activeMenu="My Projects">

            <div className="bg-zinc-950/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 p-10 min-h-[500px] flex flex-col items-center justify-center text-center shadow-[0_15px_50px_rgba(0,0,0,0.6)]">

                <h1 className="text-3xl sm:text-4xl font-mono font-black text-white mb-3 tracking-tight">
                    My Projects Page
                </h1>

                <p className="text-zinc-400 font-mono text-xs sm:text-sm max-w-md leading-relaxed">
                    This page is currently under development.
                    Upcoming calendar features and scheduling tools
                    will be available soon.
                </p>
            </div>

        </DashboardLayout>
    );
};

export default MyProjects;