import React, { useContext, useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../../context/userContext.jsx";
import axiosInstance from "../../utils/axiosInstance.js";
import { LuSparkles, LuWorkflow, LuLayers, LuInfo, LuLayoutDashboard } from "react-icons/lu";

const Navbar = () => {
    const dropdownRef = useRef(null);
    const mobileDropdownRef = useRef(null);

    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useContext(UserContext);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // NavLinks with Icons for Developer Look
    const navLinks = [
        { name: "Home", path: "/", icon: <LuWorkflow size={16} /> },
        { name: "Features", path: "/features", icon: <LuLayers size={16} /> },
        { name: "Playground", path: "/playground", icon: <LuLayoutDashboard size={16} /> },
        { name: "About", path: "/about", icon: <LuInfo size={16} /> }
    ];

    // Scroll Effect Logic
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Click Outside Logic
    useEffect(() => {
        const handleClickOutside = (event) => {
            const clickedOutsideDesktop = dropdownRef.current && !dropdownRef.current.contains(event.target);
            const clickedOutsideMobile = mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target);

            if (clickedOutsideDesktop && clickedOutsideMobile) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        setIsDropdownOpen(false);

        try {
            await axiosInstance.post("/api/auth/logout");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            localStorage.removeItem("token");
            window.location.reload();
        }
    };

    const handleNavigate = (path) => {
        setIsDropdownOpen(false);
        setIsOpen(false);
        setTimeout(() => navigate(path), 0);
    };

    return (
        <>
            {/* NAVBAR WRAPPER (Ultimate Floating Glassmorphism Dock) */}
            <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 md:px-6 pointer-events-none">
                <header className={`pointer-events-auto w-full max-w-[1200px] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${scrolled
                    ? "bg-zinc-950/40 backdrop-blur-3xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-[2rem] py-3 px-5"
                    : "bg-transparent border-transparent py-4 px-2"
                    }`}>
                    <div className="flex items-center justify-between">

                        {/* LEFT: Logo & Mobile Toggle */}
                        <div className="flex items-center gap-4 w-full md:w-1/3 justify-between md:justify-start">

                            {/* Mobile Menu Button */}
                            <button
                                className="md:hidden text-zinc-400 hover:text-blue-400 cursor-pointer p-2 rounded-2xl hover:bg-zinc-900/80 active:scale-95 transition-all duration-300 flex-shrink-0"
                                onClick={() => setIsOpen(!isOpen)}
                            >
                                {isOpen ? <X size={24} strokeWidth={2.5} /> : <Menu size={24} strokeWidth={2.5} />}
                            </button>

                            {/* Logo */}
                            <div
                                onClick={() => navigate("/")}
                                className="flex items-center gap-3 cursor-pointer group"
                            >
                                <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 p-[1px] shadow-[0_0_20px_rgba(99,102,241,0.3)] group-hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] group-hover:scale-105 transition-all duration-500 ease-out">
                                    <div className="w-full h-full bg-zinc-950 rounded-[15px] flex items-center justify-center relative overflow-hidden">
                                        <div className="absolute inset-0 bg-blue-500/10 group-hover:bg-purple-500/20 transition-colors"></div>
                                        <LuSparkles className="w-5 h-5 text-blue-400 group-hover:text-purple-400 animate-pulse relative z-10 transition-colors" />
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[19px] font-extrabold tracking-tight text-zinc-100 flex items-center gap-1 group-hover:text-white transition-colors">
                                        Collab<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Flow</span>
                                    </span>
                                </div>
                            </div>

                            {/* Mobile Profile Display */}
                            <div className="md:hidden flex items-center relative" ref={mobileDropdownRef}>
                                {user && (
                                    <>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsDropdownOpen(!isDropdownOpen);
                                            }}
                                            className="cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-300 flex-shrink-0"
                                        >
                                            {user.profileImageUrl ? (
                                                <img
                                                    src={user.profileImageUrl}
                                                    className="w-10 h-10 rounded-2xl object-cover border-2 border-zinc-800 shadow-lg"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-600 text-white flex items-center justify-center text-sm font-black uppercase shadow-[0_2px_15px_rgba(99,102,241,0.4)] border border-white/10">
                                                    {user.name?.charAt(0)}
                                                </div>
                                            )}
                                        </button>

                                        {isDropdownOpen && (
                                            <div className="absolute right-0 top-14 w-60 z-[9999] bg-zinc-900/90 backdrop-blur-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.05)] rounded-[1.5rem] overflow-hidden p-2 animate-[fadeInUp_0.25s_ease-out] origin-top-right">
                                                <DropdownItem label="Dashboard" onClick={() => handleNavigate(user.role === "admin" ? "/admin/dashboard" : "/user/dashboard")} />
                                                <DropdownItem label={user.role === "admin" ? "Manage Tasks" : "My Tasks"} onClick={() => handleNavigate(user.role === "admin" ? "/admin/tasks" : "/user/tasks")} />
                                                {user?.role === "admin" && (
                                                    <>
                                                        <DropdownItem label="File Manager" onClick={() => handleNavigate("/admin/file-manager")} />
                                                        <DropdownItem label="Timesheet" onClick={() => handleNavigate("/admin/timesheet")} />
                                                        <DropdownItem label="Budgets" onClick={() => handleNavigate("/admin/budgets")} />
                                                        <DropdownItem label="Settings" onClick={() => handleNavigate("/admin/settings")} />
                                                    </>
                                                )}
                                                {user?.role !== "admin" && (
                                                    <>
                                                        <DropdownItem label="Files" onClick={() => handleNavigate("/user/files")} />
                                                        <DropdownItem label="My Expenses" onClick={() => handleNavigate("/user/my-expenses")} />
                                                        <DropdownItem label="Profile Settings" onClick={() => handleNavigate("/user/profile-settings")} />
                                                    </>
                                                )}
                                                <DropdownItem label="Change Password" onClick={() => handleNavigate("/forgot-password")} />
                                                <div className="h-px bg-white/5 my-2 mx-3" />
                                                <DropdownItem label="Logout" danger onClick={handleLogout} />
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* CENTER: Developer Sleek Pill Dock */}
                        <div className="hidden md:flex items-center justify-center w-1/3">
                            <nav className="flex items-center gap-1 bg-zinc-900/40 border border-white/5 backdrop-blur-2xl p-1.5 rounded-3xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]">
                                {navLinks.map((link) => {
                                    const isActive = location.pathname === link.path;
                                    return (
                                        <button
                                            key={link.name}
                                            onClick={() => navigate(link.path)}
                                            className={`relative flex items-center gap-2 px-4 py-2 rounded-2xl text-[13.5px] font-semibold transition-all duration-300 cursor-pointer overflow-hidden group ${isActive
                                                ? "text-white shadow-[0_2px_10px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]"
                                                : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                                                }`}
                                        >
                                            {isActive && (
                                                <span className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl -z-10"></span>
                                            )}
                                            <span className={`${isActive ? "text-blue-400" : "text-zinc-500 group-hover:text-blue-400"} transition-colors relative z-10`}>
                                                {link.icon}
                                            </span>
                                            <span className="relative z-10">{link.name}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* RIGHT: Action Buttons / Profile */}
                        <div className="hidden md:flex items-center justify-end w-1/3 gap-3 lg:gap-4">
                            {!user ? (
                                <>
                                    <button
                                        onClick={() => navigate("/login")}
                                        className="text-[14px] font-semibold text-zinc-400 hover:text-white px-4 py-2.5 rounded-2xl hover:bg-zinc-800/60 transition-all cursor-pointer"
                                    >
                                        Sign In
                                    </button>

                                    {/* Ultra Advanced Next-Level Glow Button */}
                                    <div className="relative group cursor-pointer">
                                        {/* Background Ambient Glow */}
                                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur-lg opacity-30 group-hover:opacity-70 transition duration-500 group-hover:duration-200"></div>

                                        <button
                                            onClick={() => navigate("/signup")}
                                            className="relative flex items-center justify-center px-6 py-2.5 rounded-[1.15rem] bg-zinc-950 text-white font-bold text-[14px] border border-white/10 hover:border-white/20 active:scale-95 transition-all duration-300 cursor-pointer"
                                        >
                                            <span className="absolute inset-0 rounded-[1.15rem] bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"></span>
                                            <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-white cursor-pointer">
                                                Start Building
                                            </span>
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="relative select-none" ref={dropdownRef}>
                                    <div
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="flex items-center gap-3 cursor-pointer pl-2 pr-4 py-1.5 rounded-[2rem] bg-zinc-900/40 hover:bg-zinc-800/80 transition-all duration-300 border border-white/5 hover:border-blue-500/30 group shadow-inner"
                                    >
                                        {user.profileImageUrl ? (
                                            <img
                                                src={user.profileImageUrl}
                                                className="w-9 h-9 rounded-full object-cover border border-zinc-700 shadow-sm group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 text-white flex items-center justify-center text-xs font-black uppercase shadow-[0_2px_10px_rgba(99,102,241,0.3)] border border-transparent group-hover:scale-105 transition-transform duration-300">
                                                {user.name?.charAt(0)}
                                            </div>
                                        )}

                                        <div className="flex flex-col items-start">
                                            <span className="font-bold text-[13.5px] text-zinc-200 group-hover:text-white leading-none tracking-wide">
                                                {user.name}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Desktop Dropdown */}
                                    {isDropdownOpen && (
                                        <div className="absolute right-0 mt-3 w-64 bg-zinc-900/90 backdrop-blur-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.05)] rounded-[1.5rem] overflow-hidden p-2 z-50 animate-[fadeInUp_0.25s_ease-out] origin-top-right">
                                            <DropdownItem label="Dashboard" onClick={() => handleNavigate(user.role === "admin" ? "/admin/dashboard" : "/user/dashboard")} />
                                            <DropdownItem label={user.role === "admin" ? "Manage Tasks" : "My Tasks"} onClick={() => handleNavigate(user.role === "admin" ? "/admin/tasks" : "/user/tasks")} />
                                            {user?.role === "admin" && (
                                                <>
                                                    <DropdownItem label="File Manager" onClick={() => handleNavigate("/admin/file-manager")} />
                                                    <DropdownItem label="Timesheet" onClick={() => handleNavigate("/admin/timesheet")} />
                                                    <DropdownItem label="Budgets" onClick={() => handleNavigate("/admin/budgets")} />
                                                    <DropdownItem label="Settings" onClick={() => handleNavigate("/admin/settings")} />
                                                </>
                                            )}
                                            {user?.role !== "admin" && (
                                                <>
                                                    <DropdownItem label="Files" onClick={() => handleNavigate("/user/files")} />
                                                    <DropdownItem label="My Expenses" onClick={() => handleNavigate("/user/my-expenses")} />
                                                    <DropdownItem label="Profile Settings" onClick={() => handleNavigate("/user/profile-settings")} />
                                                </>
                                            )}
                                            <DropdownItem label="Change Password" onClick={() => handleNavigate("/forgot-password")} />
                                            <div className="h-px bg-white/5 my-2 mx-3" />
                                            <DropdownItem label="Logout" danger onClick={handleLogout} />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>
                </header>
            </div>

            {/* MOBILE DRAWER (Hacker / Glassmorphism) */}
            <div
                className={`fixed top-0 left-0 h-full w-[300px] bg-zinc-950/90 backdrop-blur-3xl z-[100] border-r border-white/5 shadow-[20px_0_60px_rgba(0,0,0,0.9)] transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-r-[2rem] ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                <div className="p-6 flex flex-col h-full relative">

                    <button
                        onClick={() => setIsOpen(false)}
                        className="mb-8 text-zinc-400 hover:text-blue-400 cursor-pointer self-end p-2 rounded-2xl hover:bg-zinc-900/80 transition-all duration-300 active:scale-95"
                    >
                        <X size={26} strokeWidth={2.5} />
                    </button>

                    <div className="flex flex-col gap-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={`relative flex items-center gap-3 px-4 py-4 rounded-2xl text-[16px] font-bold transition-all duration-300 cursor-pointer overflow-hidden
                                ${location.pathname === link.path
                                        ? "text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] border border-white/10"
                                        : "text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-100 border border-transparent"
                                    }`}
                            >
                                {location.pathname === link.path && (
                                    <span className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/10 rounded-2xl -z-10"></span>
                                )}
                                <span className={location.pathname === link.path ? "text-blue-400 relative z-10" : "text-zinc-500 relative z-10"}>
                                    {link.icon}
                                </span>
                                <span className="relative z-10">{link.name}</span>
                            </Link>
                        ))}
                    </div>

                    <div className="mt-auto pt-8 flex flex-col gap-4 border-t border-white/5">
                        {!user ? (
                            <>
                                <button
                                    onClick={() => { navigate("/login"); setIsOpen(false); }}
                                    className="w-full py-4 rounded-2xl text-zinc-300 font-bold bg-zinc-900/50 border border-white/5 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer active:scale-95"
                                >
                                    Sign In
                                </button>
                                <div className="relative group cursor-pointer w-full">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-80 transition duration-500"></div>
                                    <button
                                        onClick={() => { navigate("/signup"); setIsOpen(false); }}
                                        className="relative w-full py-4 rounded-2xl text-white font-black bg-zinc-950 border border-white/10 active:scale-95 transition-all duration-300 flex justify-center items-center"
                                    >
                                        <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10"></span>
                                        <span className="relative z-10">Start Building</span>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div
                                onClick={() => {
                                    handleNavigate(user.role === "admin" ? "/admin/dashboard" : "/user/dashboard");
                                    setIsOpen(false);
                                }}
                                className="flex items-center gap-4 bg-zinc-900/60 p-4 rounded-3xl cursor-pointer border border-white/5 hover:bg-zinc-800 hover:border-blue-500/40 transition-all duration-300 group shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                            >
                                {user.profileImageUrl ? (
                                    <img src={user.profileImageUrl} className="w-12 h-12 rounded-2xl object-cover border border-zinc-700 shadow-md group-hover:scale-105 transition-transform" />
                                ) : (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-600 text-white flex items-center justify-center font-black text-lg shadow-[0_2px_15px_rgba(99,102,241,0.4)] border border-transparent group-hover:scale-105 transition-transform">
                                        {user.name?.charAt(0)}
                                    </div>
                                )}
                                <div className="flex flex-col text-left">
                                    <span className="font-extrabold text-zinc-100 text-[16px] group-hover:text-blue-400 transition-colors">{user.name}</span>
                                    <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-[0.1em] mt-0.5">{user.role || 'Developer'}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MOBILE OVERLAY */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md z-[90] transition-opacity duration-500 ease-out cursor-pointer"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* CSS For Dropdown Animation & Shimmer */}
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                .animate-\\[fadeInUp_0\\.25s_ease-out\\] {
                    animation: fadeInUp 0.25s ease-out forwards;
                }
            `}</style>
        </>
    );
};

export default Navbar;

// Advanced Developer Styled Dropdown Item
const DropdownItem = ({ label, onClick, danger }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                w-full text-left px-4 py-2.5 text-[13.5px] font-bold rounded-2xl
                transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer active:scale-95 flex items-center gap-2
                
                ${danger
                    ? "text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    : "text-zinc-300 hover:bg-white/10 hover:text-blue-400"
                }
            `}
        >
            {label}
        </button>
    );
};