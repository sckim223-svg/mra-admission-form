const SPREADSHEET_ID = '여기에_구글시트_ID를_넣으십시오';
const SHEET_NAME = '지원서';
const SUCCESS_URL = 'https://mra-admission-form.vercel.app/success.html';
const FORM_URL = 'https://mra-admission-form.vercel.app/apply.html';
const ALERT_EMAIL = 'sckim223@gmail.com';

function doGet(e) {
  return HtmlService.createHtmlOutput(
    '<!DOCTYPE html><html><head><meta charset="UTF-8">' +
      '<meta http-equiv="refresh" content="0; url=' + FORM_URL + '">' +
      '<script>location.replace("' + FORM_URL + '");</script>' +
      '</head><body>이동 중입니다.</body></html>'
  );
}

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('시트 "' + SHEET_NAME + '"를 찾을 수 없습니다.');

    const submittedAt = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');

    const name = getParam_(e, 'name');
    const phone = getParam_(e, 'phone');
    const email = getParam_(e, 'email');
    const birth = getParam_(e, 'birth');
    const organization = getParamAny_(e, ['organization', 'company']);
    const license = getParam_(e, 'license');
    const graduation = getParamAny_(e, ['graduation', 'degree']);
    const motivation = getParam_(e, 'motivation');
    const otherReason = getParamAny_(e, ['otherReason', 'motivationOther']);
    const privacyConsent = getParamAny_(e, ['privacyConsent', 'privacy']);

    sheet.appendRow([
      submittedAt,
      name,
      phone,
      email,
      birth,
      organization,
      license,
      graduation,
      motivation,
      otherReason,
      privacyConsent,
    ]);

    const subject = '[MRA 지원서 접수] ' + (name || '이름없음') + ' / ' + (phone || '전화번호없음');

    const body =
      'MRA 온라인 입학지원서가 접수되었습니다.\n\n' +
      '접수일시: ' + submittedAt + '\n' +
      '성명: ' + name + '\n' +
      '휴대전화: ' + phone + '\n' +
      '이메일: ' + email + '\n' +
      '생년월일: ' + birth + '\n' +
      '소속: ' + organization + '\n' +
      '공인중개사자격: ' + license + '\n' +
      '4년제 대학 졸업(예정) 여부: ' + graduation + '\n' +
      '지원동기: ' + motivation + '\n' +
      '기타 사유: ' + otherReason + '\n' +
      '개인정보동의: ' + privacyConsent + '\n';

    MailApp.sendEmail({
      to: ALERT_EMAIL,
      subject: subject,
      body: body,
      name: 'MRA 온라인 입학지원 시스템',
      replyTo: email || undefined,
    });

    return HtmlService.createHtmlOutput(
      '<!DOCTYPE html><html><head><meta charset="UTF-8">' +
        '<meta http-equiv="refresh" content="0; url=' + SUCCESS_URL + '">' +
        '<script>location.replace("' + SUCCESS_URL + '");</script>' +
        '</head><body>접수 완료. 이동 중입니다.</body></html>'
    );
  } catch (error) {
    return HtmlService.createHtmlOutput(
      '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>' +
        '<h2>접수 처리 중 오류가 발생했습니다.</h2>' +
        '<p>' + escapeHtml_(String(error)) + '</p>' +
        '</body></html>'
    );
  }
}

function getParam_(e, key) {
  if (e && e.parameter && e.parameter[key] !== undefined) {
    return String(e.parameter[key]).trim();
  }
  return '';
}

function getParamAny_(e, keys) {
  for (var i = 0; i < keys.length; i += 1) {
    var val = getParam_(e, keys[i]);
    if (val !== '') return val;
  }
  return '';
}

function escapeHtml_(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function testMailPermission_() {
  MailApp.sendEmail('sckim223@gmail.com', 'MRA 메일 권한 테스트', '권한 승인 테스트입니다.');
}
