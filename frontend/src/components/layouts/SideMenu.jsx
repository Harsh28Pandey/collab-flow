import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../context/userContext.jsx';
import { SIDE_MENU_DATA, SIDE_MENU_USER_DATA } from '../../utils/data.js';
import { useNavigate } from "react-router-dom";
import axiosInstance from '../../utils/axiosInstance.js';

const SideMenu = ({ activeMenu }) => {

    const { user, clearUser } = useContext(UserContext);
    const [sideMenuData, setSideMenuData] = useState([]);

    const navigate = useNavigate();

    const handleClick = (route) => {
        if (route === "logout") {
            handleLogout();
            return;
        }
        navigate(route);
    }

    const handleLogout = async () => {
        try {
            await axiosInstance.post("/api/auth/logout");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            window.location.href = "/"; // ✅ Hard redirect — 100% kaam karega
            clearUser();
        }
    };

    useEffect(() => {
        if (user) {
            setSideMenuData(user?.role === "admin" ? SIDE_MENU_DATA : SIDE_MENU_USER_DATA)
        }
        return () => { };
    }, [user]);

    return (
        <div className='w-64 h-[calc(100vh-61px)] bg-white border-r border-gray-200/50 sticky top-[61px] z-20 flex flex-col'>
            <div className='flex flex-col items-center justify-center mb-7 pt-5'>
                <div className='relative'>
                    {user?.profileImageUrl ? (
                        <img
                            src={user?.profileImageUrl}
                            alt="Profile Image"
                            className='w-20 h-20 bg-slate-400 rounded-full'
                        />
                    ) : (
                        <div className='w-20 h-20 flex items-center justify-center bg-primary text-white text-2xl font-bold rounded-full'>
                            {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
                        </div>
                    )}
                </div>

                {user?.role === "admin" && (
                    <div className='text-[10px] font-medium text-white bg-primary px-3 py-0.5 rounded-2xl mt-1'>
                        Admin
                    </div>
                )}

                <h5 className='text-gray-950 font-medium leading-6 mt-3'>{user?.name || ""}</h5>
                <p className='text-[12px] text-gray-500'>{user?.email || ""}</p>
            </div>

            <div className="flex-1 overflow-y-auto py-2">
                {sideMenuData.map((item, index) => (
                    <button
                        key={`menu_${index}`}
                        className={`w-full flex items-center gap-4 text-[15px] py-3 px-6 mb-3 cursor-pointer transition-all duration-200 ease-in-out ${activeMenu == item.label
                            ? "text-primary bg-linear-to-r from-blue-50/40 to-blue-100/50 border-r-3"
                            : "hover:text-primary hover:pl-7"
                            }`}
                        onClick={() => handleClick(item.path)}
                    >
                        <item.icon className="text-xl" />
                        {item.label}
                    </button>
                ))}
            </div>
        </div >
    )
}

export default SideMenu