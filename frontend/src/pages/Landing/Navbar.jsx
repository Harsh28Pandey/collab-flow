import { useContext, useState } from "react";
import { useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../../context/userContext.jsx";
import axiosInstance from "../../utils/axiosInstance.js";

const Navbar = () => {

    const dropdownRef = useRef(null);

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
            if (!dropdownRef.current) return;

            // only close if click is outside BOTH dropdown + button
            if (!dropdownRef.current.contains(event.target)) {
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

    return (
        <>
            {/* NAVBAR WRAPPER */}
            <div className="fixed top-3 left-0 w-full z-50 flex justify-center px-3">

                <nav className="w-full max-w-6xl bg-white/70 backdrop-blur-lg border border-gray-100 shadow-sm rounded-4xl px-4 py-2.5 flex items-center justify-between transition-all duration-300">

                    {/* LEFT */}
                    <div className="flex items-center justify-between w-full md:w-auto gap-3">

                        <div className="flex items-center gap-2">
                            <button
                                className="md:hidden text-indigo-600 cursor-pointer"
                                onClick={() => setIsOpen(!isOpen)}
                            >
                                {isOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>

                            <h1
                                onClick={() => navigate("/")}
                                className="text-base md:text-lg font-bold text-indigo-600 cursor-pointer tracking-wide"
                            >
                                Collab Flow
                            </h1>
                        </div>

                        {/* MOBILE PROFILE DROPDOWN */}
                        <div
                            className="md:hidden flex items-center relative"
                            ref={dropdownRef}
                        >
                            {user && (
                                <>
                                    {/* PROFILE BUTTON */}
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
                                                className="w-8 h-8 rounded-full object-cover border border-gray-200"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold uppercase">
                                                {user.name?.charAt(0)}
                                            </div>
                                        )}
                                    </button>

                                    {/* MOBILE DROPDOWN */}
                                    {isDropdownOpen && (
                                        <div className="absolute right-0 top-12 w-56 z-[9999] bg-white/95 backdrop-blur-xl border border-gray-100 shadow-2xl rounded-2xl overflow-hidden">

                                            {/* Dashboard */}
                                            <DropdownItem
                                                label="Dashboard"
                                                onClick={() => {
                                                    setIsDropdownOpen(false);

                                                    navigate(
                                                        user.role === "admin"
                                                            ? "/admin/dashboard"
                                                            : "/user/dashboard"
                                                    );
                                                }}
                                            />

                                            {/* Tasks */}
                                            <DropdownItem
                                                label={
                                                    user.role === "admin"
                                                        ? "Manage Tasks"
                                                        : "My Tasks"
                                                }
                                                onClick={() => {
                                                    setIsDropdownOpen(false);

                                                    navigate(
                                                        user.role === "admin"
                                                            ? "/admin/tasks"
                                                            : "/user/tasks"
                                                    );
                                                }}
                                            />

                                            {/* Change Password */}
                                            <DropdownItem
                                                label="Change Password"
                                                onClick={() => {
                                                    setIsDropdownOpen(false);
                                                    navigate("/forgot-password");
                                                }}
                                            />

                                            <div className="h-px bg-gray-100 my-1" />

                                            {/* Logout */}
                                            <DropdownItem
                                                label="Logout"
                                                danger
                                                onClick={handleLogout}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* CENTER LINKS (UPDATED UNDERLINE STYLE) */}
                    <div className="hidden md:flex gap-6">

                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path;

                            return (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className="relative px-1 py-1 font-semibold text-sm cursor-pointer group"
                                >
                                    <span
                                        className={`transition duration-200 ${isActive ? "text-indigo-600" : "text-gray-700 group-hover:text-indigo-600"
                                            }`}
                                    >
                                        {link.name}
                                    </span>

                                    {/* underline */}
                                    <span
                                        className={`
                                    absolute left-0 -bottom-1 h-[2px] rounded-full bg-gradient-to-r from-indigo-600 to-sky-500 transition-all duration-300
                                    ${isActive ? "w-full" : "w-0 group-hover:w-full"}
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
                                    <button className="px-6 py-2 text-base font-semibold text-blue-600 border border-blue-600 rounded-full bg-white transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer">
                                        Login
                                    </button>
                                </Link>

                                <Link to="/signup">
                                    <button className="px-6 py-2 text-base font-semibold text-white rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md hover:scale-105 hover:shadow-xl active:scale-95 transition-all duration-200 cursor-pointer">
                                        Signup
                                    </button>
                                </Link>
                            </>
                        ) : (
                            <div className="relative select-none" ref={dropdownRef}>

                                <div
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded-lg"
                                >
                                    {user.profileImageUrl ? (
                                        <img
                                            src={user.profileImageUrl}
                                            className="w-8 h-8 rounded-full object-cover border border-gray-200"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold uppercase">
                                            {user.name?.charAt(0)}
                                        </div>
                                    )}

                                    <span className="font-semibold text-sm text-gray-800">
                                        {user.name}
                                    </span>
                                </div>

                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl border border-gray-100 shadow-xl rounded-xl overflow-hidden z-50">

                                        <DropdownItem label="Dashboard" onClick={() => {
                                            setIsDropdownOpen(false);
                                            navigate(user.role === "admin" ? "/admin/dashboard" : "/user/dashboard");
                                        }} />

                                        <DropdownItem label={user.role === "admin" ? "Manage Tasks" : "My Tasks"} onClick={() => {
                                            setIsDropdownOpen(false);
                                            navigate(user.role === "admin" ? "/admin/tasks" : "/user/tasks");
                                        }} />

                                        <DropdownItem label="Change Password" onClick={() => {
                                            setIsDropdownOpen(false);
                                            navigate("/forgot-password");
                                        }} />

                                        <div className="h-px bg-gray-100 my-1" />

                                        <DropdownItem
                                            label="Logout"
                                            danger
                                            onClick={handleLogout}  // ✅ Direct function pass karo
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </nav>
            </div>

            {/* MOBILE DRAWER */}
            <div
                className={`fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-xl transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="p-5 flex flex-col h-full">

                    <button
                        onClick={() => setIsOpen(false)}
                        className="mb-6 text-indigo-600 cursor-pointer"
                    >
                        <X size={26} />
                    </button>

                    <div className="flex flex-col gap-3">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={`px-3 py-2 rounded-xl text-base font-semibold transition cursor-pointer
                            ${location.pathname === link.path
                                        ? "bg-indigo-100 text-indigo-600"
                                        : "text-gray-700"
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="mt-auto pt-8 flex flex-col gap-3">

                        {!user ? (
                            <>
                                <Link to="/login" onClick={() => setIsOpen(false)}>
                                    <button className="w-full py-2 rounded-full text-indigo-600 border border-indigo-200 font-semibold cursor-pointer">
                                        Login
                                    </button>
                                </Link>

                                <Link to="/signup" onClick={() => setIsOpen(false)}>
                                    <button className="w-full py-2 rounded-full text-white font-semibold bg-gradient-to-r from-indigo-600 to-sky-500 shadow cursor-pointer">
                                        Signup
                                    </button>
                                </Link>
                            </>
                        ) : (
                            <div
                                onClick={() => {
                                    setIsOpen(false);
                                    navigate(user.role === "admin" ? "/admin/dashboard" : "/user/dashboard");
                                }}
                                className="flex items-center gap-3 bg-gray-100 p-3 rounded-xl cursor-pointer"
                            >
                                {user.profileImageUrl ? (
                                    <img src={user.profileImageUrl} className="w-9 h-9 rounded-full object-cover" />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                                        {user.name?.charAt(0)}
                                    </div>
                                )}
                                <span className="font-semibold text-gray-700">{user.name}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* OVERLAY */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
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
                w-full text-left px-5 py-3 text-[15px] font-medium
                transition-all duration-200 cursor-pointer
                hover:bg-blue-50
                active:scale-[0.98]
                
                ${danger
                    ? "text-red-500 hover:bg-red-50"
                    : "text-gray-700 hover:text-blue-600"
                }
            `}
        >
            {label}
        </button>
    );
};