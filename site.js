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
    // With JS absent or unparseable, disabled fields + method=dialog cannot leak a GET URL.
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
    const button = document.getElementById('videoToggle');
    if (!video || !button) return;
    let manuallyPaused = motion.matches;
    let inView = true;
    let complete = false;
    let playPending = false;
    function syncButton() {
      button.textContent = video.paused ? (complete ? 'Rever assinatura' : 'Reproduzir assinatura') : 'Pausar assinatura';
    }
    function stop() { video.pause(); syncButton(); }
    async function play(explicit = false) {
      if (playPending || (!explicit && (motion.matches || manuallyPaused || complete || !inView || document.hidden))) return;
      playPending = true;
      try {
        await video.play();
        if (motion.matches || document.hidden || !inView || manuallyPaused) video.pause();
      } catch {
        // Low power mode, data saver or an unsupported video leaves a usable static poster.
        manuallyPaused = true;
      } finally { playPending = false; syncButton(); }
    }
    button.addEventListener('click', () => {
      if (video.paused) {
        if (complete) { video.currentTime = 0; complete = false; }
        manuallyPaused = false;
        play(true);
      } else { manuallyPaused = true; stop(); }
    });
    video.addEventListener('play', syncButton);
    video.addEventListener('pause', syncButton);
    video.addEventListener('ended', () => { complete = true; syncButton(); });
    video.addEventListener('error', () => {
      stop();
      button.hidden = true;
      video.parentElement.classList.remove('video-controls');
    });
    motion.addEventListener('change', () => {
      if (motion.matches) { manuallyPaused = true; stop(); }
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else play(); });
    button.hidden = motion.matches;
    video.parentElement.classList.toggle('video-controls', !motion.matches);
    motion.addEventListener('change', () => {
      button.hidden = motion.matches;
      video.parentElement.classList.toggle('video-controls', !motion.matches);
    });
    syncButton();
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        inView = entries[0].isIntersecting;
        if (inView) play(); else stop();
      }, { threshold: .2 });
      observer.observe(video);
    } else { play(); }
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
