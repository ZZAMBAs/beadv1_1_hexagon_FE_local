import React, { useState } from 'react';
import EmailVerification from '../components/EmailVerification';
import api from '../api/api'; // Import the axios instance


const ClientRegisterPage = () => {
  const [isVerified, setIsVerified] = useState(false)
  const [verifiedEmail, setVerifiedEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const role = "CLIENT"
  const REGISTER_PATH = `/members/state`

  const handleVerificationSuccess = (email) => {
    setIsVerified(true)
    setVerifiedEmail(email)
    setMessage("")
  }

  const handleRegister = async () => {
    if (!isVerified) {
      setMessage("이메일 인증을 먼저 완료해야 합니다.")
      return
    }
    setLoading(true)
    setMessage("")
    try {
      const response = await api.patch(REGISTER_PATH, { role })
      if (response.status === 200) {
        setMessage(`${role} 등록이 성공적으로 완료되었습니다!`)

      }
    } catch (error) {
      setMessage(error.response?.data?.message || "등록 중 오류가 발생했습니다.")
      console.error("Error during registration:", error)
      setIsVerified(false)
    } finally {
      setLoading(false)
    }
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">클라이언트 회원가입</h1>
            <p className="text-gray-600">이메일 인증을 통해 회원가입을 진행하세요</p>
          </div>

          {!isVerified ? (
              <EmailVerification role={role} onVerificationSuccess={handleVerificationSuccess} />
          ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-50 rounded-full mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">이메일 인증 완료</h2>
                  <p className="text-sm text-gray-600">회원가입을 완료하세요</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-2">
                      인증된 이메일
                    </label>
                    <div className="relative">
                      <input
                          id="email-address"
                          name="email"
                          type="email"
                          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                          value={verifiedEmail}
                          disabled
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path
                              fillRule="evenodd"
                              d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <button
                      onClick={handleRegister}
                      disabled={loading}
                      className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                      />
                      <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    등록 중...
                  </span>
                    ) : (
                        `${role} 등록하기`
                    )}
                  </button>
                </div>

                {message && (
                    <div
                        className={`mt-6 p-4 rounded-lg ${
                            message.includes("성공") || message.includes("완료")
                                ? "bg-green-50 border border-green-200"
                                : "bg-red-50 border border-red-200"
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        {message.includes("성공") || message.includes("완료") ? (
                            <svg
                                className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                              <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                              />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                  clipRule="evenodd"
                              />
                            </svg>
                        )}
                        <p
                            className={`text-sm ${
                                message.includes("성공") || message.includes("완료") ? "text-green-800" : "text-red-800"
                            }`}
                        >
                          {message}
                        </p>
                      </div>
                    </div>
                )}
              </div>
          )}
        </div>
      </div>
  )
}

export default ClientRegisterPage
