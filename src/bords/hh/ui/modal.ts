export function getApplyModal() {
  return document.querySelector<HTMLElement>(
    'div[role="dialog"][aria-modal="true"]',
  );
}

export function findLetterTextarea(modal: HTMLElement) {
  return (
    modal.querySelector<HTMLTextAreaElement>(
      'textarea[placeholder*="Сопроводительное"]',
    ) || modal.querySelector<HTMLTextAreaElement>("textarea")
  );
}

export function findSubmitButton(modal: HTMLElement) {
  const buttons = Array.from(
    modal.querySelectorAll<HTMLButtonElement>("button"),
  );
  return (
    buttons.find((b) => {
      return b.dataset.qa === "vacancy-response-submit-popup";
    }) || null
  );
}

export function isDisabled(btn: HTMLButtonElement) {
  return btn.disabled || btn.getAttribute("aria-disabled") === "true";
}

export function closeModal(modal: HTMLElement) {
  const closeBtn =
    modal.querySelector<HTMLButtonElement>('button[aria-label="Отмена"]') ||
    modal.querySelector<HTMLButtonElement>('[data-qa="modal-overlay"]');

  closeBtn?.click();
}

export function getVacancyResponseForm() {
  return document.querySelector<HTMLFormElement>(
    'form#RESPONSE_MODAL_FORM_ID[name="vacancy_response"]',
  );
}
