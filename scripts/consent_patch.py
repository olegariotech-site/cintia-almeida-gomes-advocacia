from pathlib import Path

index = Path('index.html')
styles = Path('styles.css')
script = Path('site.js')

html = index.read_text(encoding='utf-8')
css = styles.read_text(encoding='utf-8')
js = script.read_text(encoding='utf-8')

head_start = html.find('<!-- Google Tag Manager -->')
head_end = html.find('<!-- End Google Tag Manager -->', head_start)
if head_start == -1 or head_end == -1:
    raise SystemExit('GTM head block not found')
head_end += len('<!-- End Google Tag Manager -->')
html = html[:head_start] + html[head_end:].lstrip('\n')

body_start = html.find('<!-- Google Tag Manager (noscript) -->')
body_end = html.find('<!-- End Google Tag Manager (noscript) -->', body_start)
if body_start == -1 or body_end == -1:
    raise SystemExit('GTM noscript block not found')
body_end += len('<!-- End Google Tag Manager (noscript) -->')
html = html[:body_start] + html[body_end:].lstrip('\n')

banner = '''
<div class="cookie-banner" id="cookieBanner" role="dialog" aria-modal="false" aria-labelledby="cookieTitle" hidden>
  <div class="cookie-banner__inner">
    <div class="cookie-banner__copy">
      <strong id="cookieTitle">Cookies opcionais</strong>
      <p>Usamos cookies de medição para entender como o site é utilizado e melhorar a experiência. Você pode aceitar ou recusar.</p>
    </div>
    <div class="cookie-banner__actions">
      <button class="btn out" id="cookieReject" type="button">Recusar</button>
      <button class="btn gold" id="cookieAccept" type="button">Aceitar</button>
    </div>
  </div>
</div>
<button class="cookie-settings" id="cookieSettings" type="button" aria-label="Abrir preferências de cookies">Preferências de cookies</button>
'''
if 'id="cookieBanner"' not in html:
    html = html.replace('</body>', banner + '\n</body>', 1)

css_marker = '/* Cookie consent — optional analytics only after explicit acceptance. */'
if css_marker not in css:
    css += '''\n\n/* Cookie consent — optional analytics only after explicit acceptance. */
.cookie-banner[hidden]{display:none!important}
.cookie-banner{position:fixed;z-index:1000;left:20px;right:20px;bottom:20px;max-width:980px;margin:0 auto;background:#1a0d09;border:1px solid rgba(212,175,55,.45);box-shadow:0 18px 50px rgba(0,0,0,.35);border-radius:18px;color:#fff}
.cookie-banner__inner{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:20px 22px}
.cookie-banner__copy{max-width:640px}
.cookie-banner__copy strong{display:block;font-family:"Cormorant Garamond",serif;font-size:1.35rem;color:#f1d590;margin-bottom:4px}
.cookie-banner__copy p{margin:0;line-height:1.55;color:rgba(255,255,255,.88);font-size:.94rem}
.cookie-banner__actions{display:flex;gap:10px;flex:0 0 auto}
.cookie-banner__actions .btn{min-width:112px;justify-content:center}
.cookie-settings{position:fixed;z-index:900;left:14px;bottom:12px;border:1px solid rgba(212,175,55,.35);background:#1a0d09e8;color:#f1d590;border-radius:999px;padding:8px 12px;font:600 .76rem/1 Inter,sans-serif;cursor:pointer;box-shadow:0 8px 22px rgba(0,0,0,.2)}
.cookie-settings:hover,.cookie-settings:focus-visible{border-color:#d4af37;outline:none}
@media (max-width:700px){.cookie-banner{left:12px;right:12px;bottom:12px}.cookie-banner__inner{align-items:stretch;flex-direction:column;gap:16px;padding:18px}.cookie-banner__actions{width:100%}.cookie-banner__actions .btn{flex:1}.cookie-settings{left:10px;bottom:10px}}
'''

js_marker = 'Privacy-first analytics: GTM loads only after explicit cookie acceptance.'
if js_marker not in js:
    js += '''\n\n/* Privacy-first analytics: GTM loads only after explicit cookie acceptance. */
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
  const openBanner = () => { banner.hidden = false; };
  const closeBanner = () => { banner.hidden = true; };

  accept.addEventListener('click', () => {
    saveConsent('accepted');
    closeBanner();
    loadGTM();
  });
  reject.addEventListener('click', () => {
    saveConsent('rejected');
    closeBanner();
  });
  settings.addEventListener('click', openBanner);

  const current = readConsent();
  if (current === 'accepted') loadGTM();
  else if (current !== 'rejected') openBanner();
})();
'''

index.write_text(html, encoding='utf-8')
styles.write_text(css, encoding='utf-8')
script.write_text(js, encoding='utf-8')
