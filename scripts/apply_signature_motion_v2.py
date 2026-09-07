from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')

marker = 'id="signature-motion-v2"'
if marker in s:
    raise SystemExit('Signature Motion V2 já aplicado')

css = r'''
<style id="signature-motion-v2">
:root{--signature-ease:cubic-bezier(.22,1,.36,1)}

/* Cards: entrada premium, stagger e linha dourada de assinatura */
.area,.principle,.insight,.faq-item{position:relative;overflow:hidden}
.motion-ready .area.reveal,
.motion-ready .principle.reveal,
.motion-ready .insight.reveal,
.motion-ready .faq-item.reveal{
  opacity:0;
  transform:translate3d(0,26px,0) scale(.985);
  filter:blur(7px);
  transition:
    opacity .72s var(--signature-ease),
    transform .72s var(--signature-ease),
    filter .72s var(--signature-ease),
    box-shadow .3s ease,
    border-color .3s ease;
  transition-delay:var(--card-delay,0ms)
}
.motion-ready .area.reveal.on,
.motion-ready .principle.reveal.on,
.motion-ready .insight.reveal.on,
.motion-ready .faq-item.reveal.on{
  opacity:1;
  transform:translate3d(0,0,0) scale(1);
  filter:blur(0)
}

.area::before,.principle::before,.insight::before,.faq-item::before{
  content:"";
  position:absolute;
  z-index:3;
  left:0;top:0;
  width:100%;height:1px;
  pointer-events:none;
  background:linear-gradient(90deg,transparent 0%,rgba(198,166,106,.4) 15%,var(--gold2) 52%,rgba(198,166,106,.35) 86%,transparent 100%);
  transform:scaleX(0);
  transform-origin:left center;
  transition:transform .9s var(--signature-ease)
}
.motion-ready .area.on::before,
.motion-ready .principle.on::before,
.motion-ready .insight.on::before,
.motion-ready .faq-item.on::before{transform:scaleX(1)}

.areas-stack .area:nth-child(1){--card-delay:0ms}.areas-stack .area:nth-child(2){--card-delay:80ms}.areas-stack .area:nth-child(3){--card-delay:160ms}.areas-stack .area:nth-child(4){--card-delay:240ms}
.principles-grid .principle:nth-child(1){--card-delay:0ms}.principles-grid .principle:nth-child(2){--card-delay:70ms}.principles-grid .principle:nth-child(3){--card-delay:140ms}.principles-grid .principle:nth-child(4){--card-delay:210ms}.principles-grid .principle:nth-child(5){--card-delay:280ms}
.insights-grid .insight:nth-child(1){--card-delay:0ms}.insights-grid .insight:nth-child(2){--card-delay:90ms}.insights-grid .insight:nth-child(3){--card-delay:180ms}
.faq-list .faq-item:nth-child(1){--card-delay:0ms}.faq-list .faq-item:nth-child(2){--card-delay:55ms}.faq-list .faq-item:nth-child(3){--card-delay:110ms}.faq-list .faq-item:nth-child(4){--card-delay:165ms}.faq-list .faq-item:nth-child(5){--card-delay:220ms}.faq-list .faq-item:nth-child(6){--card-delay:275ms}

@media (hover:hover) and (pointer:fine){
  .principle,.insight,.faq-item{transition:transform .3s var(--signature-ease),box-shadow .3s ease,border-color .3s ease}
  .principle:hover,.insight:hover,.faq-item:hover{transform:translateY(-4px);border-color:rgba(198,166,106,.4);box-shadow:0 20px 48px rgba(36,19,13,.1)}
}

/* Frase de impacto: três atos — compreender, orientar, conduzir */
.impact blockquote{position:relative;padding-bottom:27px}
.impact blockquote::after{
  content:"";
  position:absolute;
  left:50%;bottom:0;
  width:min(210px,40vw);height:1px;
  background:linear-gradient(90deg,transparent,var(--gold2),transparent);
  transform:translateX(-50%) scaleX(0);
  transform-origin:center;
  opacity:.8
}
.motion-ready .impact .reveal.on blockquote::after{animation:impactRule .95s var(--signature-ease) .66s forwards}
.motion-ready .impact .reveal.on blockquote span{
  opacity:0;
  transform:translate3d(0,30px,0);
  filter:blur(9px);
  animation:impactLine .92s var(--signature-ease) forwards
}
.motion-ready .impact .reveal.on blockquote span:nth-child(1){animation-delay:.05s}
.motion-ready .impact .reveal.on blockquote span:nth-child(2){animation-delay:.2s}
.motion-ready .impact .reveal.on blockquote span:nth-child(3){animation-delay:.35s}
.motion-ready .impact .reveal.on>p{
  opacity:0;
  transform:translateY(12px);
  letter-spacing:.24em;
  animation:impactCaption .72s var(--signature-ease) .68s forwards
}
@keyframes impactLine{to{opacity:1;transform:translate3d(0,0,0);filter:blur(0)}}
@keyframes impactRule{to{transform:translateX(-50%) scaleX(1)}}
@keyframes impactCaption{to{opacity:1;transform:translateY(0);letter-spacing:.15em}}

@media(max-width:850px){
  .motion-ready .area.reveal,.motion-ready .principle.reveal,.motion-ready .insight.reveal,.motion-ready .faq-item.reveal{transform:translate3d(0,18px,0) scale(.99);filter:blur(5px)}
  .motion-ready .area.reveal.on,.motion-ready .principle.reveal.on,.motion-ready .insight.reveal.on,.motion-ready .faq-item.reveal.on{transform:none;filter:none}
  .impact blockquote{padding-bottom:22px}
}

@media(prefers-reduced-motion:reduce){
  .motion-ready .area.reveal,.motion-ready .principle.reveal,.motion-ready .insight.reveal,.motion-ready .faq-item.reveal,
  .motion-ready .area.reveal.on,.motion-ready .principle.reveal.on,.motion-ready .insight.reveal.on,.motion-ready .faq-item.reveal.on,
  .motion-ready .impact .reveal.on blockquote span,.motion-ready .impact .reveal.on>p{
    opacity:1!important;transform:none!important;filter:none!important;animation:none!important;transition:none!important
  }
  .area::before,.principle::before,.insight::before,.faq-item::before,.impact blockquote::after{display:none!important}
}
</style>
'''

if '</head>' not in s:
    raise SystemExit('</head> não encontrado')
s = s.replace('</head>', css + '\n</head>', 1)
p.write_text(s, encoding='utf-8')
