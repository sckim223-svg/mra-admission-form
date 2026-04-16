/**
 * MRA 온라인 입학지원 수신용 Google Apps Script 예시 코드
 * - Google Sheet 저장
 * - 저장 직후 알림 메일 발송
 */
function doPost(e) {
  var p = e.parameter;

  // 실제 사용 시 아래를 운영 시트 정보로 교체하세요.
  var SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';
  var SHEET_NAME = '지원서';
  var NOTIFY_EMAIL = 'sckim223@gmail.com';

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

  // 헤더가 없으면 생성
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      '접수일시',
      '성명',
      '휴대전화',
      '이메일',
      '생년월일',
      '소속',
      '공인중개사자격',
      '4년제대학졸업여부',
      '지원동기',
      '기타사유',
      '개인정보동의',
    ]);
  }

  var submittedAt = new Date();

  // 시트 저장 (기존 저장 기능 유지)
  sheet.appendRow([
    submittedAt,
    p.name || '',
    p.phone || '',
    p.email || '',
    p.birth || '',
    p.company || '',
    p.license || '',
    p.degree || '',
    p.motivation || '',
    p.motivationOther || '',
    p.privacy || '',
  ]);

  // 저장 직후 알림 메일 발송
  var subject = '[MRA 지원서 접수] 새 지원서가 접수되었습니다';
  var body = [
    '[MRA 지원서 접수 알림]',
    '',
    '성명: ' + (p.name || ''),
    '휴대전화: ' + (p.phone || ''),
    '이메일: ' + (p.email || ''),
    '생년월일: ' + (p.birth || ''),
    '소속: ' + (p.company || ''),
    '공인중개사자격: ' + (p.license || ''),
    '4년제 대학 졸업(예정) 여부: ' + (p.degree || ''),
    '지원동기: ' + (p.motivation || ''),
    '기타사유: ' + (p.motivationOther || ''),
    '개인정보동의: ' + (p.privacy || ''),
    '제출일시: ' + Utilities.formatDate(submittedAt, 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss'),
  ].join('\n');

  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: subject,
    body: body,
  });

  // 완료 페이지로 리다이렉트하고 싶다면 아래 URL을 실제 프론트엔드 success URL로 교체하세요.
  var SUCCESS_URL = 'https://YOUR_VERCEL_DOMAIN/success';
  return HtmlService.createHtmlOutput(
    '<script>location.replace(' + JSON.stringify(SUCCESS_URL) + ');</script>'
  );
}
