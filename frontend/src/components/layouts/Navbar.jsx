// src/components/layouts/Navbar.jsx (or src/components/Navbar.jsx)
import React, { useEffect, useState } from 'react';
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { LuZap, LuTerminal } from "react-icons/lu";
import SideMenu from './SideMenu.jsx';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ activeMenu }) => {

    const [openSideMenu, setOpenSideMenu] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Scroll Effect Logic
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

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (openSideMenu) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [openSideMenu]);

    return (
        <>
            {/* TOP NAVBAR (Edge-to-Edge Sleek Glassmorphism) */}
            <div className={`fixed top-0 left-0 right-0 z-[60] w-full transition-all duration-300 ${scrolled
                    ? 'bg-zinc-950/90 backdrop-blur-2xl border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)]'
                    : 'bg-zinc-950/60 backdrop-blur-xl border-b border-white/5 shadow-none'
                }`}>

                {/* h-[64px] keeps it sleek and exactly like before */}
                <div className='h-[64px] px-4 sm:px-6 lg:px-8 flex items-center justify-between max-w-[1920px] mx-auto'>

                    {/* LEFT SECTION */}
                    <div className='flex items-center gap-3 sm:gap-4'>

                        {/* MOBILE MENU BUTTON */}
                        <button
                            className='lg:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-zinc-900/80 hover:bg-zinc-800 text-cyan-400 border border-white/10 transition-all duration-300 active:scale-95 shadow-inner cursor-pointer'
                            onClick={() => setOpenSideMenu(!openSideMenu)}
                            aria-label="Toggle Menu"
                        >
                            {openSideMenu
                                ? <HiOutlineX className="text-[20px]" />
                                : <HiOutlineMenu className="text-[20px]" />
                            }
                        </button>

                        {/* LOGO (Clean typography without icon, glowing gradient) */}
                        <div
                            onClick={() => navigate("/")}
                            className='group flex items-center gap-3 cursor-pointer select-none'
                        >
                            <div className='flex flex-col leading-tight justify-center text-left'>
                                <h2 className='text-xl md:text-2xl font-black text-white tracking-tight transition-transform duration-300 ease-out group-hover:scale-[1.02] flex items-center gap-1'>
                                    Collab{" "}
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500">
                                        Flow
                                    </span>
                                </h2>
                                <span className='hidden sm:block text-[10px] text-zinc-500 font-mono tracking-widest uppercase mt-0.5'>
                                    Workspace Node
                                </span>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT SECTION (Developer status badges & triggers) */}
                    <div className='flex items-center gap-2.5 sm:gap-3.5'>

                        {/* ENVIRONMENT BADGE (Responsive hidden on tiny screens) */}
                        <div className='hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20'>
                            <LuTerminal size={12} className="text-cyan-400" />
                            <span className="text-[10px] font-mono tracking-wider text-cyan-300 uppercase">
                                v2.4 Prod
                            </span>
                        </div>

                        {/* LIVE ACTIVE NODE BADGE */}
                        <div className='flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full bg-zinc-900/90 border border-white/10 shadow-inner'>
                            <span className='relative flex h-2 w-2'>
                                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75'></span>
                                <span className='relative inline-flex rounded-full h-2 w-2 bg-emerald-500'></span>
                            </span>
                            <span className='text-[10.5px] sm:text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider'>
                                Active
                            </span>
                        </div>

                        {/* QUICK COMMAND ACTION TRIGGER */}
                        <div className='w-9 h-9 rounded-2xl bg-zinc-900/80 border border-white/10 shadow-inner flex items-center justify-center hover:border-cyan-500/40 hover:shadow-[0_0_15px_rgba(56,189,248,0.3)] text-zinc-400 hover:text-cyan-400 transition-all duration-300 cursor-pointer'>
                            <LuZap className='text-[15px] transition-colors animate-pulse' />
                        </div>

                    </div>

                </div>
            </div>

            {/* MOBILE SIDEBAR (Futuristic Glassmorphic Cyber Drawer) */}
            <div className={`fixed inset-0 z-[70] lg:hidden transition-all duration-300 ${openSideMenu ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"}`}>

                {/* OVERLAY */}
                <div
                    onClick={() => setOpenSideMenu(false)}
                    className='absolute inset-0 bg-zinc-950/80 backdrop-blur-md transition-opacity duration-300'
                />

                {/* SIDEBAR PANEL */}
                <div className={`absolute top-0 left-0 h-screen w-[285px] max-w-[85%] bg-zinc-950/95 backdrop-blur-3xl border-r border-white/10 shadow-[20px_0_60px_rgba(0,0,0,0.9)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col rounded-r-[2rem] ${openSideMenu ? "translate-x-0" : "-translate-x-full"}`}>

                    {/* HEADER */}
                    <div className='flex items-center justify-between px-6 h-[64px] border-b border-white/5'>

                        <div
                            onClick={() => {
                                setOpenSideMenu(false);
                                navigate("/");
                            }}
                            className='flex items-center cursor-pointer group'
                        >
                            <h2 className='text-[20px] font-black text-white tracking-tight flex items-center gap-1'>
                                Collab{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500">
                                    Flow
                                </span>
                            </h2>
                        </div>

                        <button
                            onClick={() => setOpenSideMenu(false)}
                            className='w-9 h-9 rounded-2xl flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 text-cyan-400 border border-white/10 active:scale-95 transition-all cursor-pointer'
                        >
                            <HiOutlineX className='text-[18px]' />
                        </button>

                    </div>

                    {/* CONTENT */}
                    <div className='flex-1 overflow-y-auto px-4 py-4'>
                        <SideMenu activeMenu={activeMenu} />
                    </div>

                </div>
            </div>
        </>
    );
}

export default Navbar;