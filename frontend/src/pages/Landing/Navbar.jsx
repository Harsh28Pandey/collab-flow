import { useContext, useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../../context/userContext.jsx";
import axiosInstance from "../../utils/axiosInstance.js";

const Navbar = () => {
    const dropdownRef = useRef(null);
    const mobileDropdownRef = useRef(null);

    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useContext(UserContext);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const navLinks = [
        { name: "Home", path: "/" },
        { name: "Features", path: "/features" },
        { name: "About", path: "/about" }
    ];

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
            {/* NAVBAR WRAPPER */}
            <div className="fixed top-4 left-0 w-full z-50 flex justify-center px-4 md:px-6">

                {/* Ultra-Premium Glassmorphic Nav */}
                <nav className="w-full max-w-6xl bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_rgba(249,115,22,0.05),inset_0_1px_1px_rgba(255,255,255,1)] rounded-full px-5 md:px-7 py-2.5 md:py-3 flex items-center justify-between transition-all duration-500 hover:bg-white/70 hover:shadow-[0_12px_40px_rgba(249,115,22,0.08),inset_0_1px_1px_rgba(255,255,255,1)]">

                    {/* LEFT: Logo & Mobile Toggle */}
                    <div className="flex items-center justify-between w-full md:w-auto gap-4">

                        <div className="flex items-center gap-3">
                            <button
                                className="md:hidden text-slate-500 hover:text-orange-500 cursor-pointer p-1.5 rounded-full hover:bg-orange-50/80 active:scale-95 transition-all duration-300"
                                onClick={() => setIsOpen(!isOpen)}
                            >
                                {isOpen ? <X size={22} strokeWidth={2.5} /> : <Menu size={22} strokeWidth={2.5} />}
                            </button>

                            <div
                                onClick={() => navigate("/")}
                                className="cursor-pointer group flex items-center"
                            >
                                <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]">
                                    Collab{" "}
                                    <span className="bg-gradient-to-br from-orange-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent drop-shadow-sm">
                                        Flow
                                    </span>
                                </h1>
                            </div>
                        </div>

                        {/* MOBILE PROFILE DROPDOWN */}
                        <div
                            className="md:hidden flex items-center relative"
                            ref={mobileDropdownRef}
                        >
                            {user && (
                                <>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsDropdownOpen(!isDropdownOpen);
                                        }}
                                        className="cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-300"
                                    >
                                        {user.profileImageUrl ? (
                                            <img
                                                src={user.profileImageUrl}
                                                className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-[0_2px_10px_rgba(249,115,22,0.2)]"
                                            />
                                        ) : (
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-yellow-500 text-white flex items-center justify-center text-sm font-bold uppercase shadow-[0_2px_10px_rgba(249,115,22,0.3)] border-2 border-white">
                                                {user.name?.charAt(0)}
                                            </div>
                                        )}
                                    </button>

                                    {isDropdownOpen && (
                                        <div className="absolute right-0 top-12 w-56 z-[9999] bg-white/80 backdrop-blur-3xl border border-white/60 shadow-[0_16px_40px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.02)] rounded-2xl overflow-hidden p-1.5 animate-[fadeInUp_0.25s_cubic-bezier(0.16,1,0.3,1)] origin-top-right">
                                            <DropdownItem
                                                label="Dashboard"
                                                onClick={() => handleNavigate(
                                                    user.role === "admin"
                                                        ? "/admin/dashboard"
                                                        : "/user/dashboard"
                                                )}
                                            />
                                            <DropdownItem
                                                label={user.role === "admin" ? "Manage Tasks" : "My Tasks"}
                                                onClick={() => handleNavigate(
                                                    user.role === "admin"
                                                        ? "/admin/tasks"
                                                        : "/user/tasks"
                                                )}
                                            />
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
                                            <div className="h-px bg-slate-200/50 my-1 mx-2" />
                                            <DropdownItem label="Logout" danger onClick={handleLogout} />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* CENTER LINKS */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path;

                            return (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className="relative px-2 py-1 text-[15px] font-semibold cursor-pointer group"
                                >
                                    <span
                                        className={`transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isActive
                                            ? "text-orange-600 font-bold"
                                            : "text-slate-500 group-hover:text-slate-900"
                                            }`}
                                    >
                                        {link.name}
                                    </span>

                                    {/* Glowing Underline for Active/Hover */}
                                    <span
                                        className={`
                                            absolute left-1/2 -translate-x-1/2 -bottom-1.5 h-[2.5px] rounded-t-full bg-gradient-to-r from-orange-400 to-yellow-400 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_0_8px_rgba(249,115,22,0.6)]
                                            ${isActive ? "w-3/4 opacity-100" : "w-0 opacity-0 group-hover:w-3/4 group-hover:opacity-100"}
                                        `}
                                    />
                                </Link>
                            );
                        })}
                    </div>

                    {/* RIGHT SECTION */}
                    <div className="hidden md:flex items-center gap-3">
                        {!user ? (
                            <>
                                <Link to="/login">
                                    <button className="px-5 py-2 text-[15px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-full transition-all duration-300 cursor-pointer ease-[cubic-bezier(0.16,1,0.3,1)]">
                                        Login
                                    </button>
                                </Link>

                                <Link to="/signup">
                                    <button className="px-6 py-2.5 text-[14px] font-bold text-white rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 shadow-[0_4px_14px_rgba(249,115,22,0.3)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.4)] hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer border border-orange-400/50">
                                        Signup
                                    </button>
                                </Link>
                            </>
                        ) : (
                            <div className="relative select-none" ref={dropdownRef}>
                                <div
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-2.5 cursor-pointer px-2.5 py-1.5 rounded-full hover:bg-slate-100/60 transition-colors duration-300 border border-transparent hover:border-slate-200/60 group"
                                >
                                    {user.profileImageUrl ? (
                                        <img
                                            src={user.profileImageUrl}
                                            className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-[0_2px_8px_rgba(249,115,22,0.15)] group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-yellow-500 text-white flex items-center justify-center text-xs font-bold uppercase shadow-[0_2px_8px_rgba(249,115,22,0.2)] border-2 border-white group-hover:scale-105 transition-transform duration-300">
                                            {user.name?.charAt(0)}
                                        </div>
                                    )}

                                    <span className="font-semibold text-[15px] text-slate-700 group-hover:text-slate-900 pr-1">
                                        {user.name}
                                    </span>
                                </div>

                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-3 w-60 bg-white/80 backdrop-blur-3xl border border-white/60 shadow-[0_16px_40px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.02)] rounded-2xl overflow-hidden p-1.5 z-50 animate-[fadeInUp_0.25s_cubic-bezier(0.16,1,0.3,1)] origin-top-right">
                                        <DropdownItem
                                            label="Dashboard"
                                            onClick={() => handleNavigate(user.role === "admin" ? "/admin/dashboard" : "/user/dashboard")}
                                        />
                                        <DropdownItem
                                            label={user.role === "admin" ? "Manage Tasks" : "My Tasks"}
                                            onClick={() => handleNavigate(user.role === "admin" ? "/admin/tasks" : "/user/tasks")}
                                        />
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
                                        <div className="h-px bg-slate-200/50 my-1 mx-2" />
                                        <DropdownItem label="Logout" danger onClick={handleLogout} />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </nav>
            </div>

            {/* MOBILE DRAWER */}
            <div
                className={`fixed top-0 left-0 h-full w-[280px] bg-white/95 backdrop-blur-3xl z-50 border-r border-white/60 shadow-[20px_0_40px_rgba(0,0,0,0.08)] transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="p-6 flex flex-col h-full relative">

                    <button
                        onClick={() => setIsOpen(false)}
                        className="mb-8 text-slate-400 hover:text-orange-500 cursor-pointer self-end p-2 rounded-full hover:bg-orange-50/80 transition-all duration-300 active:scale-95"
                    >
                        <X size={24} strokeWidth={2.5} />
                    </button>

                    <div className="flex flex-col gap-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={`px-4 py-3.5 rounded-2xl text-[15px] font-semibold transition-all duration-300 cursor-pointer
                                ${location.pathname === link.path
                                        ? "bg-gradient-to-r from-orange-50 to-yellow-50 text-orange-600 shadow-sm border border-orange-100/50"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="mt-auto pt-8 flex flex-col gap-3 border-t border-slate-100">
                        {!user ? (
                            <>
                                <Link to="/login" onClick={() => setIsOpen(false)}>
                                    <button className="w-full py-3.5 rounded-3xl text-slate-700 font-bold bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                                        Login
                                    </button>
                                </Link>

                                <Link to="/signup" onClick={() => setIsOpen(false)}>
                                    <button className="w-full py-3.5 rounded-3xl text-white font-bold bg-gradient-to-r from-orange-500 to-yellow-500 shadow-[0_4px_14px_rgba(249,115,22,0.3)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.4)] active:scale-[0.98] transition-all duration-300 cursor-pointer">
                                        Signup
                                    </button>
                                </Link>
                            </>
                        ) : (
                            <div
                                onClick={() => handleNavigate(user.role === "admin" ? "/admin/dashboard" : "/user/dashboard")}
                                className="flex items-center gap-3.5 bg-slate-50 p-4 rounded-2xl cursor-pointer border border-slate-100/80 hover:bg-slate-100 hover:border-slate-200 transition-all duration-300 group"
                            >
                                {user.profileImageUrl ? (
                                    <img src={user.profileImageUrl} className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm group-hover:scale-105 transition-transform" />
                                ) : (
                                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-orange-500 to-yellow-500 text-white flex items-center justify-center font-bold shadow-sm border-2 border-white group-hover:scale-105 transition-transform">
                                        {user.name?.charAt(0)}
                                    </div>
                                )}
                                <div className="flex flex-col text-left">
                                    <span className="font-bold text-slate-800 text-[15px]">{user.name}</span>
                                    <span className="text-[11px] text-orange-600 font-bold uppercase tracking-wider">{user.role || 'User'}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* OVERLAY */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity duration-500 ease-out"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
};

export default Navbar;

const DropdownItem = ({ label, onClick, danger }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                w-full text-left px-4 py-2.5 text-[14px] font-semibold rounded-2xl
                transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer active:scale-[0.98]
                
                ${danger
                    ? "text-red-500 hover:bg-red-50 hover:text-red-600"
                    : "text-slate-600 hover:bg-orange-50/60 hover:text-orange-600"
                }
            `}
        >
            {label}
        </button>
    );
};