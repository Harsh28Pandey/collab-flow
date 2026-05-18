import React, { useContext, useEffect, useState } from 'react'

import { UserContext } from '../../context/userContext.jsx';

import {
    SIDE_MENU_DATA,
    SIDE_MENU_USER_DATA
} from '../../utils/data.js';

import { useNavigate } from "react-router-dom";

import axiosInstance from '../../utils/axiosInstance.js';

import {
    LuHouse,
    LuLogOut
} from "react-icons/lu";

const SideMenu = ({ activeMenu }) => {

    const { user, clearUser } = useContext(UserContext);

    const [sideMenuData, setSideMenuData] = useState([]);

    const navigate = useNavigate();

    const handleClick = (route) => {

        // ✅ old logout menu item hide/remove
        if (route === "logout") return;

        navigate(route);
    }

    const handleLogout = async () => {

        try {

            await axiosInstance.post("/api/auth/logout");

        } catch (error) {

            console.error("Logout error:", error);

        } finally {

            window.location.href = "/";

            clearUser();
        }
    };

    useEffect(() => {

        if (user) {

            // ✅ remove old logout item
            const filteredMenu = (
                user?.role === "admin"
                    ? SIDE_MENU_DATA
                    : SIDE_MENU_USER_DATA
            ).filter((item) => item.path !== "logout");

            setSideMenuData(filteredMenu);
        }

        return () => { };

    }, [user]);

    return (

        <div className='
            w-[235px]
            lg:w-[245px]
            h-[calc(100vh-61px)]
            bg-gradient-to-b from-white via-blue-50/20 to-white
            border-r border-blue-100
            sticky top-[61px]
            z-20
            flex flex-col
            shadow-[3px_0_18px_rgba(59,130,246,0.05)]
            backdrop-blur-xl
            overflow-hidden
        '>

            {/* Top Glow */}

            <div className='absolute top-0 left-0 w-full h-28 bg-gradient-to-b from-blue-100/40 to-transparent pointer-events-none'></div>

            {/* Profile Section */}

            <div className='relative flex flex-col items-center justify-center px-4 pt-4 pb-4 border-b border-blue-100/70'>

                <div className='relative group'>

                    {/* Glow */}

                    <div className='absolute -inset-1 rounded-full bg-gradient-to-r from-blue-400 to-sky-400 blur opacity-20 group-hover:opacity-40 transition-all duration-300'></div>

                    {user?.profileImageUrl ? (

                        <img
                            src={user?.profileImageUrl}
                            alt="Profile Image"
                            className='
                                relative
                                w-16 h-16
                                md:w-[72px] md:h-[72px]
                                object-cover
                                rounded-full
                                border-[3px] border-white
                                shadow-[0_5px_18px_rgba(59,130,246,0.16)]
                                transition-all duration-300
                                group-hover:scale-105
                            '
                        />

                    ) : (

                        <div className='
                            relative
                            w-16 h-16
                            md:w-[72px] md:h-[72px]
                            flex items-center justify-center
                            bg-gradient-to-br from-blue-600 to-sky-500
                            text-white
                            text-xl
                            font-bold
                            rounded-full
                            border-[3px] border-white
                            shadow-[0_5px_18px_rgba(59,130,246,0.18)]
                            transition-all duration-300
                            group-hover:scale-105
                        '>
                            {user?.name
                                ? user.name.charAt(0).toUpperCase()
                                : "?"
                            }
                        </div>
                    )}

                    {/* Online Dot */}

                    <div className='absolute bottom-1 right-1 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full'></div>

                </div>

                {user?.role === "admin" && (

                    <div className='
                        mt-2.5
                        text-[9px]
                        font-semibold
                        text-blue-700
                        bg-blue-100
                        border border-blue-200
                        px-2.5 py-1
                        rounded-full
                        tracking-wide
                    '>
                        ADMIN
                    </div>

                )}

                <h5 className='
                    text-gray-900
                    font-bold
                    text-[14px]
                    leading-5
                    mt-3
                    text-center
                '>
                    {user?.name || ""}
                </h5>

                <p className='
                    text-[10px]
                    text-gray-500
                    mt-1
                    text-center
                    break-all
                    leading-4
                '>
                    {user?.email || ""}
                </p>

            </div>

            {/* Menu Items */}

            <div className="flex-1 overflow-y-auto py-3 px-2.5 scrollbar-hide">

                <div className='space-y-1.5'>

                    {sideMenuData.map((item, index) => {

                        const isActive = activeMenu === item.label;

                        return (

                            <button
                                key={`menu_${index}`}
                                onClick={() => handleClick(item.path)}
                                className={`
                                    group
                                    relative
                                    w-full
                                    flex items-center gap-3
                                    rounded-xl
                                    px-3 py-2.5
                                    text-[13.5px]
                                    font-medium
                                    transition-all duration-300 ease-out
                                    overflow-hidden
                                    cursor-pointer

                                    ${isActive
                                        ? `
                                            bg-gradient-to-r
                                            from-blue-600
                                            to-sky-500
                                            text-white
                                            shadow-[0_6px_18px_rgba(59,130,246,0.20)]
                                        `
                                        : `
                                            text-gray-700
                                            hover:bg-blue-50
                                            hover:text-blue-700
                                            hover:translate-x-1
                                        `
                                    }
                                `}
                            >

                                {/* Hover Effect */}

                                {!isActive && (
                                    <div className='absolute inset-0 bg-gradient-to-r from-blue-100/0 via-blue-100/40 to-blue-100/0 opacity-0 group-hover:opacity-100 transition-all duration-500'></div>
                                )}

                                {/* Active Line */}

                                {isActive && (
                                    <div className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full'></div>
                                )}

                                {/* Icon */}

                                <div className={`
                                    relative z-10
                                    flex items-center justify-center
                                    w-8 h-8
                                    rounded-lg
                                    transition-all duration-300

                                    ${isActive
                                        ? 'bg-white/20 text-white'
                                        : 'bg-blue-100 text-blue-600 group-hover:bg-white'
                                    }
                                `}>
                                    <item.icon className="text-[17px]" />
                                </div>

                                {/* Label */}

                                <span className='relative z-10 tracking-wide'>
                                    {item.label}
                                </span>

                            </button>
                        )
                    })}

                </div>

            </div>

            {/* Bottom Actions */}

            <div className='border-t border-blue-100 p-2.5 space-y-2 bg-white/70 backdrop-blur-md'>

                {/* Back To Home */}

                <button
                    onClick={() => navigate("/")}
                    className='
                        group
                        w-full
                        flex items-center gap-3
                        px-3 py-2.5
                        rounded-xl
                        text-[13.5px]
                        font-medium
                        text-gray-700
                        hover:bg-blue-200
                        hover:text-blue-700
                        transition-all duration-300
                        cursor-pointer
                    '
                >

                    <div className='
                        w-8 h-8
                        flex items-center justify-center
                        rounded-lg
                        bg-blue-200
                        text-blue-700
                        group-hover:bg-white
                        transition-all duration-300
                    '>
                        <LuHouse className='text-[17px]' />
                    </div>

                    Back To Home

                </button>

                {/* Logout */}

                <button
                    onClick={handleLogout}
                    className='
                        group
                        w-full
                        flex items-center gap-3
                        px-3 py-2.5
                        rounded-xl
                        text-[13.5px]
                        font-medium
                        text-red-700
                        hover:bg-red-200
                        transition-all duration-300
                        cursor-pointer
                    '
                >

                    <div className='
                        w-8 h-8
                        flex items-center justify-center
                        rounded-lg
                        bg-red-200
                        text-red-700
                        group-hover:bg-white
                        transition-all duration-300
                    '>
                        <LuLogOut className='text-[17px]' />
                    </div>

                    Logout

                </button>

            </div>

        </div>
    )
}

export default SideMenu