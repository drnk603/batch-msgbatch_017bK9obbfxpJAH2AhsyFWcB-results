(function() {
  'use strict';

  const state = {
    menuOpen: false,
    formSubmitting: false,
    notificationTimeout: null
  };

  const config = {
    debounceDelay: 150,
    notificationDuration: 5000,
    smoothScrollOffset: 72,
    formSubmitDelay: 800
  };

  const selectors = {
    burgerToggle: '.navbar-toggler',
    navCollapse: '.collapse',
    navLinks: '.nav-link',
    navList: '.navbar-nav',
    forms: '.needs-validation, .c-form',
    header: '.l-header',
    body: 'body',
    anchors: 'a[href^="#"]'
  };

  const regex = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^[\d\s\+\-\(\)]{10,20}$/,
    name: /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/
  };

  function debounce(fn, delay) {
    let timer;
    return function() {
      const args = arguments;
      const ctx = this;
      clearTimeout(timer);
      timer = setTimeout(function() {
        fn.apply(ctx, args);
      }, delay);
    };
  }

  function getHeaderHeight() {
    const header = document.querySelector(selectors.header);
    return header ? header.offsetHeight : config.smoothScrollOffset;
  }

  function isHomePage() {
    const path = window.location.pathname;
    return path === '/' || path === '/index.html' || path === '/index.htm' || path === '';
  }

  function createNotificationContainer() {
    let container = document.getElementById('notification-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'notification-container';
      container.setAttribute('style', 'position:fixed;top:20px;right:20px;z-index:9999;max-width:350px;');
      document.body.appendChild(container);
    }
    return container;
  }

  function showNotification(message, type) {
    type = type || 'info';
    const container = createNotificationContainer();
    const toast = document.createElement('div');
    toast.className = 'alert alert-' + type + ' alert-dismissible fade show';
    toast.setAttribute('role', 'alert');
    
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'btn-close';
    closeBtn.setAttribute('data-bs-dismiss', 'alert');
    closeBtn.setAttribute('aria-label', 'Sluiten');
    closeBtn.addEventListener('click', function() {
      removeToast(toast);
    });

    toast.textContent = message;
    toast.appendChild(closeBtn);
    container.appendChild(toast);

    setTimeout(function() {
      removeToast(toast);
    }, config.notificationDuration);
  }

  function removeToast(toast) {
    toast.classList.remove('show');
    setTimeout(function() {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 150);
  }

  function initBurgerMenu() {
    const toggle = document.querySelector(selectors.burgerToggle);
    const nav = document.querySelector(selectors.navCollapse);
    const navLinks = document.querySelectorAll(selectors.navLinks);
    const body = document.querySelector(selectors.body);

    if (!toggle || !nav) return;

    let focusableElements = [];

    function updateFocusableElements() {
      focusableElements = Array.prototype.slice.call(
        nav.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])')
      );
    }

    function trapFocus(e) {
      if (!state.menuOpen || focusableElements.length === 0) return;
      const firstEl = focusableElements[0];
      const lastEl = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    }

    function openMenu() {
      state.menuOpen = true;
      nav.classList.add('show');
      toggle.setAttribute('aria-expanded', 'true');
      body.classList.add('u-no-scroll');
      updateFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }

    function closeMenu() {
      state.menuOpen = false;
      nav.classList.remove('show');
      toggle.setAttribute('aria-expanded', 'false');
      body.classList.remove('u-no-scroll');
      toggle.focus();
    }

    function toggleMenu() {
      if (state.menuOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu();
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && state.menuOpen) {
        closeMenu();
      }
      if (e.key === 'Tab' && state.menuOpen) {
        trapFocus(e);
      }
    });

    document.addEventListener('click', function(e) {
      if (state.menuOpen && !nav.contains(e.target) && e.target !== toggle) {
        closeMenu();
      }
    });

    for (let i = 0; i < navLinks.length; i++) {
      navLinks[i].addEventListener('click', function() {
        if (state.menuOpen) {
          closeMenu();
        }
      });
    }

    const resizeHandler = debounce(function() {
      if (window.innerWidth >= 1024 && state.menuOpen) {
        closeMenu();
      }
    }, config.debounceDelay);

    window.addEventListener('resize', resizeHandler);
  }

  function initSmoothScroll() {
    const anchors = document.querySelectorAll(selectors.anchors);
    const isHome = isHomePage();

    if (!isHome) {
      for (let i = 0; i < anchors.length; i++) {
        const link = anchors[i];
        const href = link.getAttribute('href');
        if (href && href !== '#' && href !== '#!' && !href.startsWith('#!')) {
          const sectionId = href.substring(1);
          const targetSection = document.getElementById(sectionId);
          if (!targetSection) {
            link.setAttribute('href', '/#' + sectionId);
          }
        }
      }
    }

    for (let i = 0; i < anchors.length; i++) {
      anchors[i].addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (!href || href === '#' || href === '#!') return;
        if (href.startsWith('/#')) return;

        const targetId = href.substring(1);
        const target = document.getElementById(targetId);

        if (target) {
          e.preventDefault();
          const headerHeight = getHeaderHeight();
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    }

    if (isHome && window.location.hash) {
      setTimeout(function() {
        const hash = window.location.hash.substring(1);
        const target = document.getElementById(hash);
        if (target) {
          const headerHeight = getHeaderHeight();
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }

  function initActiveMenu() {
    const navLinks = document.querySelectorAll(selectors.navLinks);
    const currentPath = window.location.pathname;
    const isHome = isHomePage();

    for (let i = 0; i < navLinks.length; i++) {
      const link = navLinks[i];
      const linkHref = link.getAttribute('href');

      link.removeAttribute('aria-current');
      link.classList.remove('active');

      if (linkHref) {
        const linkPath = linkHref.split('#')[0] || '/';

        if (linkPath === currentPath || (isHome && (linkPath === '/' || linkPath === '/index.html'))) {
          link.setAttribute('aria-current', 'page');
          link.classList.add('active');
        } else if (!isHome && linkPath !== '/') {
          const normalizedCurrent = currentPath.replace(//index.html?$/, '/');
          const normalizedLink = linkPath.replace(//index.html?$/, '/');
          if (normalizedCurrent === normalizedLink) {
            link.setAttribute('aria-current', 'page');
            link.classList.add('active');
          }
        }
      }
    }
  }

  function validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const id = field.id;
    const name = field.name;

    if (field.hasAttribute('required') && !value) {
      return 'Dit veld is verplicht';
    }

    if (type === 'email' && value && !regex.email.test(value)) {
      return 'Voer een geldig e-mailadres in';
    }

    if (type === 'tel' && value && !regex.phone.test(value)) {
      return 'Voer een geldig telefoonnummer in';
    }

    if ((id === 'firstName' || id === 'lastName' || name === 'firstName' || name === 'lastName') && value && !regex.name.test(value)) {
      return 'Voer een geldige naam in';
    }

    if (field.tagName === 'TEXTAREA') {
      const minLength = parseInt(field.getAttribute('minlength')) || 10;
      if (value && value.length < minLength) {
        return 'Bericht moet minimaal ' + minLength + ' tekens bevatten';
      }
    }

    if (type === 'checkbox' && field.hasAttribute('required') && !field.checked) {
      return 'U moet akkoord gaan om verder te gaan';
    }

    return null;
  }

  function showFieldError(field, message) {
    field.classList.add('is-invalid');
    let feedback = field.parentNode.querySelector('.invalid-feedback');
    if (!feedback) {
      feedback = document.createElement('div');
      feedback.className = 'invalid-feedback';
      field.parentNode.appendChild(feedback);
    }
    feedback.textContent = message;
    feedback.style.display = 'block';
  }

  function clearFieldError(field) {
    field.classList.remove('is-invalid');
    const feedback = field.parentNode.querySelector('.invalid-feedback');
    if (feedback) {
      feedback.style.display = 'none';
    }
  }

  function initForms() {
    const forms = document.querySelectorAll(selectors.forms);

    for (let i = 0; i < forms.length; i++) {
      const form = forms[i];

      form.addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();

        if (state.formSubmitting) return;

        const fields = form.querySelectorAll('input, select, textarea');
        let isValid = true;

        for (let j = 0; j < fields.length; j++) {
          const field = fields[j];
          const error = validateField(field);

          if (error) {
            showFieldError(field, error);
            isValid = false;
          } else {
            clearFieldError(field);
          }
        }

        if (!isValid) {
          form.classList.add('was-validated');
          showNotification('Controleer de formuliervelden', 'danger');
          return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        let originalText = '';

        if (submitBtn) {
          originalText = submitBtn.innerHTML;
          submitBtn.disabled = true;
          state.formSubmitting = true;

          const spinner = document.createElement('span');
          spinner.className = 'spinner-border spinner-border-sm me-2';
          spinner.setAttribute('role', 'status');
          spinner.setAttribute('aria-hidden', 'true');

          submitBtn.innerHTML = '';
          submitBtn.appendChild(spinner);
          submitBtn.appendChild(document.createTextNode('Verzenden...'));
        }

        setTimeout(function() {
          const formData = new FormData(form);
          const data = {};
          formData.forEach(function(value, key) {
            data[key] = value;
          });

          fetch('process.php', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          })
          .then(function(response) {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then(function(result) {
            if (result.success) {
              showNotification('Bedankt! Uw bericht is verzonden.', 'success');
              setTimeout(function() {
                window.location.href = 'thank_you.html';
              }, 1000);
            } else {
              showNotification(result.message || 'Er is iets misgegaan. Probeer het later opnieuw.', 'danger');
            }
          })
          .catch(function(error) {
            showNotification('Uw aanvraag kon niet worden verzonden. Controleer uw internetverbinding en probeer het opnieuw.', 'danger');
          })
          .finally(function() {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.innerHTML = originalText;
              state.formSubmitting = false;
            }
          });
        }, config.formSubmitDelay);
      });

      const fields = form.querySelectorAll('input, select, textarea');
      for (let k = 0; k < fields.length; k++) {
        fields[k].addEventListener('blur', function() {
          const error = validateField(this);
          if (error) {
            showFieldError(this, error);
          } else {
            clearFieldError(this);
          }
        });

        fields[k].addEventListener('input', function() {
          if (this.classList.contains('is-invalid')) {
            const error = validateField(this);
            if (!error) {
              clearFieldError(this);
            }
          }
        });
      }
    }
  }

  function initImages() {
    const images = document.querySelectorAll('img');
    const placeholderSvg = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23e9ecef" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%236c757d" font-family="sans-serif" font-size="18"%3EAfbeelding niet beschikbaar%3C/text%3E%3C/svg%3E';

    for (let i = 0; i < images.length; i++) {
      const img = images[i];

      if (!img.hasAttribute('loading') && !img.classList.contains('c-logo__img') && !img.hasAttribute('data-critical')) {
        img.setAttribute('loading', 'lazy');
      }

      if (!img.classList.contains('img-fluid')) {
        img.classList.add('img-fluid');
      }

      img.addEventListener('error', function() {
        if (this.dataset.fallbackApplied) return;
        this.dataset.fallbackApplied = 'true';
        this.src = placeholderSvg;
        this.style.objectFit = 'contain';
        if (this.closest('.c-logo')) {
          this.style.maxHeight = '40px';
        }
      });
    }
  }

  function init() {
    if (window.__appInitialized) return;
    window.__appInitialized = true;

    initBurgerMenu();
    initSmoothScroll();
    initActiveMenu();
    initForms();
    initImages();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
