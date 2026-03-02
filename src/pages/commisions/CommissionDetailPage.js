import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  Bookmark,
  Calendar,
  CheckCircle,
  CreditCard,
  FileText,
  Share2,
  Tag,
  User,
  Users,
} from "lucide-react";
import api from "../../api/api";
import { useAuth } from "../../components/AuthContext";

const normalizePaymentType = (value) => {
  if (!value) {
    return "ONE_TIME";
  }

  const upper = String(value).toUpperCase();
  if (upper === "MONTHLY" || upper === "HOURLY") {
    return "MONTHLY";
  }

  return "ONE_TIME";
};

const toIsoString = (value) => {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
};

const toNumber = (value) => {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  return undefined;
};

const normalizeCommission = (raw, fallbackCode) => {
  if (!raw) {
    return null;
  }

  return {
    code: raw.code || raw.commissionCode || fallbackCode || "",
    title: raw.title || raw.name || "",
    content: raw.content || raw.body || "",
    memberCode: raw.memberCode || raw.clientCode || raw.writerCode || "",
    memberNickname: raw.memberNickname || raw.writerName || raw.clientName || "",
    startedAt: raw.startedAt || "",
    endedAt: raw.endedAt || "",
    paymentType: raw.paymentType || "",
    payAmount: toNumber(raw.payAmount ?? raw.unitAmount ?? raw.amount),
    tags: Array.isArray(raw.tags) ? raw.tags : Array.isArray(raw.tagCode) ? raw.tagCode : [],
    isOpen: typeof raw.isOpen === "boolean" ? raw.isOpen : raw.recruitmentStatus === "OPEN",
    recruitmentStatus: raw.recruitmentStatus || (raw.isOpen ? "OPEN" : "CLOSED"),
    plannedHires: raw.plannedHires,
    selectedCount: raw.selectedCount,
    eligibleApplicants: raw.eligibleApplicants,
    appliedCount: raw.appliedCount,
  };
};

const buildContractDraft = (commission) => {
  const paymentType = normalizePaymentType(commission.paymentType);
  const paymentText = paymentType === "MONTHLY" ? "월 단위 결제" : "1회 결제";
  const amountText =
    typeof commission.payAmount === "number"
      ? `${commission.payAmount.toLocaleString()}원`
      : "미정";

  return {
    name: `${commission.title || "의뢰"} 계약`,
    body: [
      "[자동 생성 초안]",
      "",
      `의뢰명: ${commission.title || "-"}`,
      `의뢰 코드: ${commission.code || "-"}`,
      `프로젝트 기간: ${commission.startedAt || "-"} ~ ${commission.endedAt || "-"}`,
      `결제 방식: ${paymentText}`,
      `금액: ${amountText}`,
      "",
      "원본 의뢰 내용:",
      commission.content || "-",
    ].join("\n"),
  };
};

const formatCurrency = (amount) => {
  if (typeof amount !== "number") {
    return "-";
  }

  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(amount);
};

const getPaymentLabel = (type) => {
  const normalized = normalizePaymentType(type);
  if (normalized === "MONTHLY") {
    return "월 단위";
  }
  return "1회 결제";
};

const getStatusBadge = (commission) => {
  const isOpen = typeof commission.isOpen === "boolean"
    ? commission.isOpen
    : commission.recruitmentStatus === "OPEN";

  if (isOpen) {
    return (
      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold flex items-center gap-1">
        <CheckCircle size={14} /> 모집중
      </span>
    );
  }

  return (
    <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-sm font-bold flex items-center gap-1">
      <AlertCircle size={14} /> 마감
    </span>
  );
};

