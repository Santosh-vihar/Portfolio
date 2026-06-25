/**
 * Portfolio Main JavaScript
 * Bakka Sri Santosh Vihar | AI & Machine Learning Engineer
 * Premium interactions, animations, and functionality
 */

'use strict';

/* ============================================================
   THEME MANAGEMENT
   ============================================================ */
const ThemeManager = {
  key: 'portfolio-theme',
  root: document.documentElement,

  init() {
    const saved = localStorage.getItem(this.key);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    this.apply(theme);
    this.bindToggle();

    // Listen for OS preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem(this.key)) {
        this.apply(e.matches ? 'dark' : 'light');
      }
    });
  },

  apply(theme) {
    this.root.setAttribute('data-theme', theme);
    const sunIcon = document.getElementById('iconSun');
    const moonIcon = document.getElementById('iconMoon');
    if (theme === 'dark') {
      if (sunIcon) sunIcon.style.display = 'none';
      if (moonIcon) moonIcon.style.display = 'block';
    } else {
      if (sunIcon) sunIcon.style.display = 'block';
      if (moonIcon) moonIcon.style.display = 'none';
    }
  },

  toggle() {
    const current = this.root.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    this.apply(next);
    localStorage.setItem(this.key, next);
  },

  bindToggle() {
    const btn = document.getElementById('themeToggle');
    if (btn) {
      btn.addEventListener('click', () => this.toggle());
      btn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggle();
        }
      });
    }
  }
};

/* ============================================================
   NAVIGATION
   ============================================================ */
const Navigation = {
  nav: null,
  hamburger: null,
  mobileNav: null,
  lastScrollY: 0,

  init() {
    this.nav = document.getElementById('mainNav');
    this.hamburger = document.getElementById('hamburger');
    this.mobileNav = document.getElementById('mobileNav');

    this.bindScroll();
    this.bindHamburger();
    this.bindMobileLinks();
    this.bindScrollSpy();
    this.updateNavState();
  },

  bindScroll() {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.updateNavState();
          this.updatePageProgress();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  },

  updateNavState() {
    const scrollY = window.scrollY;
    if (this.nav) {
      this.nav.classList.toggle('scrolled', scrollY > 20);
    }
    this.lastScrollY = scrollY;
  },

  updatePageProgress() {
    const progressEl = document.getElementById('pageProgress');
    if (!progressEl) return;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
    progressEl.style.width = `${Math.min(progress, 100)}%`;
  },

  bindHamburger() {
    if (!this.hamburger || !this.mobileNav) return;
    this.hamburger.addEventListener('click', () => this.toggleMobileMenu());
    this.hamburger.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleMobileMenu();
      }
    });
  },

  toggleMobileMenu() {
    const isOpen = this.mobileNav.classList.toggle('open');
    this.hamburger.classList.toggle('open', isOpen);
    this.hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  },

  closeMobileMenu() {
    if (this.mobileNav) this.mobileNav.classList.remove('open');
    if (this.hamburger) this.hamburger.classList.remove('open');
    this.hamburger?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  },

  bindMobileLinks() {
    const links = document.querySelectorAll('.mobile-link');
    links.forEach(link => {
      link.addEventListener('click', () => this.closeMobileMenu());
    });
    // Close on outside click
    document.addEventListener('click', e => {
      if (
        this.mobileNav?.classList.contains('open') &&
        !this.mobileNav.contains(e.target) &&
        !this.hamburger?.contains(e.target)
      ) {
        this.closeMobileMenu();
      }
    });
  },

  bindScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach(link => {
              link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
            });
          }
        });
      },
      { rootMargin: '-40% 0px -40% 0px' }
    );

    sections.forEach(s => observer.observe(s));
  }
};

/* ============================================================
   SCROLL REVEAL ANIMATIONS
   ============================================================ */
const ScrollReveal = {
  observer: null,

  init() {
    const elements = document.querySelectorAll('.reveal');
    if (!elements.length) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      elements.forEach(el => el.classList.add('visible'));
      return;
    }

    this.observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            this.observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach(el => this.observer.observe(el));
  }
};

/* ============================================================
   MOUSE FOLLOW GRADIENT
   ============================================================ */
