import React, { useEffect, useState, useCallback } from "react";
import api from "../../api/api";

const MyResumePage = () => {
  const [resume, setResume] = useState({ title: "", body: "", link: "" }); // 초기값을 null로 설정하여 존재 여부 파악
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditingResume, setIsEditingResume] = useState(false);

  // Experience 입력 폼 상태
  const [newExp, setNewExp] = useState({
    title: "",
    organization: "",
    description: "",
    startedAt: "",
    endedAt: "",
  });
  const [isAddingExp, setIsAddingExp] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/resumes/me");

      // API 응답 구조를 콘솔로 꼭 확인해보세요!
      console.log("서버 응답:", res.data);

      // 응답 데이터가 있으면 업데이트 (서버 구조에 따라 res.data 또는 res.data.data)
      const serverData = res.data.data || res.data;

      if (serverData && serverData.resumeCode) {
        setResume(serverData);
        setExperiences(serverData.experiences || []);
      } else {
        // 데이터가 없으면 입력 가능한 빈 상태로 유지
        setResume({ title: "", body: "", link: "" });
      }
    } catch (e) {
      console.log("등록된 이력서가 없거나 불러오기 실패");
      setResume({ title: "", body: "", link: "" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 이력서 저장/수정 함수 수정
  const handleSaveResume = async () => {
    try {
      let response;
      if (resume && resume.resumeCode) {
        // 수정 (PATCH)
        response = await api.patch(`/resumes/${resume.resumeCode}`, {
          title: resume.title,
          body: resume.body,
          link: resume.link,
        });
      } else {
        // 신규 등록 (POST)
        response = await api.post("/resumes", {
          title: resume?.title || "",
          body: resume?.body || "",
          link: resume?.link || "",
        });
      }

      // 서버 응답 구조가 res.data.data 인지 res.data 인지 확인 필요
      const savedData = response.data.data || response.data;

      if (savedData) {
        setResume(savedData); // 이제 resumeCode가 상태에 저장됩니다
        alert("이력서가 저장되었습니다.");
        setIsEditingResume(false);
      }

      fetchData(); // 다시 한 번 확실히 불러오기
    } catch (e) {
      console.error("저장 실패 상세:", e.response?.data || e.message);
      alert(`저장 실패: ${e.response?.data?.message || "권한 또는 서버 오류"}`);
    }
  };

  // 경력 추가
  const handleAddExperience = async () => {
    if (!resume || !resume.resumeCode) {
      alert("이력서를 먼저 등록해주세요.");
      return;
    }
    try {
      const payload = {
        ...newExp,
        startedAt: new Date(newExp.startedAt).toISOString(),
        endedAt: newExp.endedAt ? new Date(newExp.endedAt).toISOString() : null,
      };
      await api.post(`/resumes/${resume.resumeCode}/experiences`, payload);
      alert("경력이 추가되었습니다.");
      setNewExp({
        title: "",
        organization: "",
        description: "",
        startedAt: "",
        endedAt: "",
      });
      setIsAddingExp(false);
      fetchData();
    } catch (e) {
      alert("경력 추가 실패");
    }
  };

  if (loading) return <div className="p-6 text-center">로딩 중...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* 1. 이력서 본문 섹션 */}
      <section className="bg-white shadow-lg rounded-2xl p-8 border-l-8 border-indigo-600">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">내 이력서 정보</h2>
          {/* 데이터가 있을 때만 '수정/취소' 버튼 노출 */}
          {resume && resume.resumeCode && (
            <button
              onClick={() => setIsEditingResume(!isEditingResume)}
              className="text-indigo-600 font-semibold underline"
            >
              {isEditingResume ? "취소" : "이력서 수정"}
            </button>
          )}
        </div>

        {/* 폼 노출 조건: 이력서가 아예 없거나(null), 수정 모드일 때 */}
        {!resume || !resume.resumeCode || isEditingResume ? (
          <div className="space-y-4">
            {!resume?.resumeCode && (
              <p className="text-sm text-gray-500">
                * 이력서를 먼저 등록해 주세요.
              </p>
            )}
            <input
              className="w-full p-3 border rounded-xl"
              placeholder="이력서 제목"
              value={resume?.title || ""}
              onChange={(e) => setResume({ ...resume, title: e.target.value })}
            />
            <textarea
              className="w-full p-3 border rounded-xl h-32"
              placeholder="자기소개 내용 (body)"
              value={resume?.body || ""}
              onChange={(e) => setResume({ ...resume, body: e.target.value })}
            />
            <input
              className="w-full p-3 border rounded-xl"
              placeholder="외부 링크 (GitHub 등)"
              value={resume?.link || ""}
              onChange={(e) => setResume({ ...resume, link: e.target.value })}
            />
            <button
              onClick={handleSaveResume}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold"
            >
              {resume?.resumeCode ? "이력서 수정 완료" : "이력서 첫 등록하기"}
            </button>
          </div>
        ) : (
          /* 상세 보기 화면: 이력서가 이미 존재하고 수정 모드가 아닐 때 */
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-gray-800">{resume.title}</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{resume.body}</p>
            {resume.link && (
              <a
                href={resume.link}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-500 text-sm hover:underline"
              >
                {resume.link}
              </a>
            )}
          </div>
        )}
      </section>

      {/* 2. 경력 섹션: 이력서가 서버에 등록(resumeCode 존재)된 경우에만 보여줌 */}
      {resume && resume.resumeCode && (
        <section className="bg-white shadow-lg rounded-2xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">상세 경력 사항</h2>
            <button
              onClick={() => setIsAddingExp(true)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold"
            >
              + 경력 추가
            </button>
          </div>

          {isAddingExp && (
            <div className="mb-8 p-6 bg-green-50 rounded-2xl border-2 border-green-200 space-y-4">
              <input
                className="w-full p-3 border rounded-xl"
                placeholder="활동명 (title)"
                value={newExp.title}
                onChange={(e) =>
                  setNewExp({ ...newExp, title: e.target.value })
                }
              />
              <input
                className="w-full p-3 border rounded-xl"
                placeholder="기관/팀명 (organization)"
                value={newExp.organization}
                onChange={(e) =>
                  setNewExp({ ...newExp, organization: e.target.value })
                }
              />
              <textarea
                className="w-full p-3 border rounded-xl h-24"
                placeholder="경험 내용 (description)"
                value={newExp.description}
                onChange={(e) =>
                  setNewExp({ ...newExp, description: e.target.value })
                }
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 ml-1">시작일</label>
                  <input
                    type="date"
                    className="w-full p-3 border rounded-xl"
                    value={newExp.startedAt}
                    onChange={(e) =>
                      setNewExp({ ...newExp, startedAt: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 ml-1">종료일</label>
                  <input
                    type="date"
                    className="w-full p-3 border rounded-xl"
                    value={newExp.endedAt}
                    onChange={(e) =>
                      setNewExp({ ...newExp, endedAt: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddExperience}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold"
                >
                  저장
                </button>
                <button
                  onClick={() => setIsAddingExp(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold"
                >
                  취소
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {experiences.map((exp) => (
              <div
                key={exp.experienceCode}
                className="p-5 border rounded-xl bg-slate-50 flex justify-between items-center"
              >
                <div>
                  <h4 className="font-bold text-lg text-gray-800">
                    {exp.title}{" "}
                    <span className="text-sm font-normal text-gray-400">
                      | {exp.organization}
                    </span>
                  </h4>
                  <p className="text-sm text-gray-500">
                    {new Date(exp.startedAt).toLocaleDateString()} ~{" "}
                    {exp.endedAt
                      ? new Date(exp.endedAt).toLocaleDateString()
                      : "진행 중"}
                  </p>
                  <p className="text-gray-600 mt-2">{exp.description}</p>
                </div>
                <button
                  onClick={async () => {
                    if (window.confirm("삭제하시겠습니까?")) {
                      await api.delete(
                        `/resumes/${resume.resumeCode}/experiences/${exp.experienceCode}`
                      );
                      fetchData();
                    }
                  }}
                  className="text-red-400 hover:text-red-600"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default MyResumePage;
