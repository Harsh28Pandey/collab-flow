import axiosInstance from '../../utils/axiosInstance.js'
import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

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
        <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-[#fafaf9] px-4">

            {/* Subtle Dot Mesh Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_70%,transparent_100%)] opacity-50 pointer-events-none" />

            {/* Ethereal Ambient Warm Glows */}
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-yellow-200/40 to-orange-100/20 blur-[130px] rounded-full pointer-events-none mix-blend-multiply" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-tl from-orange-200/30 to-yellow-100/20 blur-[130px] rounded-full pointer-events-none mix-blend-multiply" />

            {/* Main Card */}
            <div className="relative w-full max-w-md bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-[2.5rem] p-8 sm:p-10 text-center transition-all duration-500">

                {/* Verifying State */}
                {status === "verifying" && (
                    <div className="space-y-5">

                        <div className="mx-auto flex items-center justify-center w-20 h-20 rounded-2xl bg-orange-50 border border-orange-100 shadow-inner">
                            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                        </div>

                        <div>
                            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                                Verifying Email
                            </h2>

                            <p className="mt-2 text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
                                Please wait while we securely verify your email address.
                            </p>
                        </div>

                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
                            <div className="h-full w-1/2 bg-gradient-to-r from-orange-500 to-yellow-400 animate-pulse rounded-full"></div>
                        </div>

                    </div>
                )}

                {/* Success State */}
                {status === "success" && (
                    <div className="space-y-5">

                        <div className="mx-auto flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-50 border border-emerald-100 shadow-inner">
                            <CheckCircle className="w-10 h-10 text-emerald-600" />
                        </div>

                        <div>
                            <h2 className="text-3xl font-extrabold text-emerald-600 tracking-tight">
                                Email Verified
                            </h2>

                            <p className="mt-2 text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
                                {message}
                            </p>
                        </div>

                        <div className="bg-emerald-50/80 border border-emerald-100 rounded-2xl px-4 py-3">
                            <p className="text-sm text-emerald-700 font-bold">
                                Redirecting you to the login page...
                            </p>
                        </div>

                    </div>
                )}

                {/* Error State */}
                {status === "error" && (
                    <div className="space-y-5">

                        <div className="mx-auto flex items-center justify-center w-20 h-20 rounded-2xl bg-red-50 border border-red-100 shadow-inner">
                            <XCircle className="w-10 h-10 text-red-500" />
                        </div>

                        <div>
                            <h2 className="text-3xl font-extrabold text-red-500 tracking-tight">
                                Verification Failed
                            </h2>

                            <p className="mt-2 text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
                                {message}
                            </p>
                        </div>

                        <button
                            onClick={() => navigate('/signup')}
                            className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:opacity-95 text-white font-bold py-3.5 rounded-2xl shadow-[0_10px_30px_rgba(249,115,22,0.25)] hover:shadow-[0_14px_40px_rgba(249,115,22,0.35)] transition-all duration-300 cursor-pointer"
                        >
                            Register Again
                        </button>

                    </div>
                )}

            </div>

        </div>
    )
}

export default Verify