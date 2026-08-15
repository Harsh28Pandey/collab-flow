import React, { useState } from "react";
import { LuWorkflow, LuCheck, LuArrowRight } from "react-icons/lu";

const PlaygroundWorkflowBuilder = () => {
    const [trigger, setTrigger] = useState("Git Push (main)");
    const [action, setAction] = useState("Auto-Run CI Tests");
    const [notif, setNotif] = useState("Slack & Discord");
    const [isSimulated, setIsSimulated] = useState(false);

    const handleSimulateWorkflow = () => {
        setIsSimulated(true);
        setTimeout(() => setIsSimulated(false), 2000);
    };

    return (
        <div className="w-full bg-zinc-950/90 backdrop-blur-3xl rounded-2xl border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9)] p-6 md:p-8 text-left animate-[fadeIn_0.4s_ease-out]">
            <div className="pb-6 border-b border-white/5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <LuWorkflow className="text-cyan-400" /> Visual Workflow Automation Builder
                </h3>
                <p className="text-xs text-zinc-400 font-mono mt-1">Configure event-driven triggers across your development pipeline.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 my-6 font-mono text-xs">
                <div className="bg-zinc-900/60 p-4 rounded-xl border border-white/5 flex flex-col gap-2">
                    <span className="text-zinc-500">1. Select Event Trigger:</span>
                    <select
                        value={trigger}
                        onChange={(e) => setTrigger(e.target.value)}
                        className="bg-zinc-950 text-cyan-300 p-2.5 rounded-lg border border-white/10 focus:outline-none cursor-pointer"
                    >
                        <option>Git Push (main)</option>
                        <option>Pull Request Opened</option>
                        <option>Task Status: Done</option>
                    </select>
                </div>

                <div className="bg-zinc-900/60 p-4 rounded-xl border border-white/5 flex flex-col gap-2">
                    <span className="text-zinc-500">2. Automated Action:</span>
                    <select
                        value={action}
                        onChange={(e) => setAction(e.target.value)}
                        className="bg-zinc-950 text-blue-300 p-2.5 rounded-lg border border-white/10 focus:outline-none cursor-pointer"
                    >
                        <option>Auto-Run CI Tests</option>
                        <option>Assign to Reviewer</option>
                        <option>Deploy to Staging Edge</option>
                    </select>
                </div>

                <div className="bg-zinc-900/60 p-4 rounded-xl border border-white/5 flex flex-col gap-2">
                    <span className="text-zinc-500">3. Team Notification:</span>
                    <select
                        value={notif}
                        onChange={(e) => setNotif(e.target.value)}
                        className="bg-zinc-950 text-purple-300 p-2.5 rounded-lg border border-white/10 focus:outline-none cursor-pointer"
                    >
                        <option>Slack & Discord</option>
                        <option>Email Digest Only</option>
                        <option>Webhook Trigger</option>
                    </select>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900/40 p-4 rounded-xl border border-white/5 font-mono text-xs">
                <div className="flex items-center gap-2 text-zinc-300">
                    <span className="text-cyan-400 font-bold">Flow:</span> [{trigger}] <LuArrowRight className="text-zinc-500" /> [{action}] <LuArrowRight className="text-zinc-500" /> [{notif}]
                </div>
                <button
                    onClick={handleSimulateWorkflow}
                    className="cursor-pointer px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all active:scale-95"
                >
                    {isSimulated ? "Simulating Pipeline..." : "Test Workflow Run"}
                </button>
            </div>
            {isSimulated && (
                <div className="mt-3 text-xs font-mono text-green-400 flex items-center gap-1.5">
                    <LuCheck size={14} /> Workflow successfully tested! Trigger routed and executed with 0 latency.
                </div>
            )}
        </div>
    );
};

export default PlaygroundWorkflowBuilder; 