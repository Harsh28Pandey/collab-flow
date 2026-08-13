import React, { useEffect, useState } from 'react';
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { LuSparkles } from "react-icons/lu";
import SideMenu from './SideMenu.jsx';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ activeMenu }) => {

    const [openSideMenu, setOpenSideMenu] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

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
            {/* TOP NAVBAR */}
            <div className='fixed top-0 left-0 z-[60] w-full bg-white/80 backdrop-blur-2xl border-b border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)]'>

                <div className='h-[64px] px-4 sm:px-6 lg:px-8 flex items-center justify-between'>

                    {/* LEFT SECTION */}
                    <div className='flex items-center gap-3 sm:gap-4'>

                        {/* MOBILE MENU BUTTON */}
                        <button
                            className='lg:hidden w-10 h-10 rounded-xl flex items-center justify-center bg-orange-50 hover:bg-orange-100 text-orange-600 transition-all duration-300 active:scale-95 shadow-sm border border-orange-100/50'
                            onClick={() => setOpenSideMenu(!openSideMenu)}
                        >
                            {openSideMenu
                                ? <HiOutlineX className="text-[22px]" />
                                : <HiOutlineMenu className="text-[22px]" />
                            }
                        </button>

                        {/* LOGO (Icon removed, updated to text gradient) */}
                        <div
                            onClick={() => navigate("/")}
                            className='group flex items-center gap-3 cursor-pointer select-none'
                        >
                            <div className='flex flex-col leading-tight justify-center'>
                                <h2 className='text-xl md:text-2xl font-black text-slate-800 tracking-tight transition-transform duration-300 ease-out group-hover:scale-[1.02]'>
                                    Collab{" "}
                                    <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                                        Flow
                                    </span>
                                </h2>
                                <span className='hidden sm:block text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5'>
                                    Smart Workspace
                                </span>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT SECTION */}
                    <div className='hidden sm:flex items-center gap-3'>

                        {/* STATUS BADGE */}
                        <div className='flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm'>

                            <span className='relative flex h-2 w-2'>
                                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75'></span>
                                <span className='relative inline-flex rounded-full h-2 w-2 bg-emerald-500'></span>
                            </span>

                            <span className='text-[11px] font-bold text-slate-600 uppercase tracking-wide'>
                                Active
                            </span>

                        </div>

                        {/* OPTIONAL ICON BADGE */}
                        <div className='w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:shadow-md hover:border-orange-200 hover:text-orange-500 text-slate-400 transition-all duration-300 cursor-pointer'>
                            <LuSparkles className='text-[16px] transition-colors' />
                        </div>

                    </div>

                </div>
            </div>

            {/* MOBILE SIDEBAR */}
            <div className={`fixed inset-0 z-[70] lg:hidden transition-all duration-300 ${openSideMenu ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"}`}>

                {/* OVERLAY */}
                <div
                    onClick={() => setOpenSideMenu(false)}
                    className='absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity duration-300'
                />

                {/* SIDEBAR */}
                <div className={`absolute top-0 left-0 h-screen w-[270px] max-w-[82%] bg-white/95 backdrop-blur-3xl border-r border-slate-200 shadow-[20px_0_40px_rgba(0,0,0,0.08)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${openSideMenu ? "translate-x-0" : "-translate-x-full"}`}>

                    {/* HEADER */}
                    <div className='flex items-center justify-between px-4 h-[64px] border-b border-slate-100'>

                        <div className='flex items-center gap-3 w-full justify-between'>

                            <div
                                onClick={() => {
                                    setOpenSideMenu(false);
                                    navigate("/");
                                }}
                                className='flex items-center cursor-pointer group'
                            >
                                <h2 className='text-[20px] font-black text-slate-800 tracking-tight transition-transform duration-300 ease-out group-hover:scale-[1.02]'>
                                    Collab{" "}
                                    <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                                        Flow
                                    </span>
                                </h2>
                            </div>

                            <button
                                onClick={() => setOpenSideMenu(false)}
                                className='w-9 h-9 rounded-xl flex items-center justify-center bg-orange-50 hover:bg-orange-100 text-orange-600 active:scale-95 transition-all'
                            >
                                <HiOutlineX className='text-[20px]' />
                            </button>

                        </div>

                    </div>

                    {/* CONTENT */}
                    <div className='flex-1 overflow-y-auto'>
                        <SideMenu activeMenu={activeMenu} />
                    </div>

                </div>
            </div>
        </>
    );
}

export default Navbar;