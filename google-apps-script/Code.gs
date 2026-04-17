const SPREADSHEET_ID = '1R_hGz6bufwQhDxP9u7jgipwPQHNwPkFp327JFhMsYio';
const SHEET_NAME = '지원서';
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
    const sheet = getTargetSheet_();
    ensureHeader_(sheet);

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

    // 1) 지원서 시트 저장
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

    // 2) 접수 알림 메일 발송
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

    // 3) 접수 완료 최종 화면 출력
    return HtmlService.createHtmlOutput(
      '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>접수 완료</title>' +
        '<style>body{font-family:"Malgun Gothic",sans-serif;line-height:1.8;padding:28px;color:#111827;}h1{font-size:28px;margin:0 0 14px;}p{font-size:20px;margin:0 0 8px;} .tel{font-weight:800;color:#b45309;}</style>' +
        '</head><body>' +
        '<h1>지원서가 정상 접수되었습니다.</h1>' +
        '<p>담당교수인 김선철교수에게 아래와 같이 문자를 보내주세요</p>' +
        '<p>OOO 온라인 접수하였습니다</p>' +
        '<p class="tel">김선철교수 HP : 010-8596-3770</p>' +
        '</body></html>'
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

function getTargetSheet_() {
  const id = String(SPREADSHEET_ID || '').trim();

  if (!id) {
    throw new Error('스프레드시트 ID가 비어 있습니다. SPREADSHEET_ID 값을 확인해 주세요.');
  }

  if (!/^[a-zA-Z0-9_-]{30,}$/.test(id)) {
    throw new Error('스프레드시트 ID 형식이 올바르지 않습니다. SPREADSHEET_ID 값을 다시 확인해 주세요.');
  }

  const ss = SpreadsheetApp.openById(id);
  const sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    throw new Error('시트 "' + SHEET_NAME + '"를 찾을 수 없습니다.');
  }

  return sheet;
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

function testMailPermission() {
  MailApp.sendEmail('sckim223@gmail.com', 'MRA 메일 권한 테스트', '권한 승인 테스트입니다.');
}

function resetApplicationSheet() {
  const sheet = getTargetSheet_();
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();

  if (lastRow > 1 && lastCol > 0) {
    sheet.getRange(2, 1, lastRow - 1, lastCol).clearContent();
  }
}
