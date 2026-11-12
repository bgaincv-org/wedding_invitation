// Remember only the cloth intro; the invitation cover returns on every reload.
// Keep this session version aligned with WELCOME_SESSION_KEY in src/lib/content.ts.
// This tiny same-origin script runs before the main bundle, preventing a white flash.
(() => {
  if (location.hash || matchMedia('(prefers-reduced-motion: reduce)').matches) return
  try { if (sessionStorage.getItem('wedding-welcome-seen-v8') === 'yes') return } catch { /* Storage is optional. */ }
  document.documentElement.classList.add('is-welcome-loading')
})()
