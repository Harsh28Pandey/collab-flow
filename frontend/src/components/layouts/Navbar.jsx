import React, { useEffect, useState } from 'react';
import logo from "../../assets/favicon.png";

import {
    HiOutlineMenu,
    HiOutlineX
} from "react-icons/hi";

import {
    LuSparkles
} from "react-icons/lu";

import SideMenu from './SideMenu.jsx';

import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ activeMenu }) => {

    const [openSideMenu, setOpenSideMenu] = useState(false);

    const navigate = useNavigate();

    const location = useLocation();

    // ✅ route change hone par sidebar close
    useEffect(() => {
        setOpenSideMenu(false);
    }, [location.pathname]);

    // ✅ body scroll lock when sidebar open
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

            <div className='sticky top-0 z-[60] w-full bg-white/90 backdrop-blur-xl border-b border-blue-100 shadow-[0_4px_18px_rgba(59,130,246,0.05)]'>

                <div className='h-[61px] px-4 sm:px-6 lg:px-7 flex items-center justify-between'>

                    {/* Left Section */}

                    <div className='flex items-center gap-3 sm:gap-4'>

                        {/* Mobile Menu Button */}

                        <button
                            className='lg:hidden w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-700 transition-all duration-300 active:scale-95 cursor-pointer'
                            onClick={() => setOpenSideMenu(!openSideMenu)}
                        >

                            {openSideMenu ? (
                                <HiOutlineX className="text-[22px]" />
                            ) : (
                                <HiOutlineMenu className="text-[22px]" />
                            )}

                        </button>

                        {/* Logo */}

                        <div
                            onClick={() => navigate("/")}
                            className='group flex items-center gap-2.5 cursor-pointer select-none'
                        >

                            {/* Logo Image */}

                            <div className='
                                w-10 h-10
                                flex items-center justify-center
                                transition-all duration-300
                                group-hover:scale-105
                            '>

                                <img
                                    src={logo}
                                    alt="Collab Flow Logo"
                                    className='
                                        w-10 h-10
                                        object-contain
                                        drop-shadow-[0_6px_18px_rgba(59,130,246,0.22)]
                                    '
                                />

                            </div>

                            {/* Text */}

                            <div className='flex flex-col leading-tight'>

                                <h2 className='text-[16px] sm:text-[18px] font-bold text-gray-900 tracking-tight group-hover:text-blue-700 transition-all duration-300'>
                                    Collab Flow
                                </h2>

                                <span className='hidden sm:block text-[10px] text-gray-400 font-medium tracking-wide'>
                                    Smart Team Workspace
                                </span>

                            </div>

                        </div>

                    </div>

                    {/* Right Section */}

                    <div className='hidden sm:flex items-center gap-3'>

                        <div className='flex items-center gap-2 px-3 py-2 rounded-2xl bg-blue-50 border border-blue-100'>

                            <div className='w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse'></div>

                            <span className='text-[12px] font-semibold text-blue-700'>
                                Workspace Active
                            </span>

                        </div>

                    </div>

                </div>

            </div>

            {/* MOBILE SIDEBAR */}

            <div className={`
                fixed inset-0 z-[70] lg:hidden
                transition-all duration-300
                ${openSideMenu ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"}
            `}>

                {/* Overlay */}

                <div
                    onClick={() => setOpenSideMenu(false)}
                    className='absolute inset-0 bg-black/40 backdrop-blur-[3px]'
                />

                {/* Sidebar Wrapper */}

                <div className={`
                    absolute top-0 left-0
                    h-screen
                    w-[260px]
                    max-w-[82%]
                    bg-white
                    shadow-[10px_0_40px_rgba(0,0,0,0.12)]
                    transition-all duration-300 ease-out
                    overflow-hidden
                    flex flex-col
                    ${openSideMenu ? "translate-x-0" : "-translate-x-full"}
                `}>

                    {/* Close Button */}

                    <div className='flex items-center justify-between px-4 h-[61px] border-b border-blue-100 bg-white flex-shrink-0'>

                        {/* Left Side */}

                        <div className='flex items-center gap-3'>

                            {/* Close Icon */}

                            <button
                                onClick={() => setOpenSideMenu(false)}
                                className='w-9 h-9 rounded-xl flex items-center justify-center bg-blue-50 text-blue-700 active:scale-95 transition-all duration-300'
                            >

                                <HiOutlineX className='text-[20px]' />

                            </button>

                            {/* Logo */}

                            <div
                                onClick={() => navigate("/")}
                                className='flex items-center gap-2.5 cursor-pointer select-none'
                            >

                                {/* Logo Image */}

                                <img
                                    src={logo}
                                    alt="Collab Flow Logo"
                                    className='w-9 h-9 object-contain'
                                />

                                {/* Brand Name */}

                                <h2 className='text-[16px] font-bold text-gray-900 tracking-tight hover:text-blue-700 transition-all duration-300'>
                                    Collab Flow
                                </h2>

                            </div>

                        </div>

                    </div>

                    {/* Sidebar Content — flex-1 so it fills remaining height */}

                    <div className='flex-1 overflow-y-auto'>

                        <SideMenu activeMenu={activeMenu} />

                    </div>

                </div>

            </div>
        </>
    )
}

export default Navbar;