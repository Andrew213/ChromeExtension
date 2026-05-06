export function getResponseButton(card: HTMLElement) {
  return card.querySelector<HTMLButtonElement>(
    'button[data-qa="vacancy-response-letter-toggle"]',
  );
}

export function findInlineCoverLetterForm(root: ParentNode = document) {
  return root.querySelector<HTMLFormElement>(
    'form[action*="vacancy_response/edit_ajax"][id^="cover-letter-"]',
  );
}

export function findInlineTextarea(form: HTMLFormElement) {
  return form.querySelector<HTMLTextAreaElement>('textarea[name="text"]');
}

export function findInlineSubmitButton(scope: ParentNode) {
  const button = scope.querySelector<HTMLButtonElement>(
    'button[data-qa="vacancy-response-letter-submit"]',
  );

  return button;
}
