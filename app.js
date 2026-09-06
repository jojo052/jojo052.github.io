(() => {
  const emailButton = document.querySelector('.email-copy[data-copy-email]');
  const emailStatus = document.getElementById('email-copy-status');
  let copyResult = null;
  let copyFeedbackTimer;
  let copyAttempt = 0;
  const updateEmailLabels = (language) => {
    const english = language === 'en';
    if (emailButton) {
      emailButton.setAttribute('aria-label', english ? 'Copy email address' : '复制邮箱地址');
    }
    if (emailStatus) {
      emailStatus.textContent = copyResult === null ? '' : copyResult
        ? (english ? 'Copied' : '已复制')
        : (english ? 'Copy failed. Try again.' : '复制失败，请重试');
    }
  };
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
    updateEmailLabels(value);
  };
  const copyWithSelection = (email) => {
    const previousFocus = document.activeElement;
    const textarea = document.createElement('textarea');
    textarea.value = email;
    textarea.readOnly = true;
    textarea.tabIndex = -1;
    textarea.setAttribute('aria-hidden', 'true');
    textarea.style.cssText = 'position: fixed; left: -9999px; top: 0;';
    try {
      document.body.appendChild(textarea);
      textarea.focus({ preventScroll: true });
      textarea.select();
      textarea.setSelectionRange(0, email.length);
      return document.execCommand('copy') === true;
    } catch (_) {
      return false;
    } finally {
      textarea.remove();
      if (previousFocus && typeof previousFocus.focus === 'function') {
        try { previousFocus.focus({ preventScroll: true }); } catch (_) {}
      }
    }
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
  if (emailButton) {
    emailButton.addEventListener('click', async () => {
      const attempt = ++copyAttempt;
      clearTimeout(copyFeedbackTimer);
      copyResult = null;
      updateEmailLabels(document.documentElement.dataset.language);
      const email = emailButton.dataset.copyEmail;
      let copied = false;
      if (email) {
        try {
          if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            await navigator.clipboard.writeText(email);
            copied = true;
          }
        } catch (_) {}
        if (!copied) copied = copyWithSelection(email);
      }
      if (attempt !== copyAttempt) return;
      copyResult = copied;
      updateEmailLabels(document.documentElement.dataset.language);
      copyFeedbackTimer = setTimeout(() => {
        copyResult = null;
        updateEmailLabels(document.documentElement.dataset.language);
      }, 2500);
    });
  }
  document.getElementById('year').textContent = new Date().getFullYear();
})();
