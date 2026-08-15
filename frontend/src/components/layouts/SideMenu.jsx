// src/components/layouts/SideMenu.jsx
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
    LuChartPie,
    LuWallet,
    LuTerminal
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
        "/admin/manage-expenses",
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
            <div className='w-full h-full flex flex-col bg-zinc-950/80 backdrop-blur-3xl z-25 overflow-hidden text-zinc-100 select-none'>

                {/* ================= PROFILE ================= */}

                <div className='relative flex flex-col items-center justify-center px-4 pt-5 pb-3 flex-shrink-0'>

                    <div
                        className='relative group cursor-pointer'
                        onClick={() => navigate(user?.role === 'admin' ? '/admin/settings' : '/user/profile-settings')}
                    >

                        {user?.profileImageUrl ? (

                            <img
                                src={user?.profileImageUrl}
                                alt="Profile"
                                className='relative w-12 h-12 border-2 object-cover rounded-2xl border-white/10 shadow-[0_0_20px_rgba(56,189,248,0.2)] transition-all duration-300 group-hover:scale-105 group-hover:border-cyan-500/50'
                            />

                        ) : (

                            <div className='relative w-12 h-12 text-[15px] border border-white/10 flex items-center justify-center bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(56,189,248,0.25)] transition-all duration-300 group-hover:scale-105 uppercase'>
                                {user?.name
                                    ? user.name.charAt(0)
                                    : "?"
                                }
                            </div>

                        )}

                        {/* Online Status Beacon */}
                        <div className='absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-zinc-950 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]'></div>

                    </div>

                    {/* Role Pill */}
                    {user?.role === "admin" && (
                        <div className='mt-2.5 px-2.5 py-0.5 text-[9px] font-mono font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 rounded-full tracking-wider uppercase shadow-sm'>
                            ADMIN CORE
                        </div>
                    )}

                    {user?.role === "member" && (
                        <div className='mt-2.5 px-2.5 py-0.5 text-[9px] font-mono font-bold text-purple-300 bg-purple-500/10 border border-purple-500/30 rounded-full tracking-wider uppercase shadow-sm'>
                            DEV MEMBER
                        </div>
                    )}

                    <h5 className='text-white font-bold text-[14px] mt-2 leading-5 text-center tracking-tight'>
                        {user?.name || ""}
                    </h5>

                    <p className='text-[10px] mt-0.5 text-zinc-500 font-mono text-center break-all leading-4'>
                        {user?.email || ""}
                    </p>

                </div>

                {/* ================= MENU ================= */}

                <div
                    ref={scrollContainerRef}
                    className="flex-1 h-full overflow-y-auto overflow-x-hidden pt-2 pb-6 px-3 custom-side-scroll"
                >

                    <div className='flex flex-col space-y-1 w-full'>

                        <div className='h-px bg-white/5 mx-1 mb-2 mt-1 flex-shrink-0' />

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
                                    <div key={`menu_${index}`} className="flex flex-col space-y-1 w-full flex-shrink-0">

                                        {/* ================= PARENT ================= */}

                                        <button
                                            onClick={() => {
                                                navigate("/admin/expenses");
                                                setExpenseDropdownOpen(true);
                                            }}
                                            className={`group relative w-full flex items-center justify-between rounded-xl gap-2.5 px-3 py-2.5 text-[13px] font-mono font-semibold transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden cursor-pointer flex-shrink-0 ${isActive
                                                ? 'bg-zinc-900 text-white border border-cyan-500/30 shadow-[0_4px_20px_rgba(56,189,248,0.15)] active-menu-item'
                                                : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-100 hover:translate-x-1 border border-transparent'
                                                }`}
                                        >

                                            {/* ACTIVE NEON LEFT INDICATOR */}
                                            {isActive && (
                                                <div className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-r-full shadow-[0_0_8px_rgba(56,189,248,0.8)]'></div>
                                            )}

                                            <div className='flex items-center gap-2.5'>

                                                <div
                                                    className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-300 ${isActive
                                                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-inner'
                                                        : 'bg-zinc-900 text-zinc-400 group-hover:text-cyan-400 group-hover:bg-zinc-800'
                                                        }`}
                                                >
                                                    <item.icon className="text-[14px]" />
                                                </div>

                                                <span className='relative z-10 tracking-wide text-[13px]'>
                                                    {item.label}
                                                </span>

                                            </div>

                                            <div
                                                className='relative z-10 p-1 -m-1 text-zinc-500 group-hover:text-zinc-300 transition-colors'
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setExpenseDropdownOpen(!expenseDropdownOpen);
                                                }}
                                            >
                                                {expenseDropdownOpen ? (
                                                    <LuChevronDown className='text-[15px]' />
                                                ) : (
                                                    <LuChevronRight className='text-[15px]' />
                                                )}
                                            </div>

                                        </button>

                                        {/* ================= CHILD DROPDOWN ================= */}

                                        <div
                                            className={`w-full flex-shrink-0 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${expenseDropdownOpen
                                                ? "max-h-80 opacity-100 mt-1"
                                                : "max-h-0 opacity-0"
                                                }`}
                                        >

                                            <div className='flex flex-col ml-3.5 pl-2.5 border-l border-cyan-500/20 space-y-1 w-full'>

                                                {/* ================= MANAGE EXPENSES ================= */}

                                                <button
                                                    onClick={() =>
                                                        navigate("/admin/manage-expenses")
                                                    }
                                                    className={`group relative w-full flex items-center rounded-xl gap-2 px-2.5 py-2 text-[12.5px] font-mono transition-all duration-300 ease-out overflow-hidden cursor-pointer flex-shrink-0 ${location.pathname === "/admin/manage-expenses"
                                                        ? 'bg-zinc-900 text-cyan-300 border border-cyan-500/30 shadow-sm active-menu-item'
                                                        : 'text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-100 hover:translate-x-1 border border-transparent'
                                                        }`}
                                                >

                                                    {location.pathname === "/admin/manage-expenses" && (
                                                        <div className='absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3.5 bg-cyan-400 rounded-r-full shadow-[0_0_6px_rgba(56,189,248,0.8)]'></div>
                                                    )}

                                                    <div
                                                        className={`relative z-10 flex items-center justify-center w-5 h-5 rounded-md transition-all duration-300 ${location.pathname === "/admin/manage-expenses"
                                                            ? 'text-cyan-400'
                                                            : 'text-zinc-500 group-hover:text-cyan-400'
                                                            }`}
                                                    >
                                                        <LuWallet className="text-[13px]" />
                                                    </div>

                                                    <span className='relative z-10 tracking-wide'>
                                                        Manage Expenses
                                                    </span>

                                                </button>

                                                {/* ================= ADD EXPENSE ================= */}

                                                <button
                                                    onClick={() =>
                                                        navigate("/admin/add-expense")
                                                    }
                                                    className={`group relative w-full flex items-center rounded-xl gap-2 px-2.5 py-2 text-[12.5px] font-mono transition-all duration-300 ease-out overflow-hidden cursor-pointer flex-shrink-0 ${location.pathname === "/admin/add-expense"
                                                        ? 'bg-zinc-900 text-cyan-300 border border-cyan-500/30 shadow-sm active-menu-item'
                                                        : 'text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-100 hover:translate-x-1 border border-transparent'
                                                        }`}
                                                >

                                                    {location.pathname === "/admin/add-expense" && (
                                                        <div className='absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3.5 bg-cyan-400 rounded-r-full shadow-[0_0_6px_rgba(56,189,248,0.8)]'></div>
                                                    )}

                                                    <div
                                                        className={`relative z-10 flex items-center justify-center w-5 h-5 rounded-md transition-all duration-300 ${location.pathname === "/admin/add-expense"
                                                            ? 'text-cyan-400'
                                                            : 'text-zinc-500 group-hover:text-cyan-400'
                                                            }`}
                                                    >
                                                        <LuReceipt className="text-[13px]" />
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
                                                    className={`group relative w-full flex items-center rounded-xl gap-2 px-2.5 py-2 text-[12.5px] font-mono transition-all duration-300 ease-out overflow-hidden cursor-pointer flex-shrink-0 ${location.pathname === "/admin/budgets"
                                                        ? 'bg-zinc-900 text-cyan-300 border border-cyan-500/30 shadow-sm active-menu-item'
                                                        : 'text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-100 hover:translate-x-1 border border-transparent'
                                                        }`}
                                                >

                                                    {location.pathname === "/admin/budgets" && (
                                                        <div className='absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3.5 bg-cyan-400 rounded-r-full shadow-[0_0_6px_rgba(56,189,248,0.8)]'></div>
                                                    )}

                                                    <div
                                                        className={`relative z-10 flex items-center justify-center w-5 h-5 rounded-md transition-all duration-300 ${location.pathname === "/admin/budgets"
                                                            ? 'text-cyan-400'
                                                            : 'text-zinc-500 group-hover:text-cyan-400'
                                                            }`}
                                                    >
                                                        <LuBadgeIndianRupee className="text-[13px]" />
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
                                                    className={`group relative w-full flex items-center rounded-xl gap-2 px-2.5 py-2 text-[12.5px] font-mono transition-all duration-300 ease-out overflow-hidden cursor-pointer flex-shrink-0 ${location.pathname === "/admin/expense-analytics"
                                                        ? 'bg-zinc-900 text-cyan-300 border border-cyan-500/30 shadow-sm active-menu-item'
                                                        : 'text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-100 hover:translate-x-1 border border-transparent'
                                                        }`}
                                                >

                                                    {location.pathname === "/admin/expense-analytics" && (
                                                        <div className='absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3.5 bg-cyan-400 rounded-r-full shadow-[0_0_6px_rgba(56,189,248,0.8)]'></div>
                                                    )}

                                                    <div
                                                        className={`relative z-10 flex items-center justify-center w-5 h-5 rounded-md transition-all duration-300 ${location.pathname === "/admin/expense-analytics"
                                                            ? 'text-cyan-400'
                                                            : 'text-zinc-500 group-hover:text-cyan-400'
                                                            }`}
                                                    >
                                                        <LuChartPie className="text-[13px]" />
                                                    </div>

                                                    <span className='relative z-10 tracking-wide'>
                                                        Analytics
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
                                    className={`group relative w-full flex items-center rounded-xl gap-2.5 px-3 py-2.5 text-[13px] font-mono font-semibold transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden cursor-pointer flex-shrink-0 ${isActive
                                        ? 'bg-zinc-900 text-white border border-cyan-500/30 shadow-[0_4px_20px_rgba(56,189,248,0.15)] active-menu-item'
                                        : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-100 hover:translate-x-1 border border-transparent'
                                        }`}
                                >

                                    {/* ACTIVE NEON LEFT INDICATOR */}
                                    {isActive && (
                                        <div className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-r-full shadow-[0_0_8px_rgba(56,189,248,0.8)]'></div>
                                    )}

                                    <div
                                        className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-300 ${isActive
                                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-inner'
                                            : 'bg-zinc-900 text-zinc-400 group-hover:text-cyan-400 group-hover:bg-zinc-800'
                                            }`}
                                    >
                                        <item.icon className="text-[14px]" />
                                    </div>

                                    <span className='relative z-10 tracking-wide'>
                                        {item.label}
                                    </span>

                                </button>
                            );
                        })}

                        <div className='h-px bg-white/5 mx-1 my-2 flex-shrink-0' />

                        {/* ================= HOME ================= */}

                        <button
                            onClick={() => navigate("/")}
                            className='group relative w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-mono font-semibold text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-100 hover:translate-x-1 transition-all duration-300 cursor-pointer ease-[cubic-bezier(0.16,1,0.3,1)] border border-transparent flex-shrink-0'
                        >

                            <div className='relative z-10 flex items-center justify-center w-7 h-7 rounded-lg bg-zinc-900 text-zinc-400 group-hover:text-cyan-400 group-hover:bg-zinc-800 transition-all duration-300'>
                                <LuHouse className='text-[14px]' />
                            </div>

                            <span className='relative z-10 tracking-wide'>
                                Back To Home
                            </span>

                        </button>

                        {/* ================= LOGOUT ================= */}

                        <button
                            onClick={handleLogout}
                            className='group relative w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-mono font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:translate-x-1 transition-all duration-300 cursor-pointer ease-[cubic-bezier(0.16,1,0.3,1)] border border-transparent hover:border-red-500/20 flex-shrink-0'
                        >

                            <div className='relative z-10 flex items-center justify-center w-7 h-7 rounded-lg bg-red-500/10 text-red-400 group-hover:bg-red-500/20 transition-all duration-300'>
                                <LuLogOut className='text-[14px]' />
                            </div>

                            <span className='relative z-10 tracking-wide'>
                                Logout
                            </span>

                        </button>

                    </div>

                </div>

            </div>

            {/* ================= CYBER DARK SCROLLBAR ================= */}

            <style>{`

                .custom-side-scroll::-webkit-scrollbar {
                    width: 4px !important;
                    display: block !important;
                }

                .custom-side-scroll::-webkit-scrollbar-track {
                    background: transparent !important;
                }

                .custom-side-scroll::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1) !important;
                    border-radius: 10px !important;
                }

                .custom-side-scroll::-webkit-scrollbar-thumb:hover {
                    background: #38bdf8 !important;
                }

            `}</style>
        </>
    );
};

export default SideMenu;