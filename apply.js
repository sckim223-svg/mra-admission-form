(function () {
  const form = document.getElementById('applicationForm');
  const submitButton = document.getElementById('submitButton');
  const messageEl = document.getElementById('formMessage');
  const motivationOtherField = document.getElementById('motivationOtherField');
  const motivationOtherInput = document.getElementById('motivationOther');

  if (!form || !submitButton || !messageEl || !motivationOtherField || !motivationOtherInput) {
    return;
  }

  const defaultButtonText = submitButton.textContent;

  const setMessage = (text) => {
    messageEl.textContent = text;
  };

  const updateMotivationOtherVisibility = () => {
    const selectedMotivation = form.querySelector('input[name="motivation"]:checked')?.value;
    const isOther = selectedMotivation === '기타';

    motivationOtherField.classList.toggle('hidden-field', !isOther);
    motivationOtherInput.required = isOther;

    if (!isOther) {
      motivationOtherInput.value = '';
    }
  };

  form.querySelectorAll('input[name="motivation"]').forEach((radio) => {
    radio.addEventListener('change', updateMotivationOtherVisibility);
  });

  updateMotivationOtherVisibility();

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage('');

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const payload = {
      name: formData.get('name')?.toString().trim() || '',
      phone: formData.get('phone')?.toString().trim() || '',
      email: formData.get('email')?.toString().trim() || '',
      birth: formData.get('birth')?.toString().trim() || '',
      company: formData.get('company')?.toString().trim() || '',
      license: formData.get('license')?.toString().trim() || '',
      educationStatus: formData.get('educationStatus')?.toString().trim() || '',
      motivation: formData.get('motivation')?.toString().trim() || '',
      motivationOther: formData.get('motivationOther')?.toString().trim() || '',
      privacy: formData.get('privacy') === 'on',
    };

    if (payload.motivation === '기타' && payload.motivationOther === '') {
      setMessage('지원동기에서 기타를 선택한 경우, 기타 사유를 입력해 주세요.');
      motivationOtherInput.focus();
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = '제출 중입니다...';

    try {
      const response = await fetch('/api/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.message || '지원서 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      }

      window.location.href = 'success.html';
    } catch (error) {
      setMessage(error.message || '지원서 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      submitButton.disabled = false;
      submitButton.textContent = defaultButtonText;
    }
  });
})();
