'use strict';

(() => {
  const root = document.documentElement;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const waBase = 'https://wa.me/5519998808725?text=';

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
    // Enable only after submit is intercepted. Without JS, only the direct contact link is available.
    fields.disabled = false;
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
    header.addEventListener('focusout', () => {
      queueMicrotask(() => { if (!header.contains(document.activeElement)) close(); });
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
    const source = video?.querySelector('source[data-src]');
    if (!video || !hero || !signature || !source) return;
    let inView = false;
    let failed = false;
    let playPending = false;
    let revision = 0;
    const canPlay = () => !motion.matches && !document.hidden && inView && !failed;
    function showPoster() { signature.classList.remove('is-playing'); }
    function fail() {
      failed = true;
      video.autoplay = false;
      video.pause();
      showPoster();
    }
    async function play() {
      if (playPending || !canPlay() || !video.paused) return;
      playPending = true;
      const requestedAt = revision;
      try {
        // No source is fetched without JS, or while reduced motion is requested.
        if (!source.getAttribute('src')) {
          source.src = source.dataset.src;
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
      video.autoplay = canPlay();
      if (canPlay()) play();
      else { video.pause(); showPoster(); }
    }
    video.addEventListener('playing', () => {
      if (canPlay()) signature.classList.add('is-playing');
      else { video.pause(); showPoster(); }
    });
    video.addEventListener('pause', showPoster);
    video.addEventListener('error', fail);
    source.addEventListener('error', fail);
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
        observer.unobserve(entry.target);
      });
    }, { threshold: .15 });
    // Avoid stacking a parent reveal over the three-line signature animation.
    document.querySelectorAll('.reveal').forEach(element => {
      if (!element.closest('.impact')) observer.observe(element);
    });
    if (impact) observer.observe(impact);
  });
})();
