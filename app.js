(() => {
  const applyLanguage = (language) => {
    const value = language === 'en' ? 'en' : 'zh';
    document.documentElement.dataset.language = value;
    document.documentElement.lang = value === 'zh' ? 'zh-CN' : 'en';
    document.title = `${document.body.dataset[value === 'zh' ? 'titleZh' : 'titleEn']} · Projects`;
    const description = document.querySelector('meta[name="description"]');
    description.content = description.dataset[value];
    document.querySelectorAll('[data-set-language]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.setLanguage === value));
    });
  };
  let initial = 'zh';
  try { initial = localStorage.getItem('portfolio-language') || 'zh'; } catch (_) {}
  applyLanguage(initial);
  document.querySelectorAll('[data-set-language]').forEach(button => {
    button.addEventListener('click', () => {
      const language = button.dataset.setLanguage;
      applyLanguage(language);
      try { localStorage.setItem('portfolio-language', language); } catch (_) {}
    });
  });
  document.getElementById('year').textContent = new Date().getFullYear();
})();