const CommissionDetailPage = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { authState } = useAuth();
  const [commission, setCommission] = useState(
    normalizeCommission(location.state?.commission, code)
  );
  const [loading, setLoading] = useState(!location.state?.commission);
  const [error, setError] = useState("");
  const [contractSubmitting, setContractSubmitting] = useState(false);

  const hasFreelancerRole =
    authState.role === "FREELANCER" || authState.role === "BOTH";

  const contractDraft = useMemo(() => {
    if (!commission) {
      return null;
    }
    return buildContractDraft(commission);
  }, [commission]);

  useEffect(() => {
    if (!code) {
      setError("의뢰 코드가 없습니다.");
      setLoading(false);
      return;
    }

    const fetchCommission = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/commissions/${code}`);
        const result = response?.data?.data ?? response?.data;
        setCommission((current) => normalizeCommission(result, code) || current);
        setError("");
      } catch (requestError) {
        if (!location.state?.commission) {
          const message =
            requestError?.response?.data?.message ||
            requestError?.message ||
            "의뢰 정보를 불러오지 못했습니다.";
          setError(message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCommission();
  }, [code, location.state?.commission]);

  const handleCreateContract = async () => {
    if (!commission || !authState.memberCode || !contractDraft) {
      return;
    }

    const payload = {
      clientCode: commission.memberCode || undefined,
      freelancerCode: authState.memberCode,
      commissionCode: commission.code || undefined,
      startedAt: toIsoString(commission.startedAt),
      endedAt: toIsoString(commission.endedAt),
      paymentType: normalizePaymentType(commission.paymentType),
      unitAmount: commission.payAmount,
      name: contractDraft.name,
      body: contractDraft.body,
    };

    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined || payload[key] === "") {
        delete payload[key];
      }
    });

    const summary = [
      "이 의뢰 기준으로 계약을 생성합니다.",
      "",
      `계약명: ${contractDraft.name}`,
      `클라이언트 코드: ${payload.clientCode || "-"}`,
      `프리랜서 코드: ${payload.freelancerCode || "-"}`,
      `의뢰 코드: ${payload.commissionCode || "-"}`,
    ].join("\n");

    if (!window.confirm(summary)) {
      return;
    }

    try {
      setContractSubmitting(true);
      const response = await api.post("/contracts", payload);
      const createdCode = response?.data?.data?.code;

      if (createdCode) {
        navigate(`/mypage/contracts/${createdCode}`);
        return;
      }

      navigate("/mypage/contracts");
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message ||
        requestError?.message ||
        "계약 생성에 실패했습니다.";
      window.alert(message);
    } finally {
      setContractSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl text-gray-500 font-medium">의뢰 정보를 불러오는 중입니다...</div>
      </div>
    );
  }

  if (error || !commission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-4">
        <div className="text-xl text-red-500 font-bold">{error || "의뢰 정보가 없습니다."}</div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
        >
          뒤로 가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-6 md:p-8 border-b border-gray-100 bg-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div className="flex items-center gap-3">
              {getStatusBadge(commission)}
              <span className="text-gray-400 text-xs font-mono">CODE: {commission.code}</span>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <User size={16} />
                <span className="font-medium text-gray-700">
                  {commission.memberNickname || "작성자 정보 없음"}
                </span>
              </div>
              <div className="h-4 w-px bg-gray-300" />
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>
                  {commission.startedAt || "-"} ~ {commission.endedAt || "-"}
                </span>
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-4">
            {commission.title || "제목 없음"}
          </h1>

          {commission.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {commission.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                >
                  <Tag size={12} className="mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-50 border-b border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            <div className="p-6 flex items-center gap-4">
              <div className="p-3 bg-white rounded-full text-blue-600 shadow-sm border border-gray-100">
                <CreditCard size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">지급 방식</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-blue-600 font-bold">
                    {getPaymentLabel(commission.paymentType)}
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(commission.payAmount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 flex flex-col justify-center">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">모집 인원</p>
              <div className="flex items-center gap-2">
                <Users size={20} className="text-gray-400" />
                <span className="text-2xl font-bold text-gray-900">
                  {commission.plannedHires ?? "-"}명
                </span>
              </div>
            </div>

            <div className="p-6 flex flex-col justify-center">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">지원 현황</p>
              <div className="flex items-center gap-4">
                <div>
                  <span className="block text-xl font-bold text-gray-900">
                    {commission.appliedCount ?? "-"}
                  </span>
                  <span className="text-xs text-gray-500">지원함</span>
                </div>
                <div className="h-8 w-px bg-gray-200" />
                <div>
                  <span className="block text-xl font-bold text-blue-600">
                    {commission.eligibleApplicants ?? "-"}
                  </span>
                  <span className="text-xs text-gray-500">적격</span>
                </div>
              </div>
            </div>

            <div className="p-6 flex flex-col justify-center bg-blue-50/50">
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">선발 완료</p>
              <div className="flex items-center gap-2">
                <CheckCircle size={20} className="text-green-500" />
                <span className="text-2xl font-bold text-gray-900">
                  {commission.selectedCount ?? "-"}명
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-10 min-h-[400px]">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b pb-2">
            <FileText size={20} className="text-gray-500" />
            의뢰 내용
          </h3>

          <div className="prose prose-slate max-w-none text-gray-700 leading-8 whitespace-pre-wrap">
            {commission.content || "의뢰 내용이 없습니다."}
          </div>
        </div>

        {hasFreelancerRole && authState.memberCode && (
          <div className="px-8 pb-2">
            <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
              <div className="font-semibold mb-2">계약 생성 기본값</div>
              <div>클라이언트 코드: {commission.memberCode || "-"}</div>
              <div>프리랜서 코드: {authState.memberCode}</div>
              <div>계약명 초안: {contractDraft?.name || "-"}</div>
            </div>
          </div>
        )}

        <div className="p-6 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 sticky bottom-0">
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition shadow-sm">
              <Share2 size={18} /> 공유
            </button>
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition shadow-sm">
              <Bookmark size={18} /> 스크랩
            </button>
          </div>

          {hasFreelancerRole && authState.memberCode ? (
            <button
              type="button"
              onClick={handleCreateContract}
              disabled={contractSubmitting}
              className={`w-full sm:w-auto px-10 py-3 text-white text-lg font-bold rounded-lg transition shadow-md flex items-center justify-center gap-2 ${
                contractSubmitting
                  ? "bg-indigo-300 cursor-wait"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {contractSubmitting ? "계약 생성 중..." : "계약하기"}
            </button>
          ) : (
            <div className="w-full sm:w-auto px-6 py-3 text-sm text-gray-500 bg-white border border-gray-200 rounded-lg">
              프리랜서 또는 BOTH 역할 사용자만 계약을 생성할 수 있습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommissionDetailPage;
