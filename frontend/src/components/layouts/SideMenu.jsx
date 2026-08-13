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
    LuWallet
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
            <div className='w-[235px] lg:w-[245px] h-screen flex flex-col bg-white/80 backdrop-blur-xl border-r border-slate-200/80 z-20'>

                {/* ================= PROFILE ================= */}

                <div className='relative flex flex-col items-center justify-center px-3 pt-4 pb-3 flex-shrink-0'>

                    <div className='relative group cursor-pointer' onClick={() => navigate(user?.role === 'admin' ? '/admin/settings' : '/user/profile-settings')}>

                        {user?.profileImageUrl ? (

                            <img
                                src={user?.profileImageUrl}
                                alt="Profile"
                                className='relative w-12 h-12 border-[2.5px] object-cover rounded-full border-white shadow-[0_4px_12px_rgba(249,115,22,0.15)] transition-all duration-300 group-hover:scale-105'
                            />

                        ) : (

                            <div className='relative w-12 h-12 text-[15px] border-[2.5px] flex items-center justify-center bg-gradient-to-tr from-orange-400 to-orange-600 text-white font-bold rounded-full border-white shadow-[0_4px_12px_rgba(249,115,22,0.2)] transition-all duration-300 group-hover:scale-105 uppercase'>
                                {user?.name
                                    ? user.name.charAt(0)
                                    : "?"
                                }
                            </div>

                        )}

                        <div className='absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full'></div>

                    </div>

                    {user?.role === "admin" && (
                        <div className='mt-2.5 px-2.5 py-0.5 text-[9px] font-bold text-orange-700 bg-orange-50 border border-orange-200 rounded-full tracking-wider uppercase'>
                            ADMIN
                        </div>
                    )}

                    {user?.role === "member" && (
                        <div className='mt-2.5 px-2.5 py-0.5 text-[9px] font-bold text-orange-700 bg-orange-50 border border-orange-200 rounded-full tracking-wider uppercase'>
                            MEMBER
                        </div>
                    )}

                    <h5 className='text-slate-800 font-extrabold text-[14px] mt-2 leading-5 text-center'>
                        {user?.name || ""}
                    </h5>

                    <p className='text-[10px] mt-0.5 text-slate-500 font-medium text-center break-all leading-4'>
                        {user?.email || ""}
                    </p>

                </div>

                {/* ================= MENU ================= */}

                <div
                    ref={scrollContainerRef}
                    className="flex-1 overflow-y-scroll py-2 px-2 custom-side-scroll"
                >

                    <div className='space-y-1 pb-10'>

                        <div className='h-px bg-slate-100 mx-2 mb-2 mt-1' />

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
                                            onClick={() => {
                                                navigate("/admin/expenses");
                                                setExpenseDropdownOpen(true);
                                            }}
                                            className={`group relative w-full flex items-center justify-between rounded-xl gap-2.5 px-2.5 py-2 text-[13.5px] font-semibold transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden cursor-pointer ${isActive
                                                ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-[0_4px_12px_rgba(249,115,22,0.25)] active-menu-item'
                                                : 'text-slate-600 hover:bg-orange-50/80 hover:text-orange-600 hover:translate-x-1'
                                                }`}
                                        >

                                            {/* WHITE ACTIVE LINE */}
                                            {isActive && (
                                                <div className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full shadow-sm'></div>
                                            )}

                                            <div className='flex items-center gap-2.5'>

                                                <div
                                                    className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-300 ${isActive
                                                        ? 'bg-white/20 text-white shadow-inner'
                                                        : 'bg-orange-100/50 text-orange-500 group-hover:bg-white group-hover:shadow-sm'
                                                        }`}
                                                >
                                                    <item.icon className="text-[15px]" />
                                                </div>

                                                <span className='relative z-10 tracking-wide'>
                                                    {item.label}
                                                </span>

                                            </div>

                                            <div
                                                className='relative z-10 p-1 -m-1'
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setExpenseDropdownOpen(!expenseDropdownOpen);
                                                }}
                                            >
                                                {expenseDropdownOpen ? (
                                                    <LuChevronDown className='text-[16px]' />
                                                ) : (
                                                    <LuChevronRight className='text-[16px]' />
                                                )}
                                            </div>

                                        </button>

                                        {/* ================= CHILD DROPDOWN ================= */}

                                        <div
                                            className={`overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${expenseDropdownOpen
                                                ? "max-h-80 opacity-100 mt-1"
                                                : "max-h-0 opacity-0"
                                                }`}
                                        >

                                            <div className='ml-4 mt-1.5 pl-3 border-l-2 border-orange-100/60 space-y-1'>

                                                {/* ================= MANAGE EXPENSES ================= */}

                                                <button
                                                    onClick={() =>
                                                        navigate("/admin/manage-expenses")
                                                    }
                                                    className={`group relative w-full flex items-center rounded-xl gap-2.5 px-2.5 py-2 text-[13px] font-semibold transition-all duration-300 ease-out overflow-hidden cursor-pointer ${location.pathname === "/admin/manage-expenses"
                                                        ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-[0_4px_12px_rgba(249,115,22,0.25)] active-menu-item'
                                                        : 'text-slate-600 hover:bg-orange-50/80 hover:text-orange-600 hover:translate-x-1'
                                                        }`}
                                                >

                                                    {location.pathname === "/admin/manage-expenses" && (
                                                        <div className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-white rounded-r-full shadow-sm'></div>
                                                    )}

                                                    <div
                                                        className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-md transition-all duration-300 ${location.pathname === "/admin/manage-expenses"
                                                            ? 'bg-white/20 text-white'
                                                            : 'bg-orange-100/50 text-orange-500 group-hover:bg-white group-hover:shadow-sm'
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
                                                    className={`group relative w-full flex items-center rounded-xl gap-2.5 px-2.5 py-2 text-[13px] font-semibold transition-all duration-300 ease-out overflow-hidden cursor-pointer ${location.pathname === "/admin/add-expense"
                                                        ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-[0_4px_12px_rgba(249,115,22,0.25)] active-menu-item'
                                                        : 'text-slate-600 hover:bg-orange-50/80 hover:text-orange-600 hover:translate-x-1'
                                                        }`}
                                                >

                                                    {location.pathname === "/admin/add-expense" && (
                                                        <div className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-white rounded-r-full shadow-sm'></div>
                                                    )}

                                                    <div
                                                        className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-md transition-all duration-300 ${location.pathname === "/admin/add-expense"
                                                            ? 'bg-white/20 text-white'
                                                            : 'bg-orange-100/50 text-orange-500 group-hover:bg-white group-hover:shadow-sm'
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
                                                    className={`group relative w-full flex items-center rounded-xl gap-2.5 px-2.5 py-2 text-[13px] font-semibold transition-all duration-300 ease-out overflow-hidden cursor-pointer ${location.pathname === "/admin/budgets"
                                                        ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-[0_4px_12px_rgba(249,115,22,0.25)] active-menu-item'
                                                        : 'text-slate-600 hover:bg-orange-50/80 hover:text-orange-600 hover:translate-x-1'
                                                        }`}
                                                >

                                                    {location.pathname === "/admin/budgets" && (
                                                        <div className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-white rounded-r-full shadow-sm'></div>
                                                    )}

                                                    <div
                                                        className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-md transition-all duration-300 ${location.pathname === "/admin/budgets"
                                                            ? 'bg-white/20 text-white'
                                                            : 'bg-orange-100/50 text-orange-500 group-hover:bg-white group-hover:shadow-sm'
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
                                                    className={`group relative w-full flex items-center rounded-xl gap-2.5 px-2.5 py-2 text-[13px] font-semibold transition-all duration-300 ease-out overflow-hidden cursor-pointer ${location.pathname === "/admin/expense-analytics"
                                                        ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-[0_4px_12px_rgba(249,115,22,0.25)] active-menu-item'
                                                        : 'text-slate-600 hover:bg-orange-50/80 hover:text-orange-600 hover:translate-x-1'
                                                        }`}
                                                >

                                                    {location.pathname === "/admin/expense-analytics" && (
                                                        <div className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-white rounded-r-full shadow-sm'></div>
                                                    )}

                                                    <div
                                                        className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-md transition-all duration-300 ${location.pathname === "/admin/expense-analytics"
                                                            ? 'bg-white/20 text-white'
                                                            : 'bg-orange-100/50 text-orange-500 group-hover:bg-white group-hover:shadow-sm'
                                                            }`}
                                                    >
                                                        <LuChartPie className="text-[13px]" />
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
                                    className={`group relative w-full flex items-center rounded-xl gap-2.5 px-2.5 py-2 text-[13.5px] font-semibold transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden cursor-pointer ${isActive
                                        ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-[0_4px_12px_rgba(249,115,22,0.25)] active-menu-item'
                                        : 'text-slate-600 hover:bg-orange-50/80 hover:text-orange-600 hover:translate-x-1'
                                        }`}
                                >

                                    {!isActive && (
                                        <div className='absolute inset-0 bg-gradient-to-r from-orange-100/0 via-orange-100/40 to-orange-100/0 opacity-0 group-hover:opacity-100 transition-all duration-500'></div>
                                    )}

                                    {isActive && (
                                        <div className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full shadow-sm'></div>
                                    )}

                                    <div
                                        className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-300 ${isActive
                                            ? 'bg-white/20 text-white shadow-inner'
                                            : 'bg-orange-100/50 text-orange-500 group-hover:bg-white group-hover:shadow-sm'
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

                        <div className='h-px bg-slate-100 mx-2 my-2' />

                        {/* ================= HOME ================= */}

                        <button
                            onClick={() => navigate("/")}
                            className='group relative w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13.5px] font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:translate-x-1 transition-all duration-300 cursor-pointer ease-[cubic-bezier(0.16,1,0.3,1)]'
                        >

                            <div className='relative z-10 flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-500 group-hover:bg-white group-hover:shadow-sm transition-all duration-300'>
                                <LuHouse className='text-[15px]' />
                            </div>

                            <span className='relative z-10 tracking-wide'>
                                Back To Home
                            </span>

                        </button>

                        {/* ================= LOGOUT ================= */}

                        <button
                            onClick={handleLogout}
                            className='group relative w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13.5px] font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 hover:translate-x-1 transition-all duration-300 cursor-pointer ease-[cubic-bezier(0.16,1,0.3,1)]'
                        >

                            <div className='relative z-10 flex items-center justify-center w-7 h-7 rounded-lg bg-red-100/50 text-red-500 group-hover:bg-white group-hover:shadow-sm transition-all duration-300'>
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

                .custom-side-scroll::-webkit-scrollbar {
                    width: 5px !important;
                    display: block !important;
                }

                .custom-side-scroll::-webkit-scrollbar-track {
                    background: transparent !important;
                }

                .custom-side-scroll::-webkit-scrollbar-thumb {
                    background: #fed7aa !important;
                    border-radius: 10px !important;
                }

                .custom-side-scroll::-webkit-scrollbar-thumb:hover {
                    background: #f97316 !important;
                }

            `}</style>
        </>
    );
};

export default SideMenu;