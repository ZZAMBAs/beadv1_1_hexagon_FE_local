import React, { useState } from "react";
import MyResumePage from "../resume/MyResumePage";
import TagManagementPage from "../tag/TagManagementPage";
import MyPromotionPage from "../selfPromotion/MySelfPromotionPage";
import RatingComponent from "../rating/RatingComponent";
import { User, FileText, Hash, Megaphone } from "lucide-react";

const MyPage4 = () => {
  const [activeTab, setActiveTab] = useState("resume");

  // 현재 로그인한 사용자 정보 (Rating 연동용)
  // 실제로는 AuthContext나 localStorage에서 가져온 본인의 memberCode가 들어갑니다.
  const myMemberCode = localStorage.getItem("memberCode");

  const tabs = [
    {
      id: "resume",
      label: "이력서/경력 관리",
      icon: <FileText className="w-4 h-4" />,
    },
    { id: "tags", label: "기술 스택", icon: <Hash className="w-4 h-4" /> },
    {
      id: "promotion",
      label: "셀프 프로모션",
      icon: <Megaphone className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* 상단 헤더 섹션: 내 신뢰도 요약 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex flex-col md:flex-row justify-between items-center border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <User className="text-indigo-600" />
              프리랜서 관리 센터
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              내 이력서와 포트폴리오를 관리하고 수주 확률을 높이세요.
            </p>
          </div>

          {/* 평점 컴포넌트 연동 (조회용) */}
          <div className="mt-4 md:mt-0">
            <RatingComponent memberCode={myMemberCode} />
          </div>
        </div>

        {/* 탭 메뉴 */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                  : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* 컨텐츠 영역: 각 모듈 연결 */}
        <div className="transition-all duration-300">
          {activeTab === "resume" && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <MyResumePage />
            </div>
          )}

          {activeTab === "tags" && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <TagManagementPage />
            </div>
          )}

          {activeTab === "promotion" && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <MyPromotionPage />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPage4;
