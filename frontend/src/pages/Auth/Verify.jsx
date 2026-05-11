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
        <div className="relative w-full min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-green-400/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 -left-24 w-96 h-96 bg-green-500/20 rounded-full blur-3xl" />

            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center w-full max-w-md space-y-4">

                    {status === "verifying" && (
                        <>
                            <div className="mx-auto w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                                <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Verifying your email...
                            </h2>
                            <p className="text-sm text-gray-500">
                                Please wait, do not close this page.
                            </p>
                        </>
                    )}

                    {status === "success" && (
                        <>
                            <div className="mx-auto w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle className="w-7 h-7 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-green-600">
                                {message}
                            </h2>
                            <p className="text-sm text-gray-500">
                                Redirecting to login page...
                            </p>
                        </>
                    )}

                    {status === "error" && (
                        <>
                            <div className="mx-auto w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                                <XCircle className="w-7 h-7 text-red-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-red-500">
                                Verification Failed
                            </h2>
                            <p className="text-sm text-gray-500 mb-4">
                                {message}
                            </p>
                            <button
                                onClick={() => navigate('/signup')}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2 rounded-xl transition-all cursor-pointer"
                            >
                                Register Again
                            </button>
                        </>
                    )}

                </div>
            </div>
        </div>
    )
}

export default Verify