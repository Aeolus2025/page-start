(() => {
  const fallback = 'index.html';
  try {
    const redirectUrl = window.chrome?.runtime?.getURL?.(fallback) ?? fallback;
    window.location.replace(redirectUrl);
  } catch {
    window.location.replace(fallback);
  }
})();
