// src/components/layouts/DashboardLayout.jsx
import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../context/userContext.jsx';
import Navbar from './Navbar.jsx';
import SideMenu from './SideMenu.jsx';

const DashboardLayout = ({ children, activeMenu }) => {

    const { user } = useContext(UserContext);
    const [scrolled, setScrolled] = useState(false);

    // Scroll Effect logic for floating glass bento Navbar
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="w-full min-h-screen bg-[#050505] text-zinc-100 overflow-x-hidden relative font-sans selection:bg-cyan-500/30 selection:text-cyan-100">

            {/* ========================================================= */}
            {/* NEXT-LEVEL DEVELOPER BACKGROUND ENVIRONMENT                 */}
            {/* ========================================================= */}

            {/* 1. Subtle Film Grain / Noise Overlay (Premium SaaS feel) */}
            <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>

            {/* 2. Cyber Mesh Grid (Fades out at bottom and edges) */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_100%)]" />
                {/* Secondary Micro Grid for depth */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:8px_8px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_0%,#000_60%,transparent_100%)]" />
            </div>

            {/* 3. Ambient Deep Architectural Glow Orbs (Color Dodge for realistic neon) */}
            <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-br from-cyan-500/10 via-blue-600/5 to-transparent blur-[120px] rounded-full pointer-events-none z-0 mix-blend-color-dodge" />
            <div className="fixed bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-gradient-to-tr from-purple-600/10 via-fuchsia-600/5 to-transparent blur-[120px] rounded-full pointer-events-none z-0 mix-blend-color-dodge" />

            {/* Center Core Glow (Subtle depth) */}
            <div className="fixed top-[20%] left-[50%] -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/5 blur-[150px] rounded-[100%] pointer-events-none z-0 mix-blend-screen" />

            {/* 4. Developer Data Streams (Glowing horizontal/vertical laser lines) */}
            <div className="fixed top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent z-0 opacity-50"></div>
            <div className="fixed top-0 left-[20%] w-[1px] h-screen bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent z-0"></div>
            <div className="fixed top-0 right-[20%] w-[1px] h-screen bg-gradient-to-b from-purple-500/10 via-transparent to-transparent z-0"></div>

            {/* ========================================================= */}
            {/* LAYOUT CONTENT                                            */}
            {/* ========================================================= */}

            {/* FIXED GLASSBAR WRAPPER (Edge-to-Edge at Top) */}
            <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none transition-all duration-300">
                <header
                    className={`pointer-events-auto w-full transition-all duration-300 ${scrolled
                        ? "bg-zinc-950/90 backdrop-blur-2xl border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)] h-[64px]"
                        : "bg-zinc-950/60 backdrop-blur-xl border-b border-white/5 shadow-none h-[64px]"
                        }`}
                >
                    {/* Render Navbar inner content here */}
                    <Navbar activeMenu={activeMenu} />
                </header>
            </div>

            {user && (
                <div className="flex w-full relative pt-[64px] z-10">

                    {/* Desktop Sidebar (Adjusted to start below the 64px header) */}
                    <aside className="hidden lg:block fixed top-[80px] left-[24px] xl:left-[40px] h-[calc(100vh-100px)] w-[245px] z-30 flex-shrink-0 bg-zinc-950/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_10px_40px_rgba(0,0,0,0.7)] overflow-hidden">
                        <SideMenu activeMenu={activeMenu} />
                    </aside>

                    {/* Main Content Area */}
                    <main className='flex-1 min-w-0 min-h-[calc(100vh-64px)] px-4 sm:px-6 md:px-8 lg:ml-[290px] xl:ml-[310px] lg:px-8 xl:px-10 pt-6 pb-8 transition-all duration-300 relative'>
                        <div className='w-full max-w-[1700px] mx-auto animate-fadeIn relative z-10'>
                            {children}
                        </div>
                    </main>

                </div>
            )}

            {/* Custom Developer Scrollbar Style */}
            <style jsx global>{`
                ::-webkit-scrollbar {
                    width: 6px;
                }
                ::-webkit-scrollbar-track {
                    background: #050505;
                    border-left: 1px solid rgba(255,255,255,0.02);
                }
                ::-webkit-scrollbar-thumb {
                    background: rgba(56, 189, 248, 0.2); /* Subtle Cyan */
                    border-radius: 10px;
                    transition: all 0.3s ease;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: rgba(56, 189, 248, 0.6); /* Brighter Cyan on hover */
                }
            `}</style>

        </div>
    );
}

export default DashboardLayout;