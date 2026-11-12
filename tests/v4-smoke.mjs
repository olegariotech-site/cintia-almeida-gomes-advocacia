// V4 smoke checks. Run: node tests/v4-smoke.mjs
// Uses only Node built-ins; does not access external services or send messages.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const html = read('index.html');
const css = read('v4.css');
const js = read('site.js');

const mustContain = (text, expression, label) => {
  assert.match(text, expression, label);
};
const mayNotContain = (text, expression, label) => {
  assert.doesNotMatch(text, expression, label);
};
assert.match(html, /<html lang="pt-BR">/);
assert.match(html, /<body class="v4">/);
assert.match(html, /href="v4\.css"/);
assert.match(html, /id="hero-title"/);
assert.match(html, /class="hero-statement"/);
for (const id of ['main','hero','sobre','areas','atuacao','atendimento','conteudos','faq','contato','contactForm','signatureVideo','formFallback','cookieBanner','cookieAccept','cookieReject','cookieSettings']) {
  mustContain(html, new RegExp('id="' + id + '"'), 'Missing required id: ' + id);
}
for (const phrase of ['Direito de Família','Direito do Consumidor','Direito Civil','Direito Imobiliário','OAB/SP 541.172','cintiapalmeida@adv.oabsp.org.br']) {
  assert.ok(html.includes(phrase), 'Missing content: ' + phrase);
}
const old = /(?:5519996837596|5519998808725|99683-7596|99880-8725)/;
mayNotContain(html + js, old, 'Legacy phone number detected');
assert.ok((html.match(/https:\/\/wa\.me\/5519971432465/g) || []).length >= 4, 'Unexpected WhatsApp destination(s)');
mustContain(js, /https:\/\/wa\.me\/5519971432465\?text=/, 'Form must target new WhatsApp');
mustContain(html, /"telephone": "\+5519971432465"/, 'Structured data telephone not updated');
mustContain(html, /\(19\) 97143-2465/, 'Visible number missing');
for (const selector of ['.hero','.about','.areas','.principles','.process','.insights','.faq','.contact','.float']) {
  assert.ok(css.includes('body.v4 ' + selector), 'Missing V4 section: ' + selector);
}
for (const bp of ['1100px','1000px','900px','600px','380px']) {
  assert.ok(css.includes('max-width: ' + bp), 'Missing breakpoint: ' + bp);
}
mustContain(css, /prefers-reduced-motion: reduce/, 'Reduced-motion styles missing');
mustContain(css, /:focus-visible/, 'Keyboard focus styling missing');
mustContain(html, /<fieldset id="contactFields" disabled>/, 'Progressive enhancement of form lost');
assert.ok(!/\b(?:@import|url\(https?:\/\/)/.test(css), 'V4 stylesheet must not load new external resources');
const strip = css.replace(/\/\*[\s\S]*?\*\//g, '');
let depth = 0;
for (const ch of strip) {
  if (ch === '{') depth++;
  if (ch === '}') depth--;
  assert.ok(depth >= 0, 'Unbalanced CSS brace');
}
assert.equal(depth, 0, 'Unbalanced CSS braces');
console.log('V4 smoke checks: PASS (structure, contact, sections, CSS contracts)');
