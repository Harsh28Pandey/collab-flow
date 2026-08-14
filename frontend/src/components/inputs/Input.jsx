// src/components/inputs/Input.jsx
import React, { useState } from 'react'
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

const Input = ({ value, onChange, label, placeholder, type, onBlur }) => {

    const [showPassword, setShowPassword] = useState(false);

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    }

    return (
        <div className="w-full space-y-1.5">
            {label && (
                <label className='block text-[13px] font-mono text-zinc-300 tracking-wide'>
                    {label}
                </label>
            )}

            <div className='flex items-center w-full bg-zinc-900/90 border border-white/10 focus-within:border-cyan-500/50 rounded-2xl px-4 py-3.5 transition-all duration-300 shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]'>
                <input
                    type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
                    placeholder={placeholder}
                    className='w-full bg-transparent text-zinc-100 text-sm font-mono placeholder:text-zinc-600 outline-none border-none focus:ring-0'
                    value={value}
                    onChange={(e) => onChange(e)}
                    onBlur={onBlur}
                />

                {type === "password" && (
                    <button
                        type="button"
                        onClick={toggleShowPassword}
                        className="text-zinc-400 hover:text-cyan-400 focus:outline-none transition-colors ml-2 cursor-pointer flex-shrink-0"
                    >
                        {showPassword ? (
                            <FaRegEye size={18} className="text-cyan-400" />
                        ) : (
                            <FaRegEyeSlash size={18} />
                        )}
                    </button>
                )}
            </div>
        </div>
    )
}

export default Input;