import React, { useEffect, useState, useCallback } from "react";
import api from "../../api/api";

const TagManagementPage = () => {
  const [allTags, setAllTags] = useState([]); // 시스템 전체 태그
  const [myTagCodes, setMyTagCodes] = useState([]); // 내가 선택한 태그 코드들 (ID 리스트)
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // X-CODE 가져오기
  const getXCodeHeader = () => {
    let token = localStorage.getItem("accessToken");
    if (token && token.startsWith("Bearer "))
      token = token.replace("Bearer ", "");
    return token ? { "X-CODE": token } : {};
  };

  // 초기 데이터 로드 (전체 태그와 내 태그를 동시에 가져옴)
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 병렬 요청으로 속도 개선
      const [allTagsRes, myTagsRes] = await Promise.all([
        api.get("/tags"),
        api.get("/tags/me", { headers: getXCodeHeader() }),
      ]);

      setAllTags(allTagsRes.data.data || []);
      // 내 태그 응답에서 tagCode만 추출하여 배열로 저장
      const myCodes = (myTagsRes.data.data || []).map((t) => t.tagCode);
      setMyTagCodes(myCodes);
    } catch (e) {
      console.error(e);
      alert("태그 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 태그 선택/해제 토글 로직
  const toggleTag = (tagCode) => {
    setMyTagCodes(
      (prev) =>
        prev.includes(tagCode)
          ? prev.filter((code) => code !== tagCode) // 이미 있으면 제거
          : [...prev, tagCode] // 없으면 추가
    );
  };

  // 변경사항 저장 (백엔드 syncMemberTags 호출)
  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      // 백엔드 @PutMapping("/members/me")와 매칭
      // Body에 List<String> 형태로 tagCodes를 전송
      await api.put("/tags/members/me", myTagCodes, {
        headers: getXCodeHeader(),
      });
      alert("기술 스택이 성공적으로 동기화되었습니다!");
    } catch (e) {
      console.error(e);
      alert("저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-500 font-medium">
        기술 스택 데이터를 불러오는 중...
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-2xl rounded-2xl mt-12 border border-gray-100">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
          기술 스택 설정
        </h2>
        <p className="text-gray-500">
          본인의 주력 기술을 선택해 주세요.{" "}
          <span className="text-indigo-600 font-semibold">이력서와 매칭</span>
          되어 더 적합한 일감을 추천받을 수 있습니다.
        </p>
      </div>

      {/* 태그 리스트 영역 */}
      <div className="flex flex-wrap gap-4 mb-10">
        {allTags.length > 0 ? (
          allTags.map((tag) => {
            const isSelected = myTagCodes.includes(tag.tagCode);
            return (
              <button
                key={tag.tagCode}
                onClick={() => toggleTag(tag.tagCode)}
                className={`group flex items-center px-5 py-2.5 rounded-full border-2 transition-all duration-200 font-medium ${
                  isSelected
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105"
                    : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
                }`}
              >
                {isSelected && (
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
                {tag.skill}
              </button>
            );
          })
        ) : (
          <p className="text-gray-400 italic">등록된 전체 태그가 없습니다.</p>
        )}
      </div>

      {/* 하단 액션 버튼 */}
      <div className="flex items-center justify-between border-t pt-8">
        <div className="text-sm text-gray-500">
          현재{" "}
          <span className="text-indigo-600 font-bold">
            {myTagCodes.length}개
          </span>
          의 기술이 선택되었습니다.
        </div>
        <div className="space-x-3">
          <button
            onClick={() => fetchData()} // 다시 불러오기 (취소 역할)
            className="px-6 py-2.5 text-gray-500 font-semibold hover:text-gray-700 transition"
          >
            초기화
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-8 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all ${
              saving
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 active:transform active:scale-95"
            }`}
          >
            {saving ? "저장 중..." : "변경사항 저장"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagManagementPage;
