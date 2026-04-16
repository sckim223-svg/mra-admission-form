(function () {
  const form = document.getElementById('applicationForm');
  const submitButton = document.getElementById('submitButton');
  const messageEl = document.getElementById('formMessage');
  const motivationOtherField = document.getElementById('motivationOtherField');
  const motivationOtherInput = document.getElementById('motivationOther');

  if (!form || !submitButton || !messageEl || !motivationOtherField || !motivationOtherInput) {
    return;
  }

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

  form.addEventListener('submit', (event) => {
    messageEl.textContent = '';

    if (!form.checkValidity()) {
      event.preventDefault();
      form.reportValidity();
      return;
    }

    const selectedMotivation = form.querySelector('input[name="motivation"]:checked')?.value;
    if (selectedMotivation === '기타' && motivationOtherInput.value.trim() === '') {
      event.preventDefault();
      messageEl.textContent = '지원동기에서 기타를 선택한 경우, 기타 사유를 입력해 주세요.';
      motivationOtherInput.focus();
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = '제출 중입니다...';
  });
})();
