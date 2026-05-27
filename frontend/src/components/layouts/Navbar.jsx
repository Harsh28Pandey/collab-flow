import React, { useEffect, useState } from 'react';
import logo from "../../assets/favicon.png";
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
            <div className='fixed top-0 left-0 z-[60] w-full bg-white/70 backdrop-blur-2xl border-b border-blue-100 shadow-sm'>

                <div className='h-[64px] px-4 sm:px-6 lg:px-8 flex items-center justify-between'>

                    {/* LEFT SECTION */}
                    <div className='flex items-center gap-3 sm:gap-4'>

                        {/* MOBILE MENU BUTTON */}
                        <button
                            className='lg:hidden w-11 h-11 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 transition-all duration-300 active:scale-95 shadow-sm'
                            onClick={() => setOpenSideMenu(!openSideMenu)}
                        >
                            {openSideMenu
                                ? <HiOutlineX className="text-[22px]" />
                                : <HiOutlineMenu className="text-[22px]" />
                            }
                        </button>

                        {/* LOGO */}
                        <div
                            onClick={() => navigate("/")}
                            className='group flex items-center gap-3 cursor-pointer select-none'
                        >

                            <div className='w-11 h-11 flex items-center justify-center rounded-2xl bg-white shadow-md border border-blue-100 group-hover:scale-105 transition-all duration-300'>
                                <img
                                    src={logo}
                                    alt="Collab Flow Logo"
                                    className='w-9 h-9 object-contain'
                                />
                            </div>

                            <div className='flex flex-col leading-tight'>
                                <h2 className='text-[17px] sm:text-[19px] font-bold text-gray-900 group-hover:text-blue-600 transition-all duration-300'>
                                    Collab Flow
                                </h2>

                                <span className='hidden sm:block text-[11px] text-gray-500 font-medium'>
                                    Smart Team Workspace
                                </span>
                            </div>

                        </div>

                    </div>

                    {/* RIGHT SECTION */}
                    <div className='hidden sm:flex items-center gap-3'>

                        {/* STATUS BADGE */}
                        <div className='flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-50 to-blue-50 border border-blue-100 shadow-sm'>

                            <span className='relative flex h-2.5 w-2.5'>
                                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75'></span>
                                <span className='relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500'></span>
                            </span>

                            <span className='text-[12px] font-semibold text-blue-700'>
                                Workspace Active
                            </span>

                        </div>

                        {/* OPTIONAL ICON BADGE */}
                        <div className='w-10 h-10 rounded-2xl bg-white border border-blue-100 shadow-sm flex items-center justify-center hover:shadow-md transition-all duration-300 cursor-pointer'>
                            <LuSparkles className='text-blue-600 text-[18px]' />
                        </div>

                    </div>

                </div>
            </div>

            {/* MOBILE SIDEBAR */}
            <div className={`fixed inset-0 z-[70] lg:hidden transition-all duration-300 ${openSideMenu ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"}`}>

                {/* OVERLAY */}
                <div
                    onClick={() => setOpenSideMenu(false)}
                    className='absolute inset-0 bg-black/40 backdrop-blur-[4px]'
                />

                {/* SIDEBAR */}
                <div className={`absolute top-0 left-0 h-screen w-[270px] max-w-[82%] bg-white/90 backdrop-blur-xl border-r border-blue-100 shadow-2xl transition-transform duration-300 ease-out flex flex-col ${openSideMenu ? "translate-x-0" : "-translate-x-full"}`}>

                    {/* HEADER */}
                    <div className='flex items-center justify-between px-4 h-[64px] border-b border-blue-100 bg-white/80'>

                        <div className='flex items-center gap-3'>

                            <button
                                onClick={() => setOpenSideMenu(false)}
                                className='w-10 h-10 rounded-2xl flex items-center justify-center bg-blue-50 text-blue-700 active:scale-95 transition-all'
                            >
                                <HiOutlineX className='text-[20px]' />
                            </button>

                            <div
                                onClick={() => navigate("/")}
                                className='flex items-center gap-2 cursor-pointer'
                            >
                                <img src={logo} alt="logo" className='w-9 h-9' />
                                <h2 className='text-[16px] font-bold text-gray-900'>
                                    Collab Flow
                                </h2>
                            </div>

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