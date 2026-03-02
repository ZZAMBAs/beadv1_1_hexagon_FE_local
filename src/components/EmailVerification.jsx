
import { useState } from "react"
import api from "../api/api"

const EmailVerification = ({ role, onVerificationSuccess }) => {
  const [email, setEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const SEND_EMAIL_PATH = `/auth/email/${role}`
  const VERIFY_CODE_PATH = `/auth/email/${role}/verify`

  const handleSendVerificationEmail = async () => {
    setLoading(true)
    setMessage("")
    try {
      const response = await api.post(SEND_EMAIL_PATH, { email })

      if (response.status === 200) {
        setIsEmailSent(true)
        setMessage("인증메일이 성공적으로 전송되었습니다.")
      } else {
        setMessage(response.data.message || "인증메일 전송에 실패했습니다.")
      }
    } catch (error) {
      if (error.response?.data?.message) {
        setMessage(error.response.data.message)
      } else {
        setMessage("인증메일 전송 중 오류가 발생했습니다. 다시 시도해주세요.")
      }
      console.error("Error sending verification email:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyEmailCode = async () => {
    setLoading(true)
    setMessage("")
    try {
      const request = `${VERIFY_CODE_PATH}?code=${verificationCode}`
      const response = await api.post(request, {})

      if (response.status === 200) {
        setMessage("이메일 인증이 성공적으로 완료되었습니다.")
        if (onVerificationSuccess) {
          onVerificationSuccess(email)
        }
      } else {
        setMessage(response.data.message || "인증 코드 확인에 실패했습니다.")
      }
    } catch (error) {
      if (error.response?.data?.message) {
        setMessage(error.response.data.message)
      } else {
        setMessage("인증 코드 확인 중 오류가 발생했습니다. 다시 시도해주세요.")
      }
      console.error("Error verifying email code:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-full mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">이메일 인증</h2>
            <p className="mt-2 text-sm text-gray-600">
              {!isEmailSent ? "이메일 주소를 입력하여 인증을 시작하세요" : "이메일로 전송된 인증 코드를 입력하세요"}
            </p>
          </div>

          {!isEmailSent ? (
              <div className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    이메일 주소
                  </label>
                  <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      disabled={loading}
                  />
                </div>
                <button
                    onClick={handleSendVerificationEmail}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading || !email}
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
                  전송 중...
                </span>
                  ) : (
                      "인증메일 전송"
                  )}
                </button>
              </div>
          ) : (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 text-center">
                    <span className="font-medium">{email}</span>으로 인증메일이 전송되었습니다.
                  </p>
                </div>
                <div>
                  <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-2">
                    인증 코드
                  </label>
                  <input
                      type="text"
                      id="verificationCode"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-lg tracking-wider text-center"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="000000"
                      disabled={loading}
                      maxLength={6}
                  />
                </div>
                <button
                    onClick={handleVerifyEmailCode}
                    className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading || !verificationCode}
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
                  인증 중...
                </span>
                  ) : (
                      "코드 확인"
                  )}
                </button>
                <button
                    onClick={() => {
                      setIsEmailSent(false)
                      setVerificationCode("")
                      setMessage("")
                    }}
                    className="w-full py-3 px-4 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                >
                  다른 이메일로 재전송
                </button>
              </div>
          )}

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
                      <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
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
      </div>
  )
}

export default EmailVerification