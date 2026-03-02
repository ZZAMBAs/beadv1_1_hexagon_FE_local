import React, { useEffect, useState, useCallback } from "react";
import api from "../../api/api";
import axios from "axios"; // 파일 직접 전송을 위해 axios 기본 객체 사용

const MyPromotionPage = () => {
  const [promotion, setPromotion] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [myResumes, setMyResumes] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    paymentType: "PER_JOB",
    unitAmount: 0,
    resumeCode: "",
    pdfKey: "", // 서버에 저장할 S3 Key
  });

  // 1. S3 Pre-signed URL을 이용한 파일 업로드 로직
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("PDF 파일만 업로드 가능합니다.");
      return;
    }

    setUploading(true);
    try {
      // (1) 서버에 업로드용 Pre-signed URL 요청
      // 백엔드 스펙: serviceName(ENUM), fileName, contentType 필요
      const urlRes = await api.post("/s3/upload-url", {
        serviceName: "SELF_PROMOTIONS", // 백엔드 ServiceName ENUM 확인 필요
        fileName: file.name,
        contentType: file.type,
      });

      const { uploadUrl, fileKey } = urlRes.data.data;

      // (2) 발급받은 URL로 S3에 직접 파일 전송 (Axios 사용)
      // 주의: Pre-signed URL 업로드는 보통 PUT 방식을 사용합니다.
      await axios.put(uploadUrl, file, {
        headers: { "Content-Type": file.type },
      });

      // (3) 업로드 성공 시 fileKey를 formData에 저장
      setFormData((prev) => ({ ...prev, pdfKey: fileKey }));
      alert("파일 업로드가 완료되었습니다.");
    } catch (e) {
      console.error(e);
      alert("파일 업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  };

  // 2. 데이터 페칭 로직 (이전과 동일)
  const fetchMyResumes = useCallback(async () => {
    try {
      const res = await api.get("/resumes/me");
      const data = Array.isArray(res.data.data)
        ? res.data.data
        : [res.data.data];
      setMyResumes(data.filter((r) => r !== null));
    } catch (e) {
      console.log("이력서 로드 실패");
    }
  }, []);

  const fetchPromotion = useCallback(async () => {
    try {
      const res = await api.get("/self-promotions/me");
      console.log("서버에서 온 프로모션 원본 데이터:", res.data);

      // 서버 응답 구조에 따라 데이터 추출 (res.data.data 또는 res.data)
      const serverData = res.data.data || res.data;

      // 만약 serverData가 배열로 온다면 첫 번째 요소를 사용
      const actualData = Array.isArray(serverData) ? serverData[0] : serverData;

      if (actualData && (actualData.promotionCode || actualData.id)) {
        setPromotion(actualData);
        setFormData({
          title: actualData.title || "",
          content: actualData.content || "",
          paymentType: actualData.paymentType || "PER_JOB",
          unitAmount: actualData.unitAmount || 0,
          resumeCode: actualData.resumeCode || "",
          pdfKey: actualData.pdfKey || "",
        });
        setIsEditing(false);
      } else {
        // 데이터가 비어있을 때 (예: status 200인데 빈 객체)
        setPromotion(null);
        setIsEditing(true);
      }
    } catch (e) {
      // 404나 500 에러 시
      console.error("프로모션 페칭 에러 상세:", e.response || e);
      setPromotion(null);
      setIsEditing(true);
    }
  }, []);

  useEffect(() => {
    fetchPromotion();
    fetchMyResumes();
  }, [fetchPromotion, fetchMyResumes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploading) return alert("파일 업로드 중입니다.");

    try {
      const payload = {
        ...formData,
        resumeCode: formData.resumeCode || null,
      };

      // promotionCode가 확실히 존재하는지 체크
      if (promotion && promotion.promotionCode) {
        console.log("수정 요청(PATCH)을 보냅니다:", promotion.promotionCode);
        await api.patch(`/self-promotions/${promotion.promotionCode}`, payload);
      } else {
        console.log("신규 등록(POST)을 보냅니다.");
        await api.post("/self-promotions", payload);
      }

      alert("저장 완료!");
      await fetchPromotion(); // 데이터를 다시 불러와서 promotion 상태를 최신화
      setIsEditing(false);
    } catch (e) {
      console.error(e);
      alert("저장 실패");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">
        셀프 프로모션 관리
      </h2>

      {isEditing ? (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-2xl shadow-xl space-y-6"
        >
          {/* 이력서 선택 */}
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 font-semibold">
            <label className="block text-sm font-bold text-indigo-700 mb-2 font-semibold">
              연결할 이력서 선택
            </label>
            <select
              className="w-full p-3 border rounded-lg bg-white outline-none"
              value={formData.resumeCode}
              onChange={(e) =>
                setFormData({ ...formData, resumeCode: e.target.value })
              }
            >
              <option value="">연결 안 함 (선택 사항)</option>
              {myResumes.map((r) => (
                <option key={r.resumeCode} value={r.resumeCode}>
                  {r.title}
                </option>
              ))}
            </select>
          </div>

          {/* 제목/방식/금액/내용 (기존 코드와 동일) */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              홍보 제목
            </label>
            <input
              required
              className="w-full p-4 border rounded-xl"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                지급 방식
              </label>
              <select
                className="w-full p-4 border rounded-xl"
                value={formData.paymentType}
                onChange={(e) =>
                  setFormData({ ...formData, paymentType: e.target.value })
                }
              >
                <option value="MONTHLY">월급 (MONTHLY)</option>
                <option value="PER_JOB">건당 (PER_JOB)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2 font-semibold">
                단위 금액 (원)
              </label>
              <input
                type="number"
                required
                className="w-full p-4 border rounded-xl"
                value={formData.unitAmount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    unitAmount: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          {/* PDF 업로드 추가 */}
          <div className="p-4 border-2 border-dashed border-gray-200 rounded-xl">
            <label className="block text-sm font-bold text-gray-600 mb-2 font-semibold font-semibold">
              포트폴리오 PDF (선택사항)
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-50 file:text-indigo-700"
            />
            {uploading && (
              <p className="text-xs text-blue-500 mt-2 font-semibold">
                S3 서버로 파일 전송 중...
              </p>
            )}
            {formData.pdfKey && (
              <p className="text-xs text-green-600 mt-2 font-bold font-semibold">
                ✓ 파일 준비됨: {formData.pdfKey.split("/").pop()}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2 font-semibold">
              상세 내용
            </label>
            <textarea
              required
              className="w-full p-4 border rounded-xl h-40"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 bg-indigo-600 text-white py-4 rounded-xl font-bold"
            >
              {uploading ? "업로드 중..." : "저장 완료"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-8 py-4 bg-gray-100 text-gray-600 rounded-xl font-bold font-semibold"
            >
              취소
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white border-t-8 border-indigo-600 rounded-2xl p-8 shadow-md">
          <div className="flex justify-between items-start mb-6 font-semibold">
            <div>
              <h3 className="text-2xl font-bold text-indigo-900 mb-2 font-semibold">
                {promotion?.title}
              </h3>
              <div className="flex gap-2">
                {promotion?.resumeCode && (
                  <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded font-bold">
                    이력서 연결됨
                  </span>
                )}
                {promotion?.pdfDownloadUrl && (
                  <a
                    href={promotion.pdfDownloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded font-bold hover:bg-green-200"
                  >
                    📄 포트폴리오(PDF) 보기
                  </a>
                )}
              </div>
            </div>
            <span className="px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold font-semibold">
              노출 중
            </span>
          </div>
          <p className="text-gray-700 whitespace-pre-wrap mb-8 p-6 bg-slate-50 rounded-xl italic font-semibold">
            "{promotion?.content}"
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setIsEditing(true)}
              className="px-5 py-2 border rounded-lg text-sm font-semibold hover:bg-gray-50"
            >
              수정
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPromotionPage;