const MouseGradient = {
  el: null,
  targetX: 0,
  targetY: 0,
  currentX: 0,
  currentY: 0,
  rafId: null,

  init() {
    this.el = document.getElementById('mouseGradient');
    if (!this.el) return;

    // Only on desktop
    if (window.matchMedia('(max-width: 768px)').matches) {
      this.el.style.display = 'none';
      return;
    }

    // Reduce motion check
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.el.style.display = 'none';
      return;
    }

    document.addEventListener('mousemove', e => {
      this.targetX = e.clientX;
      this.targetY = e.clientY;
    }, { passive: true });

    this.animate();
  },

  animate() {
    // Lerp for smooth follow
    this.currentX += (this.targetX - this.currentX) * 0.08;
    this.currentY += (this.targetY - this.currentY) * 0.08;

    if (this.el) {
      this.el.style.transform = `translate(${this.currentX - 300}px, ${this.currentY - 300}px)`;
    }

    this.rafId = requestAnimationFrame(() => this.animate());
  }
};

/* ============================================================
   SMOOTH SCROLL
   ============================================================ */
const SmoothScroll = {
  init() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', e => {
        const href = anchor.getAttribute('href');
        if (!href || href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();

        const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 70;
        const targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight;

        window.scrollTo({ top: targetPos, behavior: 'smooth' });
      });
    });

    // Scroll down button
    const scrollDownBtn = document.getElementById('scrollDown');
    if (scrollDownBtn) {
      scrollDownBtn.addEventListener('click', () => {
        const aboutSection = document.getElementById('about');
        if (aboutSection) {
          aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
      scrollDownBtn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          scrollDownBtn.click();
        }
      });
    }
  }
};

/* ============================================================
   CONTACT FORM
   ============================================================ */
const ContactForm = {
  form: null,
  submitBtn: null,
  statusEl: null,

  init() {
    this.form = document.getElementById('contactForm');
    this.submitBtn = document.getElementById('contactSubmit');
    this.statusEl = document.getElementById('formStatus');

    if (!this.form) return;
    this.form.addEventListener('submit', e => this.handleSubmit(e));
  },

  validate() {
    const name = document.getElementById('contactName')?.value.trim();
    const email = document.getElementById('contactEmail')?.value.trim();
    const message = document.getElementById('contactMessage')?.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || name.length < 2) return 'Please enter your full name.';
    if (!email || !emailRegex.test(email)) return 'Please enter a valid email address.';
    if (!message || message.length < 10) return 'Please enter a message (at least 10 characters).';

    return null;
  },

  showStatus(msg, type) {
    if (!this.statusEl) return;
    this.statusEl.textContent = msg;
    this.statusEl.className = `form-status ${type}`;
  },

  hideStatus() {
    if (!this.statusEl) return;
    this.statusEl.className = 'form-status';
  },

  handleSubmit(e) {
    this.hideStatus();

    const error = this.validate();
    if (error) {
      e.preventDefault();
      this.showStatus(error, 'error');
      return;
    }

    // Show loading state while submitting to FormSubmit
    if (this.submitBtn) {
      this.submitBtn.classList.add('loading');
    }
    
    // The browser will now naturally submit the form to the action URL
  }
};

/* ============================================================
   ANIMATED COUNTER (for stats/achievements)
   ============================================================ */
