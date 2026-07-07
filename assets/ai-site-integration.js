(function () {
  function setupAiLinkTracking() {
    document.addEventListener('click', function (event) {
      var link = event.target.closest('a[href="/services/ai-business-processes/"]');
      if (!link || typeof trackEvent !== 'function') return;
      trackEvent('ai_service_link_click', {
        source_path: window.location.pathname,
        link_text: (link.textContent || '').trim()
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAiLinkTracking);
  } else {
    setupAiLinkTracking();
  }
}());
