/* ============================================================
   THE JOURNAL — Client-side interactions
   Theme toggle, TOC highlighting, reading progress,
   sidebar toggle (desktop + mobile)
   ============================================================ */

(function () {
  'use strict';

  // --- 1. Theme Toggle ---
  function initTheme() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    const hljsLight = document.getElementById('hljs-light');
    const hljsDark = document.getElementById('hljs-dark');

    function applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('journal-theme', theme);

      // Swap highlight.js stylesheets
      if (hljsLight && hljsDark) {
        if (theme === 'dark') {
          hljsLight.disabled = true;
          hljsDark.disabled = false;
        } else {
          hljsLight.disabled = false;
          hljsDark.disabled = true;
        }
      }

      if (toggle) {
        toggle.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
      }
    }

    toggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });

    // Ensure highlight.js sheets match initial theme
    const initial = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(initial);

    // Listen for system theme changes (only if no manual override)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('journal-theme')) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  // --- 2. TOC Active Highlighting ---
  function initTOC() {
    const tocLinks = document.querySelectorAll('.sidebar-toc-list a');
    const articleBody = document.querySelector('.article-body');

    if (!tocLinks.length || !articleBody) return;

    const headings = articleBody.querySelectorAll('h2, h3');
    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            tocLinks.forEach((link) => {
              if (link.getAttribute('href') === '#' + id) {
                link.setAttribute('data-active', 'true');
              } else {
                link.removeAttribute('data-active');
              }
            });
          }
        });
      },
      {
        threshold: 0,
        rootMargin: '-10% 0px -80% 0px',
      }
    );

    headings.forEach((heading) => observer.observe(heading));
  }

  // --- 3. Reading Progress Bar & Time ---
  function initReadingProgress() {
    const article = document.querySelector('article');
    const articleBody = document.querySelector('.article-body');
    if (!articleBody) return;

    const progressBar = document.querySelector('.progress-vertical-fill');
    const floatingTime = document.getElementById('floating-read-time');
    const totalMinutes = article ? parseInt(article.getAttribute('data-reading-time'), 10) || 0 : 0;

    function updateProgress() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const scrollable = docHeight - winHeight;
      let progress = 0;

      if (scrollable <= 0) {
        progress = 100;
      } else {
        progress = Math.min((scrollTop / scrollable) * 100, 100);
      }

      if (progressBar) {
        progressBar.style.height = progress + '%';
      }

      if (floatingTime && totalMinutes > 0) {
        if (progress > 5 && progress < 99) {
          const minutesLeft = Math.max(1, Math.ceil(totalMinutes * (1 - progress / 100)));
          floatingTime.textContent = minutesLeft + ' min left';
          floatingTime.classList.add('visible');
        } else {
          floatingTime.classList.remove('visible');
        }
      }
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  // --- 4. Sidebar Toggle ---
  function initSidebar() {
    const toggle = document.getElementById('sidebar-toggle');
    if (!toggle) return;

    function isMobile() {
      return window.innerWidth < 768;
    }

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();

      if (isMobile()) {
        // Mobile: open/close overlay sidebar
        document.body.classList.toggle('sidebar-open');
      } else {
        // Desktop: collapse/expand sidebar
        const html = document.documentElement;
        const collapsed = html.getAttribute('data-sidebar') === 'collapsed';
        if (collapsed) {
          html.removeAttribute('data-sidebar');
          localStorage.removeItem('journal-sidebar');
        } else {
          html.setAttribute('data-sidebar', 'collapsed');
          localStorage.setItem('journal-sidebar', 'collapsed');
        }
      }
    });

    // Close mobile sidebar when clicking the overlay
    document.addEventListener('click', (e) => {
      if (
        document.body.classList.contains('sidebar-open') &&
        !e.target.closest('.sidebar') &&
        !e.target.closest('.sidebar-toggle')
      ) {
        document.body.classList.remove('sidebar-open');
      }
    });

    // Close sidebar on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (document.body.classList.contains('sidebar-open')) {
          document.body.classList.remove('sidebar-open');
        }
      }
    });
  }

  // --- 5. Highlight.js initialization ---
  function initHighlight() {
    if (typeof hljs !== 'undefined') {
      const codeBlocks = document.querySelectorAll('pre code');
      if (codeBlocks.length > 0) {
        hljs.highlightAll();
      }
    }
  }

  // --- 6. Smooth entrance animations ---
  function initEntranceAnimation() {
    const main = document.querySelector('.main');
    if (main) {
      main.classList.add('main--visible');
    }
  }

  // --- Initialize all ---
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initTOC();
    initReadingProgress();
    initSidebar();
    initHighlight();

    // Delay entrance slightly for smooth feel
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        initEntranceAnimation();
      });
    });
  });
})();
