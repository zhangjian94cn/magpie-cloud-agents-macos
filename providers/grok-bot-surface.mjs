export const modernSurface = `typeof window.desktop?.main?.getCursorAuthStatus === "function"`
export const surfaceBots = `(() => [...document.querySelectorAll('button[data-agent-id]')].map(el => ({
  id: el.dataset.agentId,
  name: el.innerText.trim().split("\\n")[0] || el.getAttribute("aria-label") || el.dataset.agentId,
})))()`
export const surfaceSelected = `document.querySelector('button[data-agent-id][aria-current="page"], button[data-agent-id][data-active="true"]')?.dataset.agentId ?? null`
export const surfaceTail = `(() => {
  const region = document.querySelector('[role="log"]');
  if (!region) throw new Error("transcript region missing");
  region.scrollTop = region.scrollHeight;
  // User rows repeat data-role on their nested message. Read each leaf once.
  return { entries: [...region.querySelectorAll('[data-role]')].filter(el => !el.querySelector('[data-role]')).map(el => ({
    id: el.closest('[data-row-key]')?.dataset.rowKey || el.id,
    role: el.dataset.role,
    text: (el.querySelector('.sand-message-prose') || el).innerText,
  })) };
})()`
export const surfaceBusy = `(() => {
  const selected = document.querySelector('button[data-agent-id][aria-current="page"]');
  if (selected?.dataset.awaiting === "true" || /, Working(?:,|$)/.test(selected?.getAttribute('aria-label') || '')) return true;
  return [...document.querySelectorAll('button')].some(el =>
    !el.disabled && /^(stop|interrupt)(\\b| )/i.test(el.getAttribute('aria-label') || '')
  );
})()`
export const surfaceComposer = `(() => {
  const composer = document.querySelector('[contenteditable="true"][role="textbox"], textarea');
  if (!composer) return "missing";
  if ((composer.value ?? composer.innerText).trim()) return "draft";
  composer.focus();
  return "ready";
})()`
export const selectSurfaceBot = id => `(() => {
  const button = [...document.querySelectorAll('button[data-agent-id]')].find(el => el.dataset.agentId === ${JSON.stringify(id)});
  if (!button) return false;
  button.click();
  return true;
})()`
