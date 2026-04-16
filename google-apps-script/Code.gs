/**
 * MRA 온라인 입학지원 운영용 Google Apps Script (최종본)
 *
 * 동작 순서
 * 1) 'MRA 지원서' 스프레드시트의 '지원서' 탭에 데이터 저장
 * 2) sckim223@gmail.com 으로 접수 알림 메일 발송
 * 3) Vercel 완료 페이지로 즉시 리디렉션
 */
function doPost(e) {
  var p = e && e.parameter ? e.parameter : {};

  var SPREADSHEET_NAME = 'MRA 지원서';
  var SHEET_NAME = '지원서';
  var NOTIFY_EMAIL = 'sckim223@gmail.com';
  var SUCCESS_URL = 'https://mra-admission-form.vercel.app/success.html';

  var ss = getSpreadsheetByName_(SPREADSHEET_NAME);
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

  ensureHeader_(sheet);

  var submittedAt = new Date();
  var submittedAtText = Utilities.formatDate(submittedAt, 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');

  // 1) 시트 저장
  sheet.appendRow([
    submittedAtText,
    valueOrEmpty_(p.name),
    valueOrEmpty_(p.phone),
    valueOrEmpty_(p.email),
    valueOrEmpty_(p.birth),
    valueOrEmpty_(p.company),
    valueOrEmpty_(p.license),
    valueOrEmpty_(p.degree),
    valueOrEmpty_(p.motivation),
    valueOrEmpty_(p.motivationOther),
    valueOrEmpty_(p.privacy),
  ]);

  // 2) 접수 알림 메일 발송
  var applicantName = valueOrEmpty_(p.name);
  var applicantPhone = valueOrEmpty_(p.phone);
  var subject = '[MRA 지원서 접수] ' + applicantName + ' / ' + applicantPhone;

  var body = [
    '[MRA 지원서 접수 알림]',
    '',
    '접수일시: ' + submittedAtText,
    '성명: ' + applicantName,
    '휴대전화: ' + applicantPhone,
    '이메일: ' + valueOrEmpty_(p.email),
    '생년월일: ' + valueOrEmpty_(p.birth),
    '소속: ' + valueOrEmpty_(p.company),
    '공인중개사자격: ' + valueOrEmpty_(p.license),
    '4년제 대학 졸업(예정) 여부: ' + valueOrEmpty_(p.degree),
    '지원동기: ' + valueOrEmpty_(p.motivation),
    '기타 사유: ' + valueOrEmpty_(p.motivationOther),
    '개인정보동의: ' + valueOrEmpty_(p.privacy),
  ].join('\n');

  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: subject,
    body: body,
  });

  // 3) Vercel 완료 화면으로 리디렉션
  return HtmlService.createHtmlOutput(
    '<!doctype html><html><head><meta charset="utf-8"><script>location.replace(' +
      JSON.stringify(SUCCESS_URL) +
      ');</script></head><body></body></html>'
  );
}

function ensureHeader_(sheet) {
  if (sheet.getLastRow() > 0) {
    return;
  }

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

function getSpreadsheetByName_(spreadsheetName) {
  var files = DriveApp.getFilesByName(spreadsheetName);
  if (!files.hasNext()) {
    throw new Error('스프레드시트를 찾을 수 없습니다: ' + spreadsheetName);
  }

  var file = files.next();
  return SpreadsheetApp.openById(file.getId());
}

function valueOrEmpty_(v) {
  return v ? String(v).trim() : '';
}
