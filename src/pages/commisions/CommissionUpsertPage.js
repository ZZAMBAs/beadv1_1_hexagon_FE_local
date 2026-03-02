import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// 실제 API 호출 대신 사용할 Mock Data (수정 모드 시뮬레이션용)
const MOCK_DATA = {
    title: "반응형 쇼핑몰 웹사이트 프론트엔드 개발 의뢰",
    content: `안녕하세요, 현재 운영 중인 의류 쇼핑몰의 리뉴얼 프로젝트를 함께하실 프리랜서 개발자분을 모십니다... (생략)`,
    paymentType: "FIXED",
    unitAmount: 5500000,
    startedAt: "2024-06-01",
    endedAt: "2024-07-31",
    recruitmentStatus: "OPEN",
    tagCode: ["React", "TypeScript", "TailwindCSS", "ShoppingMall"],
    plannedHires: 2,
};

const CommissionUpsertPage = ({ action }) => {
    const { code } = useParams();
    const navigate = useNavigate();
    const isUpdate = action === 'update';

    // 폼 상태 초기화
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        paymentType: 'FIXED', // 기본값
        unitAmount: 0,
        startedAt: '',
        endedAt: '',
        recruitmentStatus: 'OPEN',
        tagCode: [],
        plannedHires: 1
    });

    // 태그 입력을 위한 임시 상태
    const [tagInput, setTagInput] = useState('');
    const [loading, setLoading] = useState(isUpdate);

    // 1. 데이터 불러오기 (수정 모드일 경우)
    useEffect(() => {
        if (isUpdate && code) {
            // API 호출 시뮬레이션 (setTimeout)
            setTimeout(() => {
                console.log(`[GET] /api/commissions/${code} 호출 성공`);
                setFormData(MOCK_DATA); // Mock Data 주입
                setLoading(false);
            }, 500);
        } else {
            setLoading(false);
        }
    }, [isUpdate, code]);

    // 2. 입력 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 3. 태그 추가 핸들러
    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tagCode.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tagCode: [...prev.tagCode, tagInput.trim()]
            }));
            setTagInput('');
        }
    };

    // 3-1. 태그 삭제 핸들러
    const handleRemoveTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tagCode: prev.tagCode.filter(tag => tag !== tagToRemove)
        }));
    };

    // 3-2. 태그 입력창에서 엔터 키 처리
    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // 폼 제출 방지
            handleAddTag();
        }
    };

    // 4. 저장(Submit) 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();

        // 유효성 검사 (예시)
        if (formData.tagCode.length === 0) {
            alert("최소 1개의 기술 태그를 입력해주세요.");
            return;
        }

        try {
            if (isUpdate) {
                // [API] PUT /api/commissions/{code}
                console.log("수정 요청 데이터:", formData);
                alert("성공적으로 수정되었습니다. (Mock)");
                navigate(`/commissions/${code}`);
            } else {
                // [API] POST /api/commissions
                console.log("생성 요청 데이터:", formData);
                alert("성공적으로 등록되었습니다. (Mock)");

                // 생성된 ID가 'NEW_123'이라고 가정
                const newCommissionId = 'NEW_123';
                navigate(`/commissions/${newCommissionId}`);
            }
        } catch (error) {
            console.error("저장 실패:", error);
            alert("저장에 실패했습니다.");
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">데이터 로딩 중...</div>;

    return (
        <div className="max-w-4xl mx-auto my-10 p-8 bg-white shadow-xl rounded-2xl border border-gray-100">
            <h2 className="text-3xl font-extrabold mb-8 text-gray-800 border-b pb-4">
                {isUpdate ? '🛠️ 의뢰 수정하기' : '✨ 새 의뢰 등록하기'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* 섹션 1: 기본 정보 */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">제목 <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                            placeholder="프로젝트 제목을 입력하세요"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">모집 인원 (명)</label>
                            <input
                                type="number"
                                name="plannedHires"
                                min="1"
                                value={formData.plannedHires}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">모집 상태</label>
                            <select
                                name="recruitmentStatus"
                                value={formData.recruitmentStatus}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                            >
                                <option value="OPEN">모집중 (OPEN)</option>
                                <option value="CLOSED">마감 (CLOSED)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 섹션 2: 일정 및 예산 */}
                <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-700 mb-4">📅 일정 및 예산</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">시작일</label>
                            <input
                                type="date"
                                name="startedAt"
                                value={formData.startedAt}
                                onChange={handleChange}
                                required
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">종료일</label>
                            <input
                                type="date"
                                name="endedAt"
                                value={formData.endedAt}
                                onChange={handleChange}
                                required
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-indigo-500"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">지급 방식</label>
                            <select
                                name="paymentType"
                                value={formData.paymentType}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-indigo-500"
                            >
                                <option value="MONTHLY">월급</option>
                                <option value="PER_JOB">건당 지급</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">금액 (원)</label>
                            <input
                                type="number"
                                name="unitAmount"
                                value={formData.unitAmount}
                                onChange={handleChange}
                                placeholder="예: 5000000"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-indigo-500"
                            />
                        </div>
                    </div>
                </div>

                {/* 섹션 3: 기술 태그 (UI/UX 개선) */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">필요 기술 / 태그</label>
                    <div className="flex gap-2 mb-3">
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleTagKeyDown}
                            placeholder="기술 스택 입력 후 Enter (예: React)"
                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <button
                            type="button"
                            onClick={handleAddTag}
                            className="bg-indigo-600 text-white px-6 rounded-lg font-bold hover:bg-indigo-700 transition"
                        >
                            추가
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.tagCode.map((tag, index) => (
                            <span key={index} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 border border-indigo-100">
                                # {tag}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveTag(tag)}
                                    className="text-indigo-400 hover:text-indigo-900"
                                >
                                    &times;
                                </button>
                            </span>
                        ))}
                        {formData.tagCode.length === 0 && (
                            <span className="text-gray-400 text-sm py-1">등록된 태그가 없습니다.</span>
                        )}
                    </div>
                </div>

                {/* 섹션 4: 상세 내용 */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">상세 내용 <span className="text-red-500">*</span></label>
                    <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        className="w-full p-4 border border-gray-300 rounded-lg h-64 focus:ring-2 focus:ring-indigo-500 outline-none resize-none leading-relaxed"
                        placeholder="프로젝트 상세 내용을 입력해주세요."
                        required
                    />
                </div>

                {/* 버튼 영역 */}
                <div className="flex gap-4 pt-4 border-t">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex-1 py-3.5 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition"
                    >
                        취소하기
                    </button>
                    <button
                        type="submit"
                        className="flex-[2] py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg transition transform hover:-translate-y-0.5"
                    >
                        {isUpdate ? '수정 완료' : '작성 완료'}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default CommissionUpsertPage;