const checkRelocation = () => {
  const relocationConfirm = document.querySelector<HTMLButtonElement>(
    "[data-qa='relocation-warning-confirm']",
  );
  if (relocationConfirm) {
    relocationConfirm.click();
  }
};

export function tickHH({
  idx,
  settings,
}: {
  idx: number;
  settings: BotSettings;
}) {
  const cards = document.querySelectorAll<HTMLElement>(
    "[data-qa='vacancy-serp__vacancy']",
  );

  console.log({ Letter: settings.responseLetter });

  if (!cards.length) return { nextIdx: idx, done: true };

  const card = cards[idx];
  if (!card) return { nextIdx: idx, done: true };

  card.scrollIntoView({ block: "center" });

  const title = card
    .querySelector<HTMLElement>('[data-qa="serp-item__title"]')
    ?.textContent?.trim();
  console.log(
    `[JobAgent] HH [${idx + 1}/${cards.length}] ${title ?? "(no title)"}`,
  );

  // const buttonResponse =

  const btn = card.querySelector<HTMLAnchorElement>(
    '[data-qa="vacancy-serp__vacancy_response"]',
  );
  if (btn?.href) console.log(`[JobAgent] response href: ${btn.href}`);

  return { nextIdx: idx + 1 };
}
