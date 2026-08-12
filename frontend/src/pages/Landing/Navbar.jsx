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
            <div className="fixed top-4 left-0 w-full z-50 flex justify-center px-4">

                <nav className="w-full max-w-6xl bg-white/70 backdrop-blur-2xl border border-slate-200/60 shadow-[0_12px_40px_rgba(0,0,0,0.06)] rounded-full px-6 py-3 flex items-center justify-between transition-all duration-300">

                    {/* LEFT: Logo & Mobile Toggle */}
                    <div className="flex items-center justify-between w-full md:w-auto gap-4">

                        <div className="flex items-center gap-3">
                            <button
                                className="md:hidden text-orange-500 cursor-pointer p-1.5 rounded-full hover:bg-orange-50 transition-colors"
                                onClick={() => setIsOpen(!isOpen)}
                            >
                                {isOpen ? <X size={22} /> : <Menu size={22} />}
                            </button>

                            {/* Clean Logo (Circle removed completely) */}
                            <div
                                onClick={() => navigate("/")}
                                className="cursor-pointer group flex items-center"
                            >
                                <h1 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight">
                                    Collab{" "}
                                    <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
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
                                        className="cursor-pointer"
                                    >
                                        {user.profileImageUrl ? (
                                            <img
                                                src={user.profileImageUrl}
                                                className="w-9 h-9 rounded-full object-cover border-2 border-orange-200"
                                            />
                                        ) : (
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-yellow-500 text-white flex items-center justify-center text-sm font-bold uppercase shadow-sm">
                                                {user.name?.charAt(0)}
                                            </div>
                                        )}
                                    </button>

                                    {isDropdownOpen && (
                                        <div className="absolute right-0 top-12 w-56 z-[9999] bg-white/95 backdrop-blur-2xl border border-slate-200/80 shadow-2xl rounded-2xl overflow-hidden p-1.5 animate-[fadeInUp_0.2s_cubic-bezier(0.16,1,0.3,1)]">
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
                                            <div className="h-px bg-slate-100 my-1" />
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
                                    className="relative px-1 py-1 font-semibold text-sm cursor-pointer group"
                                >
                                    <span
                                        className={`transition-colors duration-300 ${isActive
                                                ? "text-orange-600 font-bold"
                                                : "text-slate-600 group-hover:text-orange-600"
                                            }`}
                                    >
                                        {link.name}
                                    </span>

                                    <span
                                        className={`
                                            absolute left-0 -bottom-1 h-[2px] rounded-full bg-gradient-to-r from-orange-500 to-yellow-400 transition-all duration-300
                                            ${isActive ? "w-full" : "w-0 group-hover:w-full"}
                                        `}
                                    />
                                </Link>
                            );
                        })}
                    </div>

                    {/* RIGHT SECTION */}
                    <div className="hidden md:flex items-center gap-4">
                        {!user ? (
                            <>
                                <Link to="/login">
                                    <button className="px-6 py-2.5 text-sm font-bold text-slate-700 hover:text-orange-600 transition-colors cursor-pointer">
                                        Login
                                    </button>
                                </Link>

                                <Link to="/signup">
                                    <button className="px-7 py-2.5 text-sm font-bold text-white rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 shadow-[0_4px_20px_rgba(249,115,22,0.3)] hover:shadow-[0_6px_25px_rgba(249,115,22,0.4)] hover:-translate-y-0.5 active:scale-95 transition-all duration-300 cursor-pointer">
                                        Signup
                                    </button>
                                </Link>
                            </>
                        ) : (
                            <div className="relative select-none" ref={dropdownRef}>
                                <div
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-2.5 cursor-pointer px-3 py-1.5 rounded-full hover:bg-slate-100/80 transition-colors border border-transparent hover:border-slate-200"
                                >
                                    {user.profileImageUrl ? (
                                        <img
                                            src={user.profileImageUrl}
                                            className="w-8 h-8 rounded-full object-cover border-2 border-orange-200"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-yellow-500 text-white flex items-center justify-center text-xs font-bold uppercase shadow-sm">
                                            {user.name?.charAt(0)}
                                        </div>
                                    )}

                                    <span className="font-semibold text-sm text-slate-800">
                                        {user.name}
                                    </span>
                                </div>

                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-2xl border border-slate-200/80 shadow-2xl rounded-2xl overflow-hidden p-1.5 z-50 animate-[fadeInUp_0.3s_cubic-bezier(0.16,1,0.3,1)]">
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
                                        <div className="h-px bg-slate-100 my-1" />
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
                className={`fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="p-6 flex flex-col h-full">

                    <button
                        onClick={() => setIsOpen(false)}
                        className="mb-8 text-orange-500 cursor-pointer self-end p-2 rounded-full hover:bg-orange-50 transition-colors"
                    >
                        <X size={24} />
                    </button>

                    <div className="flex flex-col gap-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={`px-4 py-3 rounded-xl text-base font-semibold transition cursor-pointer
                                ${location.pathname === link.path
                                        ? "bg-orange-50 text-orange-600 font-bold"
                                        : "text-slate-700 hover:bg-slate-50 hover:text-orange-600"
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
                                    <button className="w-full py-3 rounded-full text-slate-700 font-bold border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                                        Login
                                    </button>
                                </Link>

                                <Link to="/signup" onClick={() => setIsOpen(false)}>
                                    <button className="w-full py-3 rounded-full text-white font-bold bg-gradient-to-r from-orange-500 to-yellow-500 shadow-md hover:shadow-lg transition-all cursor-pointer">
                                        Signup
                                    </button>
                                </Link>
                            </>
                        ) : (
                            <div
                                onClick={() => handleNavigate(user.role === "admin" ? "/admin/dashboard" : "/user/dashboard")}
                                className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-2xl cursor-pointer border border-slate-100 hover:bg-slate-100 transition-colors"
                            >
                                {user.profileImageUrl ? (
                                    <img src={user.profileImageUrl} className="w-10 h-10 rounded-full object-cover border-2 border-orange-200" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-yellow-500 text-white flex items-center justify-center font-bold shadow-sm">
                                        {user.name?.charAt(0)}
                                    </div>
                                )}
                                <div className="flex flex-col text-left">
                                    <span className="font-bold text-slate-800 text-sm">{user.name}</span>
                                    <span className="text-xs text-orange-600 font-medium capitalize">{user.role || 'User'}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* OVERLAY */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
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
                w-full text-left px-4 py-2.5 text-sm font-medium rounded-xl
                transition-all duration-200 cursor-pointer
                
                ${danger
                    ? "text-red-500 hover:bg-red-50"
                    : "text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                }
            `}
        >
            {label}
        </button>
    );
};