const CounterAnimation = {
  init() {
    const counters = document.querySelectorAll('.achievement-card__number, .stat__value');

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !entry.target.dataset.counted) {
            entry.target.dataset.counted = 'true';
            this.animate(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(el => observer.observe(el));
  },

  animate(el) {
    const text = el.textContent.trim();
    const numMatch = text.match(/^(\d+)/);
    if (!numMatch) return; // Not a numeric counter

    const target = parseInt(numMatch[1]);
    const suffix = text.slice(numMatch[0].length);
    const prefix = text.slice(0, numMatch.index);
    const duration = 1800;
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = `${prefix}${current}${suffix}`;
      if (progress < 1) requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  }
};

/* ============================================================
   SKILL TAG HOVER EFFECT
   ============================================================ */
const SkillHovers = {
  init() {
    const tags = document.querySelectorAll('.skill-tag');
    tags.forEach(tag => {
      tag.addEventListener('mouseenter', () => {
        tag.style.background = 'rgba(79, 70, 229, 0.08)';
        tag.style.borderColor = 'rgba(79, 70, 229, 0.25)';
        tag.style.color = 'var(--indigo)';
        tag.style.transform = 'translateY(-2px)';
        tag.style.transition = 'all 0.2s ease';
      });
      tag.addEventListener('mouseleave', () => {
        tag.style.background = '';
        tag.style.borderColor = '';
        tag.style.color = '';
        tag.style.transform = '';
      });
    });
  }
};

/* ============================================================
   PROJECT CARD TILT EFFECT (subtle)
   ============================================================ */
const CardTilt = {
  init() {
    const cards = document.querySelectorAll('.project-card');
    if (window.matchMedia('(max-width: 768px)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    cards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rotateX = ((y - cy) / cy) * -2;
        const rotateY = ((x - cx) / cx) * 2;

        card.style.transform = `translateY(-4px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        card.style.transition = 'transform 0.1s ease';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.4s ease';
      });
    });
  }
};

/* ============================================================
   KEYBOARD ACCESSIBILITY — FOCUS TRAP FOR MOBILE NAV
   ============================================================ */
const AccessibilityUtils = {
  init() {
    // Skip to main content (if user tabs)
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        const mobileNav = document.getElementById('mobileNav');
        if (mobileNav?.classList.contains('open')) {
          Navigation.closeMobileMenu();
        }
      }
    });
  }
};

/* ============================================================
   LAZY LOAD IMAGES
   ============================================================ */
const LazyLoad = {
  init() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    if ('loading' in HTMLImageElement.prototype) return; // Native support

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            observer.unobserve(img);
          }
        }
      });
    });

    images.forEach(img => observer.observe(img));
  }
};

/* ============================================================
   PERFORMANCE: REDUCE ANIMATIONS ON LOW-END DEVICES
   ============================================================ */
const PerformanceUtils = {
  init() {
    // If device has limited cores or reduced motion, simplify animations
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.style.setProperty('--transition-base', '0ms');
      document.documentElement.style.setProperty('--transition-slow', '0ms');
    }
  }
};

/* ============================================================
   TECH BADGE GRADIENT ON HOVER
   ============================================================ */
const TechBadgeEffects = {
  init() {
    const badges = document.querySelectorAll('.tech-badge');
    badges.forEach(badge => {
      badge.addEventListener('mouseenter', () => {
        badge.style.background = 'rgba(79, 70, 229, 0.07)';
        badge.style.borderColor = 'rgba(79, 70, 229, 0.22)';
        badge.style.color = 'var(--indigo)';
        badge.style.transition = 'all 0.2s ease';
      });
      badge.addEventListener('mouseleave', () => {
        badge.style.background = '';
        badge.style.borderColor = '';
        badge.style.color = '';
      });
    });
  }
};

/* ============================================================
   HERO FLOATING ANIMATION OBSERVER
   (Pause when not visible for performance)
   ============================================================ */
const HeroAnimations = {
  init() {
    const heroSection = document.getElementById('hero');
    if (!heroSection) return;

    const blobs = document.querySelectorAll('.blob');
    const badges = document.querySelectorAll('.hero__badge');

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const animState = entry.isIntersecting ? 'running' : 'paused';
        blobs.forEach(b => b.style.animationPlayState = animState);
        badges.forEach(b => b.style.animationPlayState = animState);
      });
    }, { threshold: 0 });

    observer.observe(heroSection);
  }
};

/* ============================================================
   INIT ALL MODULES
   ============================================================ */
function initPortfolio() {
  PerformanceUtils.init();
  ThemeManager.init();
  Navigation.init();
  SmoothScroll.init();
  ScrollReveal.init();
  MouseGradient.init();
  ContactForm.init();
  CounterAnimation.init();
  SkillHovers.init();
  CardTilt.init();
  TechBadgeEffects.init();
  HeroAnimations.init();
  AccessibilityUtils.init();
  LazyLoad.init();

  // Initial progress bar update
  Navigation.updatePageProgress();

  console.log(
    '%c✨ Bakka Sri Santosh Vihar — Portfolio Loaded',
    'background: linear-gradient(135deg, #4f46e5, #06b6d4); color: white; padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: bold;'
  );
}

/* ============================================================
   BOOT
   ============================================================ */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPortfolio);
} else {
  initPortfolio();
}
