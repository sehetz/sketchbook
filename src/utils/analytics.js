// Google Analytics 4 Integration
// Privacy-friendly tracking with consent support

// Initialize GA4
export function initGA() {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  
  if (!measurementId) {
    console.warn('[Analytics] No GA Measurement ID found');
    return;
  }

  // Load GA4 script
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', measurementId, {
    anonymize_ip: true, // IP anonymization for GDPR
    cookie_flags: 'SameSite=None;Secure', // Modern cookie settings
  });

  console.log('[Analytics] GA4 initialized');
}

// Track page views
export function trackPageView(path) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: document.title,
    });
  }
}

// Track custom events
export function trackEvent(eventName, eventParams = {}) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, eventParams);
  }
}

// Examples for custom events:
// trackEvent('project_view', { project_name: 'Harbourwalk' });
// trackEvent('skill_filter', { skill: 'Foto' });
// trackEvent('external_link', { url: 'https://instagram.com/sehetz' });
