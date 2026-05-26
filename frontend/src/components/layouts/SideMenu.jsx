import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../context/userContext.jsx';
import { SIDE_MENU_DATA, SIDE_MENU_USER_DATA } from '../../utils/data.js';
import { useNavigate } from "react-router-dom";
import axiosInstance from '../../utils/axiosInstance.js';
import { LuHouse, LuLogOut } from "react-icons/lu";

const SideMenu = ({ activeMenu }) => {

    const { user, clearUser } = useContext(UserContext);
    const [sideMenuData, setSideMenuData] = useState([]);
    const navigate = useNavigate();

    const handleClick = (route) => {
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
            const filteredMenu = (
                user?.role === "admin" ? SIDE_MENU_DATA : SIDE_MENU_USER_DATA
            ).filter((item) => item.path !== "logout");
            setSideMenuData(filteredMenu);
        }
        return () => { };
    }, [user]);

    return (
        // FIX 1: h-full → h-screen aur overflow-hidden add kiya
        // Taaki mobile mein bhi poori screen height mile aur bahar na nikle
        <div className='w-[235px] lg:w-[245px] h-screen overflow-hidden bg-gradient-to-b from-white via-blue-50/20 to-white border-r border-blue-100 z-20 flex flex-col'>

            {/* Profile Section */}
            {/* FIX 2: flex-shrink-0 add kiya taaki profile section scroll ke saath shrink na ho */}
            <div className='flex-shrink-0 relative flex flex-col items-center justify-center px-3 pt-2.5 pb-2.5'>

                <div className='relative group'>

                    {user?.profileImageUrl ? (
                        <img src={user?.profileImageUrl} alt="Profile Image" className='relative w-10 h-10 border-2 object-cover rounded-full border-white shadow-[0_5px_18px_rgba(59,130,246,0.16)] transition-all duration-300 group-hover:scale-105' />
                    ) : (
                        <div className='relative w-10 h-10 text-sm border-2 flex items-center justify-center bg-gradient-to-br from-blue-600 to-sky-500 text-white font-bold rounded-full border-white shadow-[0_5px_18px_rgba(59,130,246,0.18)] transition-all duration-300 group-hover:scale-105'>
                            {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
                        </div>
                    )}

                    {/* Online Dot */}
                    <div className='absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 border-2 border-white rounded-full'></div>

                </div>

                {user?.role === "admin" && (
                    <div className='mt-1.5 px-2 py-0.5 text-[9px] font-semibold text-blue-700 bg-blue-100 border border-blue-200 rounded-full tracking-wide'>
                        ADMIN
                    </div>
                )}

                {user?.role === "member" && (
                    <div className='mt-1.5 px-2 py-0.5 text-[9px] font-semibold text-blue-700 bg-blue-100 border border-blue-200 rounded-full tracking-wide'>
                        MEMBER
                    </div>
                )}

                <h5 className='text-gray-900 font-bold text-[13px] mt-1.5 leading-5 text-center'>
                    {user?.name || ""}
                </h5>

                <p className='text-[9px] mt-0.5 text-gray-600 text-center break-all leading-4'>
                    {user?.email || ""}
                </p>

            </div>

            {/* Menu Items + Back to Home + Logout */}
            {/* FIX 3: min-h-0 add kiya — yeh flex child ko shrink hone deta hai
                       overflow-y-auto tabhi kaam karta hai jab parent ki bounded height ho
                       min-h-0 ke bina flex-1 overflow ko ignore kar deta hai mobile par */}
            <div className="flex-1 min-h-0 overflow-y-auto py-2 px-2 scrollbar-hide">
                <div className='space-y-1'>

                    {/* Horizontal line */}
                    <div className='h-px bg-blue-100 mx-1 mb-1' />

                    {/* Main Menu Items */}
                    {sideMenuData.map((item, index) => {
                        const isActive = activeMenu === item.label;
                        return (
                            <button
                                key={`menu_${index}`}
                                onClick={() => handleClick(item.path)}
                                className={`group relative w-full flex items-center rounded-xl gap-2.5 px-2.5 py-2 text-[13px] font-medium transition-all duration-300 ease-out overflow-hidden cursor-pointer ${isActive ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-[0_6px_18px_rgba(59,130,246,0.20)]' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:translate-x-1'}`}
                            >
                                {/* Hover Effect */}
                                {!isActive && (
                                    <div className='absolute inset-0 bg-gradient-to-r from-blue-100/0 via-blue-100/40 to-blue-100/0 opacity-0 group-hover:opacity-100 transition-all duration-500'></div>
                                )}

                                {/* Active Line */}
                                {isActive && (
                                    <div className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full'></div>
                                )}

                                {/* Icon */}
                                <div className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-300 ${isActive ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600 group-hover:bg-white'}`}>
                                    <item.icon className="text-[15px]" />
                                </div>

                                {/* Label */}
                                <span className='relative z-10 tracking-wide'>{item.label}</span>

                            </button>
                        )
                    })}

                    {/* Back To Home */}
                    <button onClick={() => navigate("/")} className='group relative w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:translate-x-1 transition-all duration-300 cursor-pointer'>
                        <div className='relative z-10 flex items-center justify-center w-7 h-7 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-white transition-all duration-300'>
                            <LuHouse className='text-[15px]' />
                        </div>
                        <span className='relative z-10 tracking-wide'>Back To Home</span>
                    </button>

                    {/* Logout */}
                    <button onClick={handleLogout} className='group relative w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium text-red-600 hover:bg-red-50 hover:translate-x-1 transition-all duration-300 cursor-pointer'>
                        <div className='relative z-10 flex items-center justify-center w-7 h-7 rounded-lg bg-red-100 text-red-500 group-hover:bg-white transition-all duration-300'>
                            <LuLogOut className='text-[15px]' />
                        </div>
                        <span className='relative z-10 tracking-wide'>Logout</span>
                    </button>

                </div>
            </div>

        </div>
    )
}

export default SideMenu