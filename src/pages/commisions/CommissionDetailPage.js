"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
    Calendar,
    User,
    CreditCard,
    Tag,
    FileText,
    Users,
    CheckCircle,
    AlertCircle,
    ArrowLeft,
    Zap,
} from "lucide-react"

import api from "../../api/api"

const mockData = {
    title: "반응형 쇼핑몰 웹사이트 프론트엔드 개발 의뢰",
    content: `안녕하세요, 현재 운영 중인 의류 쇼핑몰의 리뉴얼 프로젝트를 함께하실 프리랜서 개발자분을 모집합니다.

[주요 업무]
- Figma 디자인을 바탕으로 React 기반 웹사이트 퍼블리싱 및 개발
- PC/Mobile 반응형 웹 구현
- REST API 연동 (로그인, 상품 목록, 장바구니, 결제 등)

[필수 기술]
- React.js, TypeScript
- Tailwind CSS (또는 Styled Components)
- Git 협업 경험

[우대 사항]
- 쇼핑몰 개발 경험이 있으신 분
- 퍼포먼스 최적화 경험이 있으신 분

[일정]
- 착수일: 2025년 12월 20일
- 마감일: 2026년 2월 28일

관심 있으신 분들의 많은 지원 바랍니다.`,
    paymentType: "MONTHLY",
    unitAmount: 25000,
    startedAt: "2025-12-20",
    endedAt: "2026-02-28",
    recruitmentStatus: "OPEN",
    writerName: "hong",
    tagCode: [],
    plannedHires: 50,
    selectedCount: 12,
    eligibleApplicants: 10,
    appliedCount: 3,
}

