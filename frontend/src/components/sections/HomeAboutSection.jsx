import React from "react";

const HomeAboutSection = () => {
    return (
        <section className="relative py-16 md:py-24 px-4 md:px-6 bg-zinc-950 text-zinc-100 overflow-hidden flex flex-col items-center font-sans">

            {/* Premium Developer Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_80%,transparent_100%)] opacity-60 pointer-events-none" />

            {/* Refined Ethereal Glows (Ambient lighting) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-tr from-blue-600/10 to-purple-600/10 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />

            <div className="relative z-10 max-w-4xl mx-auto text-center w-full">

                {/* Minimalist Developer Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-md mb-4 cursor-default animate-[fadeInDown_0.8s_ease-out_both]">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400"></span>
                    </span>
                    <span className="text-[10px] font-bold tracking-widest text-cyan-300 uppercase">
                        Platform Architecture
                    </span>
                </div>

                {/* Highly Refined Heading */}
                <h2 className="text-3xl md:text-5xl font-extrabold mb-8 text-white tracking-tight animate-[fadeInDown_0.8s_ease-out_0.1s_both]">
                    What is{" "}
                    <span className="relative inline-block px-1">
                        {/* Glow Behind Text */}
                        <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-[25px] opacity-30 rounded-full" />
                        {/* Gradient Text */}
                        <span className="relative bg-gradient-to-br from-cyan-300 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                            Collab Flow?
                        </span>
                    </span>
                </h2>

                {/* Developer Terminal UI Container */}
                <div className="relative mx-auto w-full max-w-3xl group animate-[fadeInUp_0.8s_ease-out_0.2s_both]">
                    {/* Ambient Glow behind Terminal */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition duration-500"></div>

                    <div className="relative bg-zinc-950/80 backdrop-blur-2xl rounded-2xl border border-white/5 shadow-[0_15px_40px_rgba(0,0,0,0.7)] overflow-hidden text-left">

                        {/* Terminal Header */}
                        <div className="flex items-center px-4 py-2.5 border-b border-white/5 bg-white/[0.02]">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80 shadow-[0_0_6px_rgba(239,68,68,0.5)]"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 shadow-[0_0_6px_rgba(234,179,8,0.5)]"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80 shadow-[0_0_6px_rgba(34,197,94,0.5)]"></div>
                            </div>
                            <div className="mx-auto text-[11px] font-mono text-zinc-500 tracking-wider">
                                collab_flow.config.ts
                            </div>
                        </div>

                        {/* Terminal Code Body */}
                        <div className="p-5 md:p-7 font-mono text-[12.5px] md:text-[14px] leading-relaxed overflow-x-auto scrollbar-hide">
                            <div className="text-zinc-300">
                                <span className="text-pink-400">import</span> {'{ '} <span className="text-cyan-300">Workspace</span> {' }'} <span className="text-pink-400">from</span> <span className="text-green-400">'@collab/core'</span>;
                            </div>
                            <br />
                            <div className="text-zinc-300">
                                <span className="text-blue-400">const</span> <span className="text-zinc-100">CollabFlow</span> <span className="text-pink-400">=</span> <span className="text-blue-400">new</span> <span className="text-yellow-200">Workspace</span>({'{'}
                            </div>
                            <div className="pl-4 md:pl-6 text-zinc-400">
                                <span className="text-cyan-200">mission:</span> <span className="text-green-400">"Eliminate context switching. 100% shipping."</span>,
                            </div>
                            <div className="pl-4 md:pl-6 text-zinc-400">
                                <span className="text-cyan-200">features:</span> {'['}
                            </div>
                            <div className="pl-8 md:pl-12 text-green-400">
                                'Real-time Project Sync',
                            </div>
                            <div className="pl-8 md:pl-12 text-green-400">
                                'Instant Code Execution',
                            </div>
                            <div className="pl-8 md:pl-12 text-green-400">
                                'Seamless Task Orchestration'
                            </div>
                            <div className="pl-4 md:pl-6 text-zinc-400">
                                {']'},
                            </div>
                            <div className="pl-4 md:pl-6 text-zinc-400">
                                <span className="text-cyan-200">performance:</span> <span className="text-purple-400">"Zero Lag"</span>,
                            </div>
                            <div className="pl-4 md:pl-6 text-zinc-400">
                                <span className="text-cyan-200">status:</span> <span className="text-green-400">"Ready to deploy"</span>
                            </div>
                            <div className="text-zinc-300">
                                {'}'});
                            </div>
                            <br />
                            <div className="text-zinc-300">
                                <span className="text-pink-400">export default</span> <span className="text-zinc-100">CollabFlow</span>;
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sophisticated Decorative Divider */}
                <div className="mt-12 flex items-center justify-center gap-4 opacity-80 animate-[fadeInUp_0.8s_ease-out_0.3s_both]">
                    <div className="h-[1px] w-20 bg-gradient-to-r from-transparent to-blue-500/80" />
                    <div className="relative flex items-center justify-center">
                        <div className="absolute w-5 h-5 bg-blue-500/30 rounded-full blur-md" />
                        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                    </div>
                    <div className="h-[1px] w-20 bg-gradient-to-l from-transparent to-purple-500/80" />
                </div>

            </div>

            {/* Premium Developer Keyframes */}
            <style>{`
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-15px); filter: blur(6px); }
                    to { opacity: 1; transform: translateY(0); filter: blur(0); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(15px); filter: blur(6px); }
                    to { opacity: 1; transform: translateY(0); filter: blur(0); }
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </section>
    );
};

export default HomeAboutSection;