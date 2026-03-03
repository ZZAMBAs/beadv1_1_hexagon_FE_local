# Frontend Optimization TODO

## 목적
- React, JavaScript, 유지보수성 관점에서 구조를 안정화한다.
- 인증, API, 라우팅, 대형 페이지의 책임을 분리한다.
- 리팩터링 이후 기능 회귀를 막기 위한 테스트 기반을 만든다.

## 1. 인증/세션 단일화
- [x] `src/session` 또는 `src/auth` 디렉터리를 만들고 토큰 저장/조회/삭제 로직을 한 곳으로 이동한다.
- [x] `AuthContext`에서 JWT 디코딩, 상태 갱신, 로그아웃 이동 처리의 책임을 분리한다.
- [x] `Header`, `Sidebar`, 개별 페이지에서 `localStorage`를 직접 읽는 코드를 제거한다.
- [x] role, `memberCode`, `isSignedUp` 파생값은 컨텍스트 또는 전용 selector/hook으로만 접근하게 만든다.
- [x] `api` 인터셉터가 `AuthContext`의 외부 변수에 의존하는 구조를 제거한다.
- [ ] 토큰 재발급 실패 시 공통 로그아웃 흐름이 한 번만 실행되도록 보장한다.
- [x] `window.location.reload()` 기반 상태 갱신을 제거하고 React 상태 갱신으로 대체한다.

## 2. API 계층 정리
- [ ] `src/api/api.js`는 axios 인스턴스와 공통 인터셉터만 담당하게 축소한다.
- [ ] 도메인별 API 모듈을 분리한다.
- [ ] 분리 대상: `memberApi`, `commissionApi`, `contractApi`, `searchApi`, `paymentApi`, `uploadApi`.
- [ ] 컴포넌트에서 직접 endpoint string을 조합하는 코드를 도메인 API 함수 호출로 치환한다.
- [ ] 응답 스키마 차이를 흡수하는 `mapper` 또는 `normalize` 함수를 API 계층에 둔다.
- [ ] 공통 에러 메시지 파싱 유틸을 만들어 페이지별 중복 `try/catch`를 줄인다.
- [ ] `axios`와 `api` 인스턴스가 섞인 인증 호출 흐름을 일관된 방식으로 정리한다.

## 3. 라우팅 구조 재편
- [ ] `App.js`의 route 선언을 public/protected/member/payment/search 단위로 분리한다.
- [ ] route config 또는 route module 방식으로 라우트 정의를 이동한다.
- [ ] `ProtectedRoute`에서 `window.location.pathname` 직접 접근을 제거하고 router state 기반으로 처리한다.
- [ ] 권한 체크는 로그인 여부, 가입 여부, role 체크를 분리된 guard로 나눈다.
- [ ] 페이지 컴포넌트는 `React.lazy`로 분리해 초기 번들을 줄인다.
- [ ] 공통 레이아웃(`Header`, `Footer`, 인증 필요 레이아웃)을 라우팅 레벨에서 조합한다.

## 4. 대형 페이지 분해
- [ ] 우선 분해 대상 페이지를 확정한다.
- [ ] 1순위: `CommissionSearchResultPage`
- [ ] 2순위: `SignUpPage`
- [ ] 3순위: `MyPage`
- [ ] 각 페이지에서 데이터 fetching, 폼 상태, 프레젠테이션을 분리한다.
- [ ] 페이지별 전용 hook을 도입한다.
- [ ] 후보: `useCommissionSearch`, `useSignupForm`, `useMyProfile`, `useFileUpload`.
- [ ] 검색 필터, 결과 카드, 추천어 목록, 페이지네이션을 독립 컴포넌트로 쪼갠다.
- [ ] 회원가입 페이지의 토큰 초기화, 닉네임 검사, 업로드, 제출 단계를 서비스 함수로 이동한다.
- [ ] 마이페이지의 role 해제, 프로필 데이터 로드, 이미지 URL 조합을 UI에서 분리한다.

