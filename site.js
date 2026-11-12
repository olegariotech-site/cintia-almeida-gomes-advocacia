'use strict';

(() => {
  const root = document.documentElement;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const waBase = 'https://wa.me/5519971432465?text=';

  // Independent initializers: visual enhancement cannot disable the contact flow.
  function initialize(name, setup) {
    try { setup(); } catch (error) { console.error(`Falha ao iniciar ${name}:`, error); }
  }

  initialize('atendimento', () => {
    const form = document.getElementById('contactForm');
    const fields = document.getElementById('contactFields');
    const status = document.getElementById('status');
    const fallback = document.getElementById('formFallback');
    if (!form || !fields || !status || !fallback) return;

    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const message = [
        'Olá, Dra. Cíntia. Vim pelo site e gostaria de solicitar atendimento jurídico.',
        '',
        `Nome: ${String(data.get('nome') || '').trim()}`,
        `Telefone/WhatsApp: ${String(data.get('telefone') || '').trim()}`,
        `Área: ${data.get('area')}`,
        `Resumo: ${String(data.get('mensagem') || '').trim()}`
      ].join('\n');
      const url = waBase + encodeURIComponent(message);
      // Keep a real retry link, even when a browser blocks the new tab.
      const link = fallback.querySelector('a');
      link.href = url;
      link.textContent = 'abrir a mensagem preparada no WhatsApp';
      status.textContent = 'Sua mensagem está pronta. Se o WhatsApp não abrir, use o link abaixo.';
      window.open(url, '_blank', 'noopener,noreferrer');
    });

    form.addEventListener('focusin', event => {
      if (event.target.matches('input, textarea, select')) root.classList.add('form-focus');
    });
    form.addEventListener('focusout', () => {
      queueMicrotask(() => {
        if (!form.contains(document.activeElement) || !document.activeElement.matches('input, textarea, select')) {
          root.classList.remove('form-focus');
        }
      });
    });
    form.addEventListener('input', () => {
      // A previous prepared URL must never send stale data after the form changes.
      fallback.querySelector('a').href = document.querySelector('.float').href;
      fallback.querySelector('a').textContent = 'solicitar atendimento diretamente pelo WhatsApp';
      status.textContent = '';
    });
    // Enable structured fields only after interception. A native noscript field
    // and the direct link keep contact available without JavaScript.
    fields.disabled = false;

    // Opening an area only reads content. Selection requires an explicit link.
    document.querySelectorAll('a[data-area]').forEach(link => {
      link.addEventListener('click', () => {
        const select = form.querySelector('#area');
        if (![...select.options].some(option => option.value === link.dataset.area)) return;
        select.value = link.dataset.area;
        select.dispatchEvent(new Event('input', { bubbles: true }));
        const destination = document.getElementById('contato');
        destination.setAttribute('tabindex', '-1');
        destination.focus({ preventScroll: true });
      });
    });
  });

  initialize('menu', () => {
    const header = document.getElementById('top');
    const button = document.getElementById('toggle');
    const nav = document.getElementById('nav');
    if (!header || !button || !nav) return;
    const compact = matchMedia('(max-width: 1000px)');
    function close(returnFocus = false) {
      nav.classList.remove('open');
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', 'Abrir menu');
      if (returnFocus) button.focus();
    }
    button.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    });
    nav.addEventListener('click', event => {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;
      close();
      // Keep keyboard focus at the destination instead of inside the hidden mobile menu.
      if (compact.matches) {
        const destination = document.querySelector(link.getAttribute('href'));
        if (destination) {
          destination.setAttribute('tabindex', '-1');
          destination.focus({ preventScroll: true });
        }
      }
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && nav.classList.contains('open')) close(true);
    });
    document.addEventListener('click', event => {
      if (!header.contains(event.target)) close();
    });
    document.addEventListener('focusin', event => {
      // Close after focus actually arrives outside. During pointer focus changes,
      // focusout can briefly leave activeElement on body before the link's click.
      if (!header.contains(event.target)) close();
    });
    compact.addEventListener('change', () => {
      const focused = document.activeElement;
      close();
      if (compact.matches && nav.contains(focused)) button.focus();
      if (!compact.matches && focused === button) nav.querySelector('a').focus();
    });
    button.hidden = false;
    header.classList.add('menu-ready');
  });

  initialize('acordeões', () => {
    // Native details/summary keep keyboard operation and usable no-JS disclosure.
    document.querySelectorAll('details[name]').forEach(item => {
      item.addEventListener('toggle', () => {
        if (!item.open) return;
        document.querySelectorAll('details[name]').forEach(other => {
          if (other !== item && other.getAttribute('name') === item.getAttribute('name')) other.open = false;
        });
      });
    });
  });

  initialize('assinatura em vídeo', () => {
    const video = document.getElementById('signatureVideo');
    const hero = document.getElementById('hero');
    const signature = video?.closest('.hero-signature');
    const mediaURL = video?.dataset.src;
    if (!video || !hero || !signature || !mediaURL) return;
    let inView = false;
    let failed = false;
    let playPending = false;
    let revision = 0;
    let loadStarts = 0;
    const canPlay = () => !motion.matches && !document.hidden && inView && !failed;
    function showPoster() { signature.classList.remove('is-playing'); }
    function fail() {
      if (failed) return;
      failed = true;
      video.pause();
      showPoster();
      // Release a failed decoder/network request instead of leaving it running
      // behind the poster. The data URL remains available only for a new visit.
      video.removeAttribute('src');
      video.load();
    }
    async function play() {
      if (playPending || !canPlay() || !video.paused) return;
      playPending = true;
      const requestedAt = revision;
      try {
        // No source is fetched without JS, or while reduced motion is requested.
        if (!video.getAttribute('src')) {
          video.muted = true;
          // One direct source avoids repeated selection of a deferred <source>
          // observed in WebKit. There is no competing native autoplay owner.
          video.src = mediaURL;
          video.load();
        }
        await video.play();
      } catch {
        // A lifecycle interruption is not an autoplay failure; retry on return.
        if (requestedAt === revision && canPlay()) fail();
      } finally {
        playPending = false;
        if (!canPlay()) { video.pause(); showPoster(); }
        else if (requestedAt !== revision) play();
      }
    }
    function sync() {
      revision += 1;
      // play() alone owns playback; preferences/visibility only pause or resume.
      if (canPlay()) play();
      else { video.pause(); showPoster(); }
    }
    video.addEventListener('playing', () => {
      if (canPlay()) signature.classList.add('is-playing');
      else { video.pause(); showPoster(); }
    });
    video.addEventListener('pause', showPoster);
    video.addEventListener('error', fail);
    video.addEventListener('loadstart', () => {
      // One source is loaded once; repeated starts without navigation indicate
      // a broken media pipeline. Stop it before it becomes a busy event loop.
      if (++loadStarts > 3) fail();
    });
    motion.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    sync();
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        inView = entries[0].isIntersecting;
        sync();
      }, { threshold: 0 });
      observer.observe(hero);
    } else {
      inView = true;
      sync();
    }
  });

  initialize('leitura e movimento', () => {
    const header = document.getElementById('top');
    let scheduled = false;
    function updateProgress() {
      scheduled = false;
      const max = root.scrollHeight - innerHeight;
      root.style.setProperty('--scroll', max > 0 ? String(Math.max(0, Math.min(1, scrollY / max))) : '0');
      header.classList.toggle('scrolled', scrollY > 20);
    }
    function schedule() { if (!scheduled) { scheduled = true; requestAnimationFrame(updateProgress); } }
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule, { passive: true });
    document.querySelectorAll('details').forEach(item => item.addEventListener('toggle', schedule));
    if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(document.body);
    updateProgress();
    if (!('IntersectionObserver' in window)) return;
    const impact = document.querySelector('.impact');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        if (!motion.matches) entry.target.classList.add(entry.target === impact ? 'is-animated' : 'enter');
        if (entry.target.matches('.step')) entry.target.classList.add('is-read');
        observer.unobserve(entry.target);
      });
    }, { threshold: .15 });
    // Avoid stacking a parent reveal over the three-line signature animation.
    // Reading and conversion stay quiet. The observer is shared with the
    // existing finite reveals; there is no scroll listener per component.
    document.querySelectorAll('.about .reveal, .areas .reveal, .principles .reveal, .insights .reveal, .step').forEach(element => {
      if (!element.closest('.impact')) observer.observe(element);
    });
    if (impact) observer.observe(impact);
  });

  initialize('apresentação fotográfica', () => {
    const hero = document.getElementById('hero');
    const portrait = hero?.querySelector('.portrait');
    if (!portrait || motion.matches) return;
    const present = () => {
      if (!motion.matches && portrait.naturalWidth) hero.classList.add('media-enter');
    };
    // Text and CTA never wait for the photo. The image itself is always visible;
    // this finite transform only settles the framing and draws the gold edge.
    portrait.decode().then(present).catch(() => {});
  });
})();


