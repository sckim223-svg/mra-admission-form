const REQUIRED_FIELDS = ['name', 'phone', 'email', 'birth', 'company', 'license', 'educationStatus', 'motivation'];

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '허용되지 않은 요청 방식입니다.' });
  }

  try {
    const body = req.body || {};

    for (const field of REQUIRED_FIELDS) {
      if (!body[field] || String(body[field]).trim() === '') {
        return res.status(400).json({ message: `필수 입력값이 누락되었습니다: ${field}` });
      }
    }

    if (body.license !== '보유') {
      return res.status(400).json({ message: '공인중개사 자격 보유자만 지원할 수 있습니다.' });
    }

    if (!['졸업', '졸업예정', '해당 없음'].includes(body.educationStatus)) {
      return res.status(400).json({ message: '4년제 대학 졸업(예정) 여부를 올바르게 선택해 주세요.' });
    }

    const motivationChoices = [
      '전문지식 습득',
      '실무역량 강화',
      '사업화·수익모델 확장',
      '네트워크 형성',
      '명지대학교 대학원 진학 희망',
      '기타',
    ];

    if (!motivationChoices.includes(body.motivation)) {
      return res.status(400).json({ message: '지원동기를 올바르게 선택해 주세요.' });
    }

    if (body.motivation === '기타' && (!body.motivationOther || String(body.motivationOther).trim() === '')) {
      return res.status(400).json({ message: '기타 사유를 입력해 주세요.' });
    }

    if (body.privacy !== true) {
      return res.status(400).json({ message: '개인정보 수집 및 이용 동의가 필요합니다.' });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.MAIL_FROM || 'MRA 지원서 <onboarding@resend.dev>';

    if (!adminEmail || !resendApiKey) {
      return res.status(500).json({ message: '서버 설정이 완료되지 않았습니다. 관리자에게 문의해 주세요.' });
    }

    const submittedAt = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    const motivationOther = body.motivation === '기타' ? String(body.motivationOther || '').trim() : '해당 없음';

    const text = [
      '[MRA 온라인 지원서 접수]',
      '',
      `성명: ${body.name}`,
      `휴대전화: ${body.phone}`,
      `이메일: ${body.email}`,
      `생년월일: ${body.birth}`,
      `소속 중개사무소 또는 회사명: ${body.company}`,
      `공인중개사 자격 여부: ${body.license}`,
      `4년제 대학 졸업(예정) 여부: ${body.educationStatus}`,
      `지원동기: ${body.motivation}`,
      `기타 사유 입력값: ${motivationOther}`,
      `제출 일시: ${submittedAt}`,
    ].join('\n');

    const html = `
      <h2>MRA 온라인 지원서 접수</h2>
      <ul>
        <li><b>성명:</b> ${escapeHtml(body.name)}</li>
        <li><b>휴대전화:</b> ${escapeHtml(body.phone)}</li>
        <li><b>이메일:</b> ${escapeHtml(body.email)}</li>
        <li><b>생년월일:</b> ${escapeHtml(body.birth)}</li>
        <li><b>소속 중개사무소 또는 회사명:</b> ${escapeHtml(body.company)}</li>
        <li><b>공인중개사 자격 여부:</b> ${escapeHtml(body.license)}</li>
        <li><b>4년제 대학 졸업(예정) 여부:</b> ${escapeHtml(body.educationStatus)}</li>
        <li><b>지원동기:</b> ${escapeHtml(body.motivation)}</li>
        <li><b>기타 사유 입력값:</b> ${escapeHtml(motivationOther)}</li>
        <li><b>제출 일시:</b> ${escapeHtml(submittedAt)}</li>
      </ul>
    `;

    const mailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [adminEmail],
        subject: '[MRA] 온라인 지원서 접수',
        text,
        html,
      }),
    });

    if (!mailResponse.ok) {
      const errorText = await mailResponse.text();
      console.error('메일 전송 실패:', errorText);
      return res.status(502).json({ message: '이메일 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.' });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('지원서 처리 중 오류:', error);
    return res.status(500).json({ message: '지원서 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' });
  }
};