## 5. 공통 UI/상태 패턴 정리
- [ ] `alert`, `confirm` 직접 호출을 공통 모달/토스트 계층으로 치환한다.
- [ ] 페이지별 로딩/에러/빈 상태 UI를 공통 컴포넌트로 통일한다.
- [ ] 스타일링 방식이 inline style과 Tailwind로 혼재된 화면의 기준을 정한다.
- [ ] 폼 입력, 버튼, 배지, 섹션 헤더 같은 반복 UI를 공통 컴포넌트로 승격한다.
- [ ] 검색 조건, 업로드 상태, 프로필 상태의 명명 규칙을 통일한다.
- [ ] 디버그용 `console.log`와 임시 주석을 제거한다.

## 6. 데이터/도메인 모델 명확화
- [ ] 화면에서 그대로 쓰기 어려운 API 응답은 view model로 변환해서 사용한다.
- [ ] `Commission`, `MemberProfile`, `ContractDraft`, `SearchFilters` 형태를 명시적으로 정의한다.
- [ ] 문자열 상수 역할을 하는 payment type, role, recruitment status를 상수 모듈로 정리한다.
- [ ] 날짜, 통화, 파일 URL 조합 로직을 유틸 함수로 분리한다.
- [ ] mock 데이터는 실제 API 연동 전용 fixture로 이동하고 프로덕션 컴포넌트에서 제거한다.

## 7. 성능 최적화
- [ ] 페이지 단위 code splitting 이후 번들 크기 변화를 측정한다.
- [ ] 검색 자동완성/추천 요청은 debounce 로직을 hook으로 추출한다.
- [ ] 반복 렌더링이 큰 리스트는 key 안정성, 파생 데이터 계산 위치를 재검토한다.
- [ ] 불필요한 상태 복제를 줄이고 URL state와 로컬 state의 중복을 줄인다.
- [ ] 프로필 등 공통 데이터는 필요 시 캐싱 전략을 도입한다.
- [ ] `useMemo`는 실제 비용이 큰 파생 계산에만 제한적으로 사용한다.

## 8. 테스트 보강
- [ ] 인증 컨텍스트의 로그인/로그아웃/토큰 갱신 흐름 테스트를 추가한다.
- [ ] 인터셉터의 401 재시도/재발급 실패 흐름 테스트를 추가한다.
- [ ] 검색 페이지의 URL 동기화와 API 파라미터 직렬화 테스트를 추가한다.
- [ ] 회원가입 페이지의 닉네임 검사, 업로드, 제출 흐름 테스트를 추가한다.
- [ ] 계약 생성, 역할 해제 같은 주요 액션은 사용자 관점 테스트를 추가한다.
- [ ] 리팩터링 대상 페이지부터 smoke test를 최소 1개씩 확보한다.

## 9. 실행 순서
- [ ] Step 1: 인증/세션 단일화
- [ ] Step 2: API 계층 분리 및 공통 유틸 정리
- [ ] Step 3: 라우팅 분리 및 lazy loading 적용
- [ ] Step 4: 검색/회원가입/마이페이지 순서로 대형 페이지 분해
- [ ] Step 5: 공통 UI 계층과 상태 표현 통일
- [ ] Step 6: 테스트 추가 및 회귀 확인

## 검토
- 이 문서는 현재 코드베이스 기준으로 우선순위를 반영한 TODO다.
- 가장 먼저 처리해야 할 항목은 인증/세션 단일화와 API 계층 정리다. 이 둘이 정리되지 않으면 페이지 분해 작업이 다시 엉킨다.
- 성능 최적화는 구조 정리 이후에 적용하는 것이 맞다. 현재 병목은 렌더링 미세 튜닝보다 중복 상태와 중복 책임이다.
- TODO 범위는 충분히 타당하지만 한 번에 전부 진행하면 리스크가 크다. 실제 작업은 인증, API, 검색 페이지처럼 세로 단위로 끊어 PR을 나누는 편이 안전하다.
- 추가 보완점은 완료 기준(Definition of Done)이다. 각 Step마다 대상 파일, 기대 산출물, 테스트 범위를 별도 이슈로 쪼개면 실행력이 더 올라간다.