const CommissionDetail = () => {
    const { code } = useParams()
    const navigate = useNavigate()

    const [data, setData] = useState(mockData)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isAuthor, setIsAuthor] = useState(false)
    const [role, setRole] = useState("NONE")

    useEffect(() => {
        if (!code) {
            setError("잘못된 접근입니다 (의뢰 코드가 없습니다).")
            setLoading(false)
            return
        }
        fetchIsAuthor()
        fetchRole()
        fetchCommission()
    }, [code])

    const fetchRole = () => {
        try {
            const accessToken = localStorage.getItem("accessToken")

            if (!accessToken) {
                console.warn("accessToken이 세션 스토리지에 없습니다.")
                return null
            }

            const payload = accessToken.split(".")[1]
            const decodedPayload = JSON.parse(atob(payload))

            const role = decodedPayload.role

            console.log(role)

            setRole(role)
        } catch (error) {
            console.error("Role 추출 실패:", error)
            return null
        }
    }

    const fetchIsAuthor = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await api.get(`/commissions/exist/${code}`)

            if (response.status === 200) {
                setIsAuthor(true)
            }
        } catch (err) {
            console.error("데이터 로딩 실패:", err)
            setIsAuthor(false)
        } finally {
            console.log("작성자 여부 확인 성공")
            console.log(isAuthor)
        }
    }

    const fetchCommission = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await api.get(`/commissions/${code}`)

            const result = response.data.data

            console.log(result)

            setData(result)

            console.log(data)
        } catch (err) {
            console.error("데이터 로딩 실패:", err)
            setError("의뢰 정보를 불러오는 데 실패했습니다.")
        } finally {
            setLoading(false)
            console.log(loading)
        }
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("ko-KR", {
            style: "currency",
            currency: "KRW",
        }).format(amount)
    }

    const getPaymentLabel = (type) => {
        const map = {
            HOURLY: "시급",
            FIXED: "고정급",
            FLAT: "건당 지급",
        }
        return map[type] || type
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case "OPEN":
            case "RECRUITING":
                return (
                    <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold flex items-center gap-1.5">
            <CheckCircle size={14} /> 모집중
          </span>
                )
            case "CLOSED":
            case "COMPLETED":
                return (
                    <span className="px-3 py-1.5 bg-slate-200 text-slate-600 rounded-full text-sm font-semibold flex items-center gap-1.5">
            <AlertCircle size={14} /> 마감됨
          </span>
                )
            default:
                return (
                    <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">{status}</span>
                )
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-200 animate-pulse mb-4"></div>
                    <div className="text-lg font-medium text-slate-600">데이터를 불러오는 중입니다...</div>
                </div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 gap-6 px-4">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <div className="text-2xl font-bold text-slate-900 mb-2">{error || "데이터가 없습니다."}</div>
                    <p className="text-slate-600">요청한 의뢰를 찾을 수 없습니다. 다시 시도해주세요.</p>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium flex items-center gap-2"
                >
                    <ArrowLeft size={18} />
                    뒤로 가기
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
         
                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
                    {/* Header Section with gradient accent */}
                    <div className="relative p-8 md:p-10 border-b border-slate-100 bg-gradient-to-r from-slate-900 to-slate-800 text-white overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>

                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                                <div className="flex items-center gap-3">
                                    {getStatusBadge(data.recruitmentStatus)}
                                    <span className="text-slate-400 text-xs font-mono">{code}</span>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                                    <div className="flex items-center gap-2">
                                        <User size={16} />
                                        <span className="font-medium text-white">{data.writerName}</span>
                                    </div>
                                    <div className="h-4 w-px bg-slate-600"></div>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} />
                                        <span className="text-sm">
                      {data.startedAt} ~ {data.endedAt}
                    </span>
                                    </div>
                                </div>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-2">{data.title}</h1>

                            {/* Tags */}
                            {data.tagCode && data.tagCode.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {data.tagCode.map((tag, idx) => (
                                        <span
                                            key={idx}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-100 border border-emerald-400/30"
                                        >
                      <Tag size={12} className="mr-1.5" />
                                            {tag}
                    </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats Grid - Enhanced design */}
                    <div className="bg-white border-b border-slate-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-8 md:p-10">
                            {/* Payment Info */}
                            <div className="group p-6 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="p-3 bg-white rounded-lg text-blue-600 shadow-sm border border-blue-100">
                                        <CreditCard size={24} />
                                    </div>
                                    <Zap size={16} className="text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider mb-2">지급 방식</p>
                                <div className="flex flex-col gap-1">
                                    <span className="text-blue-700 font-bold text-lg">{getPaymentLabel(data.paymentType)}</span>
                                    <span className="text-2xl font-bold text-slate-900">{formatCurrency(data.unitAmount)}</span>
                                </div>
                            </div>

                            {/* Recruitment Progress */}
                            <div className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 hover:border-purple-300 hover:shadow-md transition-all">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="p-3 bg-white rounded-lg text-purple-600 shadow-sm border border-purple-100">
                                        <Users size={24} />
                                    </div>
                                </div>
                                <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider mb-3">총 모집 인원</p>
                                <div className="text-3xl font-bold text-slate-900">
                                    {data.plannedHires}
                                    <span className="text-lg text-slate-500">명</span>
                                </div>
                            </div>

                            {/* Applicant Stats */}
                            <div className="p-6 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 border border-orange-100 hover:border-orange-300 hover:shadow-md transition-all">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="p-3 bg-white rounded-lg text-orange-600 shadow-sm border border-orange-100">
                                        <FileText size={24} />
                                    </div>
                                </div>
                                <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider mb-3">지원 현황</p>
                                <div className="flex items-center gap-4">
                                    <div>
                                        <span className="block text-2xl font-bold text-slate-900">{data.appliedCount}</span>
                                        <span className="text-xs text-slate-600">지원</span>
                                    </div>
                                    <div className="h-8 w-px bg-slate-200"></div>
                                    <div>
                                        <span className="block text-2xl font-bold text-emerald-600">{data.eligibleApplicants}</span>
                                        <span className="text-xs text-slate-600">적격</span>
                                    </div>
                                </div>
                            </div>

                            {/* Selection Stats */}
                            <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 hover:border-emerald-300 hover:shadow-md transition-all">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="p-3 bg-white rounded-lg text-emerald-600 shadow-sm border border-emerald-100">
                                        <CheckCircle size={24} />
                                    </div>
                                </div>
                                <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider mb-3">선발 완료</p>
                                <div className="text-3xl font-bold text-slate-900">
                                    {data.selectedCount}
                                    <span className="text-lg text-slate-500">명</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="p-8 md:p-10 min-h-[400px] bg-white">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3 pb-4 border-b border-slate-200">
                            <FileText size={24} className="text-blue-600" />
                            상세 의뢰 내용
                        </h2>

                        <div className="prose prose-slate max-w-none text-slate-700 leading-8 whitespace-pre-wrap text-base">
                            {data.content}
                        </div>
                    </div>

                    {/* Footer Action Buttons - sticky with gradient background */}
                    <div className="p-6 md:p-8 bg-gradient-to-r from-slate-900 to-slate-800 border-t-2 border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4 sticky bottom-0">
                        {isAuthor && (
                            <button
                                onClick={() => navigate(`/commissions/${code}/edit`)}
                                className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                            >
                                <Zap size={18} />
                                수정하기
                            </button>
                        )}
                        {(role === "FREELANCER" || role === "BOTH") && (
                            <button
                                onClick={() => navigate(`/commissions/${code}/apply`)}
                                className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={18} />
                                지원하기
                            </button>
                        )}
                        {(role === "NONE" || role === "CLIENT") && (
                            <button className="w-full sm:w-auto px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors cursor-not-allowed opacity-70">
                                Freelancer 등록 필요
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CommissionDetail
