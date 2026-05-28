import React, { useContext, useEffect, useRef, useState } from 'react';
import { UserContext } from '../../context/userContext.jsx';

import {
    SIDE_MENU_DATA,
    SIDE_MENU_USER_DATA
} from '../../utils/data.js';

import {
    useNavigate,
    useLocation
} from "react-router-dom";

import axiosInstance from '../../utils/axiosInstance.js';

import {
    LuHouse,
    LuLogOut,
    LuChevronDown,
    LuChevronRight,
    LuReceipt,
    LuBadgeIndianRupee,
    LuChartPie
} from "react-icons/lu";

const SideMenu = ({ activeMenu }) => {

    const { user, clearUser } = useContext(UserContext);

    const [sideMenuData, setSideMenuData] = useState([]);
    const [expenseDropdownOpen, setExpenseDropdownOpen] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    const scrollContainerRef = useRef(null);

    // ================= EXPENSE ROUTES =================

    const expenseRoutes = [
        "/admin/expenses",
        "/admin/add-expense",
        "/admin/budgets",
        "/admin/expense-analytics"
    ];

    const isExpenseActive = expenseRoutes.includes(
        location.pathname
    );

    // ================= AUTO OPEN DROPDOWN =================

    useEffect(() => {

        if (isExpenseActive) {
            setExpenseDropdownOpen(true);
        }

    }, [location.pathname]);

    // ================= ACTIVE MENU SCROLL FIX =================

    useEffect(() => {

        const container = scrollContainerRef.current;

        if (!container) return;

        const activeElement = container.querySelector(
            ".active-menu-item"
        );

        if (activeElement) {

            const containerTop = container.scrollTop;
            const containerHeight = container.clientHeight;

            const elementTop = activeElement.offsetTop;
            const elementHeight = activeElement.clientHeight;

            const isVisible =
                elementTop >= containerTop &&
                elementTop + elementHeight <=
                containerTop + containerHeight;

            // ONLY SCROLL IF ITEM IS NOT VISIBLE
            if (!isVisible) {

                container.scrollTo({
                    top:
                        elementTop -
                        containerHeight / 2 +
                        elementHeight / 2,
                    behavior: "smooth"
                });

            }
        }

    }, [location.pathname]);

    // ================= HANDLE CLICK =================

    const handleClick = (route) => {

        if (route === "logout") return;

        navigate(route);
    };

    // ================= LOGOUT =================

    const handleLogout = async () => {

        try {
            await axiosInstance.post("/api/auth/logout");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            clearUser();
            window.location.href = "/";
        }
    };

    // ================= MENU DATA =================

    useEffect(() => {

        if (user) {

            const filteredMenu = (
                user?.role === "admin"
                    ? SIDE_MENU_DATA
                    : SIDE_MENU_USER_DATA
            ).filter((item) => item.path !== "logout");

            setSideMenuData(filteredMenu);
        }

    }, [user]);

    return (
        <>
            <div className='w-[235px] lg:w-[245px] h-screen flex flex-col bg-gradient-to-b from-white via-blue-50/20 to-white border-r border-blue-100 z-20'>

                {/* ================= PROFILE ================= */}

                <div className='relative flex flex-col items-center justify-center px-3 pt-2.5 pb-2.5'>

                    <div className='relative group'>

                        {user?.profileImageUrl ? (

                            <img
                                src={user?.profileImageUrl}
                                alt="Profile"
                                className='relative w-10 h-10 border-2 object-cover rounded-full border-white shadow-[0_5px_18px_rgba(59,130,246,0.16)] transition-all duration-300 group-hover:scale-105'
                            />

                        ) : (

                            <div className='relative w-10 h-10 text-sm border-2 flex items-center justify-center bg-gradient-to-br from-blue-600 to-sky-500 text-white font-bold rounded-full border-white shadow-[0_5px_18px_rgba(59,130,246,0.18)] transition-all duration-300 group-hover:scale-105'>
                                {user?.name
                                    ? user.name.charAt(0).toUpperCase()
                                    : "?"
                                }
                            </div>

                        )}

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

                {/* ================= MENU ================= */}

                <div
                    ref={scrollContainerRef}
                    className="flex-1 overflow-y-auto py-2 px-2 scrollbar-hide custom-scroll"
                >

                    <div className='space-y-1'>

                        <div className='h-px bg-blue-100 mx-1 mb-1' />

                        {sideMenuData.map((item, index) => {

                            const isActive =
                                activeMenu === item.label ||
                                (
                                    item.label === "Expenses" &&
                                    isExpenseActive
                                );

                            // ================= EXPENSE DROPDOWN =================

                            if (
                                item.label === "Expenses" &&
                                user?.role === "admin"
                            ) {

                                return (
                                    <div key={`menu_${index}`}>

                                        {/* ================= PARENT ================= */}

                                        <button
                                            onClick={() =>
                                                setExpenseDropdownOpen(
                                                    !expenseDropdownOpen
                                                )
                                            }
                                            className={`group relative w-full flex items-center justify-between rounded-xl gap-2.5 px-2.5 py-2 text-[13px] font-medium transition-all duration-300 ease-out overflow-hidden cursor-pointer ${isActive
                                                    ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-[0_6px_18px_rgba(59,130,246,0.20)] active-menu-item'
                                                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:translate-x-1'
                                                }`}
                                        >

                                            {/* WHITE ACTIVE LINE */}
                                            {isActive && (
                                                <div className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full'></div>
                                            )}

                                            <div className='flex items-center gap-2.5'>

                                                <div
                                                    className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-300 ${isActive
                                                            ? 'bg-white/20 text-white'
                                                            : 'bg-blue-100 text-blue-600 group-hover:bg-white'
                                                        }`}
                                                >
                                                    <item.icon className="text-[15px]" />
                                                </div>

                                                <span className='relative z-10 tracking-wide'>
                                                    {item.label}
                                                </span>

                                            </div>

                                            <div className='relative z-10'>
                                                {expenseDropdownOpen ? (
                                                    <LuChevronDown className='text-[15px]' />
                                                ) : (
                                                    <LuChevronRight className='text-[15px]' />
                                                )}
                                            </div>

                                        </button>

                                        {/* ================= CHILD DROPDOWN ================= */}

                                        <div
                                            className={`overflow-hidden transition-all duration-300 ease-in-out ${expenseDropdownOpen
                                                    ? "max-h-80 opacity-100 mt-1"
                                                    : "max-h-0 opacity-0"
                                                }`}
                                        >

                                            <div className='ml-4 mt-1 pl-3 border-l border-blue-100 space-y-1'>

                                                {/* ================= ADD EXPENSE ================= */}

                                                <button
                                                    onClick={() =>
                                                        navigate("/admin/add-expense")
                                                    }
                                                    className={`group relative w-full flex items-center rounded-xl gap-2.5 px-2.5 py-2 text-[13px] font-medium transition-all duration-300 ease-out overflow-hidden cursor-pointer ${location.pathname === "/admin/add-expense"
                                                            ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-[0_6px_18px_rgba(59,130,246,0.20)] active-menu-item'
                                                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:translate-x-1'
                                                        }`}
                                                >

                                                    {location.pathname === "/admin/add-expense" && (
                                                        <div className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full'></div>
                                                    )}

                                                    <div
                                                        className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-300 ${location.pathname === "/admin/add-expense"
                                                                ? 'bg-white/20 text-white'
                                                                : 'bg-blue-100 text-blue-600 group-hover:bg-white'
                                                            }`}
                                                    >
                                                        <LuReceipt className="text-[14px]" />
                                                    </div>

                                                    <span className='relative z-10 tracking-wide'>
                                                        Add Expense
                                                    </span>

                                                </button>

                                                {/* ================= BUDGETS ================= */}

                                                <button
                                                    onClick={() =>
                                                        navigate("/admin/budgets")
                                                    }
                                                    className={`group relative w-full flex items-center rounded-xl gap-2.5 px-2.5 py-2 text-[13px] font-medium transition-all duration-300 ease-out overflow-hidden cursor-pointer ${location.pathname === "/admin/budgets"
                                                            ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-[0_6px_18px_rgba(59,130,246,0.20)] active-menu-item'
                                                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:translate-x-1'
                                                        }`}
                                                >

                                                    {location.pathname === "/admin/budgets" && (
                                                        <div className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full'></div>
                                                    )}

                                                    <div
                                                        className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-300 ${location.pathname === "/admin/budgets"
                                                                ? 'bg-white/20 text-white'
                                                                : 'bg-blue-100 text-blue-600 group-hover:bg-white'
                                                            }`}
                                                    >
                                                        <LuBadgeIndianRupee className="text-[14px]" />
                                                    </div>

                                                    <span className='relative z-10 tracking-wide'>
                                                        Budgets
                                                    </span>

                                                </button>

                                                {/* ================= ANALYTICS ================= */}

                                                <button
                                                    onClick={() =>
                                                        navigate("/admin/expense-analytics")
                                                    }
                                                    className={`group relative w-full flex items-center rounded-xl gap-2.5 px-2.5 py-2 text-[13px] font-medium transition-all duration-300 ease-out overflow-hidden cursor-pointer ${location.pathname === "/admin/expense-analytics"
                                                            ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-[0_6px_18px_rgba(59,130,246,0.20)] active-menu-item'
                                                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:translate-x-1'
                                                        }`}
                                                >

                                                    {location.pathname === "/admin/expense-analytics" && (
                                                        <div className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full'></div>
                                                    )}

                                                    <div
                                                        className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-300 ${location.pathname === "/admin/expense-analytics"
                                                                ? 'bg-white/20 text-white'
                                                                : 'bg-blue-100 text-blue-600 group-hover:bg-white'
                                                            }`}
                                                    >
                                                        <LuChartPie className="text-[14px]" />
                                                    </div>

                                                    <span className='relative z-10 tracking-wide'>
                                                        Expense Analytics
                                                    </span>

                                                </button>

                                            </div>

                                        </div>

                                    </div>
                                );
                            }

                            // ================= NORMAL MENU =================

                            return (
                                <button
                                    key={`menu_${index}`}
                                    onClick={() =>
                                        handleClick(item.path)
                                    }
                                    className={`group relative w-full flex items-center rounded-xl gap-2.5 px-2.5 py-2 text-[13px] font-medium transition-all duration-300 ease-out overflow-hidden cursor-pointer ${isActive
                                            ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-[0_6px_18px_rgba(59,130,246,0.20)] active-menu-item'
                                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:translate-x-1'
                                        }`}
                                >

                                    {!isActive && (
                                        <div className='absolute inset-0 bg-gradient-to-r from-blue-100/0 via-blue-100/40 to-blue-100/0 opacity-0 group-hover:opacity-100 transition-all duration-500'></div>
                                    )}

                                    {isActive && (
                                        <div className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full'></div>
                                    )}

                                    <div
                                        className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-300 ${isActive
                                                ? 'bg-white/20 text-white'
                                                : 'bg-blue-100 text-blue-600 group-hover:bg-white'
                                            }`}
                                    >
                                        <item.icon className="text-[15px]" />
                                    </div>

                                    <span className='relative z-10 tracking-wide'>
                                        {item.label}
                                    </span>

                                </button>
                            );
                        })}

                        {/* ================= HOME ================= */}

                        <button
                            onClick={() => navigate("/")}
                            className='group relative w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:translate-x-1 transition-all duration-300 cursor-pointer'
                        >

                            <div className='relative z-10 flex items-center justify-center w-7 h-7 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-white transition-all duration-300'>
                                <LuHouse className='text-[15px]' />
                            </div>

                            <span className='relative z-10 tracking-wide'>
                                Back To Home
                            </span>

                        </button>

                        {/* ================= LOGOUT ================= */}

                        <button
                            onClick={handleLogout}
                            className='group relative w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium text-red-600 hover:bg-red-50 hover:translate-x-1 transition-all duration-300 cursor-pointer'
                        >

                            <div className='relative z-10 flex items-center justify-center w-7 h-7 rounded-lg bg-red-100 text-red-500 group-hover:bg-white transition-all duration-300'>
                                <LuLogOut className='text-[15px]' />
                            </div>

                            <span className='relative z-10 tracking-wide'>
                                Logout
                            </span>

                        </button>

                    </div>

                </div>

            </div>

            {/* ================= SCROLLBAR ================= */}

            <style>{`

                .custom-scroll::-webkit-scrollbar {
                    width: 6px;
                }

                .custom-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }

                .custom-scroll::-webkit-scrollbar-thumb {
                    background: #3b82f6;
                    border-radius: 10px;
                }

                .custom-scroll::-webkit-scrollbar-thumb:hover {
                    background: #1d4ed8;
                }

                @media (max-width: 1024px) {

                    .custom-scroll::-webkit-scrollbar {
                        display: none;
                    }
                }

                @media (max-height: 700px) {

                    .custom-scroll {
                        padding-bottom: 80px;
                    }
                }

            `}</style>
        </>
    );
};

export default SideMenu;