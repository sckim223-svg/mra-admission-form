# 명지대학교 부동산대학원 MRA 입학지원 페이지 (Google Sheet 접수 버전)

중장년층도 쉽게 입력할 수 있도록 큰 글자와 단순한 화면으로 구성한 온라인 지원 페이지입니다.

## 파일 구조 (단순 구성)

- `index.html` : 메인 안내 페이지
- `apply.html` : 온라인 지원서 입력 페이지 (Google Apps Script 웹앱으로 직접 POST)
- `apply.js` : 지원동기 `기타` 입력칸 표시 제어 + 제출 중 버튼 비활성화
- `success.html` : 참고용 완료 페이지(강제 이동 없음)
- `styles.css` : 공통 스타일
- `vercel.json` : 정적 배포 설정

## 1) 로컬 실행 방법 (초보자용)

1. 프로젝트 폴더에서 `index.html` 파일을 더블클릭합니다.
2. 브라우저에서 화면을 확인합니다.
3. 실제 저장 테스트는 `apply.html`의 form action에 Google Apps Script 웹앱 URL을 넣은 뒤 진행합니다.

## 2) Vercel 배포 방법 (초보자용)

1. 프로젝트를 GitHub에 업로드합니다.
2. [Vercel](https://vercel.com)에서 **Add New → Project**를 선택합니다.
3. 저장소를 Import 후 Deploy 합니다.
4. 배포된 URL에서 지원서 제출 동작을 확인합니다.

## 3) Google Apps Script 웹앱 URL 설정 방법

1. `apply.html` 파일을 열어 `<form>` 태그의 `action` 값을 찾습니다.
2. `action` 값을 아래 실제 웹앱 URL로 설정합니다.
   - `https://script.google.com/macros/s/AKfycbyRIHr9rGe9WWhpFjM5RlEjt5OV4UJJxdtDuRBd-fTkTpfBO-oP8GkRGs74WEbS4H29/exec`
3. 저장 후 다시 배포(또는 파일 반영)합니다.

## 4) 관리자(구글시트) 저장 방식

- 이 버전은 메일 발송(Resend)을 사용하지 않습니다.
- 지원서 데이터는 Google Apps Script 웹앱으로 일반 HTML `POST` 방식으로 전송됩니다.
- 실제 시트 저장 로직은 Google Apps Script 쪽 코드에서 처리합니다.
- 저장 직후 알림 메일은 Google Apps Script의 `MailApp.sendEmail`로 발송합니다.
- 실제 완료 화면은 Vercel의 `success.html`이 담당하며, Apps Script는 처리 후 해당 URL로 리디렉션합니다.

## 5) 지원폼 최종 항목

- 성명
- 휴대전화
- 이메일
- 생년월일
- 소속 중개사무소 또는 회사명
- 공인중개사 자격 여부
- 4년제 대학 졸업(예정) 여부
- 지원동기(객관식)
- 개인정보 수집 및 이용 동의 체크박스

### 지원동기 객관식 보기
1. 전문지식 습득
2. 실무역량 강화
3. 사업화·수익모델 확장
4. 네트워크 형성
5. 기타 (선택 시 기타 사유 입력칸 노출)

## 6) 참고

- 본 과정은 **공인중개사 자격 보유자만 지원 가능**하도록 안내합니다.
- 제출 시 `apply.js`에서 필수값/기타 입력값을 확인합니다.
- 제출 중에는 버튼을 비활성화하고 `제출 중입니다...` 문구를 표시해 중복 제출을 방지합니다.
- `success.html` 이동은 Google Apps Script가 `https://mra-admission-form.vercel.app/success.html`로 리디렉션해 처리합니다.

## 7) Google Apps Script 파라미터 매핑 점검

Google Apps Script에서 `e.parameter`(또는 `p`)로 읽는 키와 폼 `name`이 정확히 일치해야 합니다.

- `p.name` → 성명
- `p.phone` → 휴대전화
- `p.email` → 이메일
- `p.birth` → 생년월일
- `p.company` → 소속 중개사무소 또는 회사명
- `p.license` → 공인중개사 자격 여부
- `p.degree` → 4년제 대학 졸업(예정) 여부
- `p.motivation` → 지원동기
- `p.motivationOther` → 기타 사유 입력값
- `p.privacy` → 개인정보 동의

특히 구글시트 열 제목 `4년제대학졸업여부`에는 `p.degree` 값을 저장하도록 Apps Script를 유지하세요.

## 8) Google Apps Script 알림 메일 설정 및 재배포

저장소의 `google-apps-script/Code.gs` 최종 운영 코드를 Apps Script 프로젝트에 반영하면,
아래 순서로 동작합니다.

1. `MRA 지원서` 스프레드시트의 `지원서` 탭에 저장
2. `sckim223@gmail.com`으로 접수 알림 메일 발송
3. `https://mra-admission-form.vercel.app/success.html`로 즉시 리디렉션

- 수신 이메일: `sckim223@gmail.com`
- 메일 제목: `[MRA 지원서 접수] 성명 / 휴대전화`

### 반영 순서
1. Apps Script 편집기에 `google-apps-script/Code.gs` 내용을 붙여넣습니다.
2. 운영 스프레드시트 이름이 `MRA 지원서`, 탭 이름이 `지원서`인지 확인합니다.
3. **배포 → 배포 관리 → 수정(Edit)** 에서 새 버전으로 다시 배포합니다.
4. 최초 1회는 아래 권한 승인이 필요합니다.
   - Google Sheets 접근 권한
   - MailApp 메일 발송 권한

> 이미 운영 중인 웹앱이라도, 코드 변경 후에는 **웹앱 재배포**를 해야 변경사항이 실제 수신에 반영됩니다.
