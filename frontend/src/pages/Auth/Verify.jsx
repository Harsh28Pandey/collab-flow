import axiosInstance from '../../utils/axiosInstance.js'
import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { LuTerminal } from "react-icons/lu";

const Verify = () => {

    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [status, setStatus] = useState("verifying")
    const [message, setMessage] = useState("")

    useEffect(() => {

        const verifyEmail = async () => {

            const token = searchParams.get("token")

            if (!token) {
                setStatus("error")
                setMessage("Verification link is invalid")
                return
            }

            try {
                const res = await axiosInstance.post(
                    `/api/auth/verify`,
                    { token },
                )

                if (res.data.success) {
                    setStatus("success")
                    setMessage("Email verified successfully!")
                    setTimeout(() => navigate('/login', { replace: true }), 2000)
                } else {
                    setStatus("error")
                    setMessage("Invalid or expired verification link")
                }

            } catch (error) {
                console.error(error)
                setStatus("error")
                setMessage(
                    error.response?.data?.message ||
                    "Verification failed. Please try again."
                )
            }
        }

        verifyEmail()

    }, [])

    return (
        <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-zinc-950 text-zinc-100 px-4 font-sans">

            {/* Premium Developer Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-80 pointer-events-none" />

            {/* Architectural Ambient Orbs (Deep Dark Mode Neon) */}
            <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] bg-gradient-to-br from-blue-600/20 via-indigo-600/10 to-transparent blur-[140px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[10%] right-[15%] w-[500px] h-[500px] bg-gradient-to-tl from-purple-600/20 via-violet-600/10 to-transparent blur-[140px] rounded-full pointer-events-none" />

            {/* Main Card */}
            <div className="relative w-full max-w-md bg-zinc-900/60 backdrop-blur-3xl border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9)] rounded-[2.5rem] p-8 sm:p-10 text-center transition-all duration-500">

                {/* Verifying State */}
                {status === "verifying" && (
                    <div className="space-y-5">

                        <div className="mx-auto flex items-center justify-center w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 shadow-inner">
                            <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
                        </div>

                        <div>
                            <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                                <LuTerminal size={12} className="text-cyan-400" />
                                <span className="text-[10px] font-mono tracking-widest text-cyan-300 uppercase">
                                    Edge Processing
                                </span>
                            </div>

                            <h2 className="text-3xl font-extrabold text-white tracking-tight">
                                Verifying Email
                            </h2>

                            <p className="mt-2 text-sm sm:text-base text-zinc-400 font-medium leading-relaxed font-mono">
                                Please wait while we securely verify your email address.
                            </p>
                        </div>

                        <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-white/5">
                            <div className="h-full w-1/2 bg-gradient-to-r from-cyan-400 to-purple-500 animate-pulse rounded-full"></div>
                        </div>

                    </div>
                )}

                {/* Success State */}
                {status === "success" && (
                    <div className="space-y-5">

                        <div className="mx-auto flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-inner">
                            <CheckCircle className="w-10 h-10 text-emerald-400" />
                        </div>

                        <div>
                            <h2 className="text-3xl font-extrabold text-emerald-400 tracking-tight">
                                Email Verified
                            </h2>

                            <p className="mt-2 text-sm sm:text-base text-zinc-400 font-medium leading-relaxed font-mono">
                                {message}
                            </p>
                        </div>

                        <div className="bg-zinc-900/80 border border-emerald-500/20 rounded-2xl px-4 py-3">
                            <p className="text-sm text-emerald-300 font-mono font-semibold">
                                Redirecting you to the login page...
                            </p>
                        </div>

                    </div>
                )}

                {/* Error State */}
                {status === "error" && (
                    <div className="space-y-5">

                        <div className="mx-auto flex items-center justify-center w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 shadow-inner">
                            <XCircle className="w-10 h-10 text-red-400" />
                        </div>

                        <div>
                            <h2 className="text-3xl font-extrabold text-red-400 tracking-tight">
                                Verification Failed
                            </h2>

                            <p className="mt-2 text-sm sm:text-base text-zinc-400 font-medium leading-relaxed font-mono">
                                {message}
                            </p>
                        </div>

                        <div className="relative group cursor-pointer w-full mt-2">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-40 group-hover:opacity-100 transition duration-500 group-hover:duration-200"></div>
                            <button
                                onClick={() => navigate('/signup')}
                                className="relative w-full bg-zinc-950 hover:bg-zinc-900 text-white font-bold py-3.5 rounded-2xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)] active:scale-[0.98] transition-all duration-300 cursor-pointer font-mono text-sm"
                            >
                                Register Again
                            </button>
                        </div>

                    </div>
                )}

            </div>

        </div>
    )
}

export default Verify