/* Privacy-first analytics: GTM loads only after explicit cookie acceptance. */
(() => {
  const GTM_ID = 'GTM-TGGPH6PH';
  const STORAGE_KEY = 'cintia_cookie_consent_v1';
  const banner = document.getElementById('cookieBanner');
  const accept = document.getElementById('cookieAccept');
  const reject = document.getElementById('cookieReject');
  const settings = document.getElementById('cookieSettings');
  if (!banner || !accept || !reject || !settings) return;

  let gtmLoaded = false;
  const readConsent = () => {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
  };
  const saveConsent = value => {
    try { localStorage.setItem(STORAGE_KEY, value); } catch {}
  };
  const loadGTM = () => {
    if (gtmLoaded || document.querySelector('script[data-ot-gtm]')) return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    const tag = document.createElement('script');
    tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtm.js?id=' + GTM_ID;
    tag.dataset.otGtm = 'true';
    document.head.appendChild(tag);
    gtmLoaded = true;
  };
  const openBanner = () => {
    banner.hidden = false;
    // Preferences is non-modal, but keyboard users must reach its choices next.
    reject.focus();
  };
  const closeBanner = () => {
    const returnFocus = banner.contains(document.activeElement);
    banner.hidden = true;
    if (returnFocus) settings.focus();
  };

  accept.addEventListener('click', () => {
    saveConsent('accepted');
    closeBanner();
    loadGTM();
  });
  reject.addEventListener('click', () => {
    saveConsent('rejected');
    closeBanner();
    // Removing a script node cannot stop tags/timers already executed by GTM.
    // A fresh document applies the stored refusal before any optional tag loads.
    if (gtmLoaded) window.location.reload();
  });
  settings.addEventListener('click', openBanner);

  const current = readConsent();
  if (current === 'accepted') loadGTM();
  else if (current !== 'rejected') banner.hidden = false;
})();
