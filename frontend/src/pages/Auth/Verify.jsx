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
                    { token }, // ✅ Sirf body mein
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
        <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4">

            {/* Background Blur Effects */}
            <div className="absolute top-0 -left-24 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 -right-24 w-80 h-80 bg-sky-300/20 rounded-full blur-3xl" />

            {/* Main Card */}
            <div className="relative w-full max-w-md bg-white/90 backdrop-blur-xl border border-blue-100 shadow-[0_10px_40px_rgba(37,99,235,0.12)] rounded-3xl p-8 sm:p-10 text-center">

                {/* Verifying State */}
                {status === "verifying" && (
                    <div className="space-y-5">

                        <div className="mx-auto flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-100 shadow-inner">
                            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                        </div>

                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">
                                Verifying Email
                            </h2>

                            <p className="mt-3 text-sm sm:text-base text-gray-500 leading-relaxed">
                                Please wait while we securely verify your email address.
                            </p>
                        </div>

                        <div className="w-full bg-blue-100 rounded-full h-2 overflow-hidden">
                            <div className="h-full w-1/2 bg-gradient-to-r from-blue-500 to-sky-400 animate-pulse rounded-full"></div>
                        </div>

                    </div>
                )}

                {/* Success State */}
                {status === "success" && (
                    <div className="space-y-5">

                        <div className="mx-auto flex items-center justify-center w-20 h-20 rounded-2xl bg-green-100 shadow-inner">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>

                        <div>
                            <h2 className="text-3xl font-bold text-green-600">
                                Email Verified
                            </h2>

                            <p className="mt-3 text-sm sm:text-base text-gray-500 leading-relaxed">
                                {message}
                            </p>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
                            <p className="text-sm text-blue-700 font-medium">
                                Redirecting you to the login page...
                            </p>
                        </div>

                    </div>
                )}

                {/* Error State */}
                {status === "error" && (
                    <div className="space-y-5">

                        <div className="mx-auto flex items-center justify-center w-20 h-20 rounded-2xl bg-red-100 shadow-inner">
                            <XCircle className="w-10 h-10 text-red-500" />
                        </div>

                        <div>
                            <h2 className="text-3xl font-bold text-red-500">
                                Verification Failed
                            </h2>

                            <p className="mt-3 text-sm sm:text-base text-gray-500 leading-relaxed">
                                {message}
                            </p>
                        </div>

                        <button
                            onClick={() => navigate('/signup')}
                            className="w-full bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-semibold py-3 rounded-2xl shadow-lg shadow-blue-200 transition-all duration-300 cursor-pointer"
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