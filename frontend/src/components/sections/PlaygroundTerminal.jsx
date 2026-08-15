import React, { useState } from "react";
import { LuTerminal, LuPlay, LuRefreshCw, LuCheck, LuWorkflow, LuGitMerge } from "react-icons/lu";

const PlaygroundTerminal = ({ onCommandExecute }) => {
    const [command, setCommand] = useState("collab.sync({ speed: 'realtime' })");
    const [outputLogs, setOutputLogs] = useState([
        { type: "system", text: "Initializing Collab Flow v2.0 Sandbox Environment..." },
        { type: "success", text: "Connected to secure edge cluster (latency: <5ms)." },
        { type: "info", text: "Type or select a command below to execute test pipeline." }
    ]);
    const [isExecuting, setIsExecuting] = useState(false);

    const quickCommands = [
        { label: "Sync Workspace", cmd: "collab.sync({ speed: 'realtime' })" },
        { label: "Run Pipeline", cmd: "npx collab orchestrate --auto" },
        { label: "Security Audit", cmd: "AUTH_MODE=strict collab secure" },
        { label: "Deploy Cluster", cmd: "collab cluster --region global" }
    ];

    const handleRunCommand = (e) => {
        e.preventDefault();
        if (!command.trim() || isExecuting) return;

        setIsExecuting(true);
        setOutputLogs(prev => [...prev, { type: "command", text: `> ${command}` }]);

        setTimeout(() => {
            let response;
            if (command.includes("sync")) {
                response = { type: "success", text: "[SUCCESS] Sub-millisecond state synchronization established across 14 nodes." };
            } else if (command.includes("orchestrate")) {
                response = { type: "success", text: "[SUCCESS] Pipeline triggered. 0 merge conflicts found. Team velocity optimized." };
            } else if (command.includes("secure")) {
                response = { type: "success", text: "[SUCCESS] End-to-end encryption verified. Role-based access control active." };
            } else {
                response = { type: "success", text: "[SUCCESS] Command executed successfully. Workspace status: OPTIMAL." };
            }

            setOutputLogs(prev => [...prev, response]);
            setIsExecuting(false);
            if (onCommandExecute) onCommandExecute(command);
        }, 600);
    };

    const handleClear = () => {
        setOutputLogs([
            { type: "system", text: "Console cleared. Ready for new instructions." }
        ]);
    };

    return (
        <div className="relative w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 items-center justify-items-center py-8 px-4 gap-6">

            {/* Left Floating Developer Node (Column 1-3) */}
            <div className="hidden lg:flex lg:col-span-3 w-full max-w-[270px] bg-zinc-900/40 backdrop-blur-3xl border border-white/5 shadow-[0_15px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-2xl p-4 flex-col animate-[floatSlow_8s_ease-in-out_infinite] -rotate-2 hover:border-cyan-500/30 transition-colors cursor-default pointer-events-none justify-self-start">
                <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-3">
                    <LuWorkflow className="text-cyan-400" size={16} />
                    <span className="text-[11px] font-mono text-zinc-400 tracking-wider">terminal_core.ts</span>
                </div>
                <div className="font-mono text-[11.5px] text-zinc-300 text-left leading-relaxed">
                    <span className="text-pink-400">const</span> <span className="text-cyan-300">sandbox</span> = <span className="text-blue-400">new</span> <span className="text-yellow-200">Terminal</span>({'{'}<br />
                    &nbsp;&nbsp;<span className="text-cyan-200">mode</span>: <span className="text-green-400">'interactive'</span>,<br />
                    &nbsp;&nbsp;<span className="text-cyan-200">buffer</span>: <span className="text-green-400">'unlimited'</span><br />
                    {'}'});
                </div>
            </div>

            {/* Main Terminal Window (Column 4-9 / Centered) */}
            <div className="w-full lg:col-span-6 max-w-2xl bg-zinc-950/90 backdrop-blur-3xl rounded-2xl border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden text-left animate-[fadeIn_0.4s_ease-out] z-10">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                    </div>
                    <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
                        <LuTerminal size={12} className="text-cyan-400" />
                        <span>collab_sandbox_cli ~ x86_64</span>
                    </div>
                    <button
                        onClick={handleClear}
                        className="cursor-pointer text-zinc-500 hover:text-zinc-300 transition-colors text-xs font-mono flex items-center gap-1"
                    >
                        <LuRefreshCw size={11} /> Clear
                    </button>
                </div>

                <div className="flex flex-wrap gap-2 px-4 py-3 bg-zinc-900/30 border-b border-white/5">
                    <span className="text-[11px] font-mono text-zinc-500 self-center mr-1">Presets:</span>
                    {quickCommands.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCommand(item.cmd)}
                            className="cursor-pointer text-[11px] font-mono bg-zinc-900 border border-white/5 hover:border-cyan-500/30 text-zinc-300 px-3 py-1 rounded-lg transition-colors"
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="p-5 font-mono text-[13px] h-[260px] overflow-y-auto space-y-2.5 bg-black/40">
                    {outputLogs.map((log, index) => (
                        <div key={index} className="leading-relaxed">
                            {log.type === "system" && <span className="text-zinc-500"># {log.text}</span>}
                            {log.type === "info" && <span className="text-blue-400">i {log.text}</span>}
                            {log.type === "command" && <span className="text-cyan-300 font-bold">{log.text}</span>}
                            {log.type === "success" && (
                                <span className="text-green-400 flex items-center gap-1.5 mt-1">
                                    <LuCheck size={14} className="flex-shrink-0" /> {log.text}
                                </span>
                            )}
                        </div>
                    ))}
                    {isExecuting && (
                        <div className="text-yellow-400 animate-pulse flex items-center gap-2">
                            <LuRefreshCw size={13} className="animate-spin" /> Executing command on cluster...
                        </div>
                    )}
                </div>

                <form onSubmit={handleRunCommand} className="flex items-center gap-2 p-3 bg-zinc-900/60 border-t border-white/5">
                    <span className="text-cyan-400 font-mono font-bold pl-2">&gt;</span>
                    <input
                        type="text"
                        value={command}
                        onChange={(e) => setCommand(e.target.value)}
                        placeholder="Type a collab command..."
                        className="w-full bg-transparent font-mono text-sm text-zinc-100 focus:outline-none placeholder:text-zinc-600"
                    />
                    <button
                        type="submit"
                        disabled={isExecuting}
                        className="cursor-pointer flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold font-mono text-xs rounded-xl shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all active:scale-95 disabled:opacity-50"
                    >
                        <LuPlay size={13} /> Run
                    </button>
                </form>
            </div>

            {/* Right Floating Developer Node (Column 10-12) */}
            <div className="hidden lg:flex lg:col-span-3 w-full max-w-[250px] bg-zinc-900/40 backdrop-blur-3xl border border-white/5 shadow-[0_15px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-2xl p-4 flex-col animate-[floatSlow_9s_ease-in-out_infinite_1s] rotate-2 hover:border-purple-500/30 transition-colors cursor-default pointer-events-none justify-self-end">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[10px] bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                        <LuGitMerge className="text-cyan-400" size={20} />
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-sm font-bold text-zinc-100">Edge Cluster</span>
                        <div className="flex items-center gap-1.5 mt-1">
                            <div className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-green-500/20 text-green-400 shadow-[0_0_8px_rgba(34,197,94,0.4)]">
                                <LuCheck size={10} strokeWidth={3} />
                            </div>
                            <span className="text-[11px] text-zinc-400 font-medium tracking-wide">14 nodes active</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Animation Keyframes */}
            <style>{`
                @keyframes floatSlow {
                    0%, 100% { transform: translateY(0) rotate(var(--tw-rotate, 0deg)); }
                    50% { transform: translateY(-12px) rotate(var(--tw-rotate, 0deg)); }
                }
            `}</style>
        </div>
    );
};

export default PlaygroundTerminal;