from pathlib import Path

p = Path('styles.css')
s = p.read_text(encoding='utf-8')
marker = '/* HIPASIA FINAL HERO EXPERIENCE */'
if marker in s:
    raise SystemExit('override already present')

override = r'''

/* HIPASIA FINAL HERO EXPERIENCE */
/* Assinatura volta a ser uma camada viva do hero, deslocada para a esquerda e sem disputar espaço com o retrato. */
.hero {
  position: relative;
  overflow: hidden;
  isolation: isolate;
}
.hero-grid {
  position: relative;
  z-index: 2;
  grid-template-areas: "copy portrait";
  grid-template-rows: auto;
  row-gap: 0;
}
.hero-copy {
  position: relative;
  z-index: 3;
  text-shadow: 0 2px 20px rgba(19, 9, 6, .28);
}
.hero-card {
  position: relative;
  z-index: 4;
}
.hero-signature {
  position: absolute;
  z-index: 1;
  left: -56px;
  bottom: -18px;
  width: min(760px, 68%);
  display: block;
  opacity: .72;
  pointer-events: auto;
}
.hero-video {
  display: block;
  width: 100%;
  max-width: none;
  height: auto;
  aspect-ratio: 16 / 9;
  object-fit: contain;
  object-position: left center;
  background: transparent;
  filter: brightness(.82) contrast(1.06) saturate(.92);
  -webkit-mask-image: linear-gradient(90deg, #000 0%, #000 78%, transparent 100%);
  mask-image: linear-gradient(90deg, #000 0%, #000 78%, transparent 100%);
  pointer-events: none;
}
.video-toggle {
  position: absolute;
  left: 56px;
  bottom: 8px;
  z-index: 2;
  min-height: 32px;
  width: auto;
  padding: 6px 9px;
  border: 1px solid rgba(231, 215, 170, .28);
  background: rgba(19, 9, 6, .46);
  color: rgba(231, 215, 170, .82);
  font-size: 10px;
  line-height: 1;
  text-align: left;
  text-decoration: none;
  opacity: .76;
}
.video-toggle:hover {
  opacity: 1;
  color: var(--ivory);
  border-color: rgba(231, 215, 170, .62);
}

/* Hover premium mais perceptível: clicáveis têm resposta clara; informativos ganham profundidade sem parecer botão. */
.area,
.faq-item,
.principle,
.meta > div,
.insight,
.step {
  position: relative;
}
.area,
.faq-item {
  overflow: hidden;
}
.area::before,
.faq-item::before {
  content: "";
  position: absolute;
  z-index: 2;
  inset: 0 0 auto;
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, var(--gold) 24%, var(--gold2) 52%, var(--gold) 78%, transparent 100%);
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform .42s var(--ease);
  pointer-events: none;
}
.area summary,
.faq-item summary,
.area-open,
.answer {
  position: relative;
  z-index: 3;
}
.disclosure-icon {
  transition: transform .24s var(--ease), background-color .24s ease, border-color .24s ease;
}
.principle b,
.insight h3,
.step h3,
.meta b {
  transition: transform .26s var(--ease), color .26s ease;
}

@media (hover: hover) and (pointer: fine) {
  .area,
  .faq-item,
  .principle,
  .meta > div,
  .insight,
  .step {
    transition:
      transform .28s var(--ease),
      box-shadow .28s ease,
      border-color .28s ease,
      background-color .28s ease;
  }
  .area:hover,
  .faq-item:hover {
    transform: translateY(-6px) scale(1.004);
    border-color: var(--gold-ink);
    box-shadow: 0 18px 46px rgba(36, 19, 13, .14);
  }
  .area:hover::before,
  .faq-item:hover::before {
    transform: scaleX(1);
  }
  .area:hover .disclosure-icon,
  .faq-item:hover .disclosure-icon {
    transform: scale(1.1);
    border-color: var(--gold-ink);
    background: rgba(198, 166, 106, .12);
  }
  .principle:hover,
  .meta > div:hover,
  .insight:hover,
  .step:hover {
    transform: translateY(-3px);
    border-color: rgba(119, 83, 38, .62);
    background-color: #fbf4ea;
    box-shadow: 0 12px 30px rgba(36, 19, 13, .09);
  }
  .principle:hover b,
  .insight:hover h3,
  .step:hover h3,
  .meta > div:hover b {
    transform: translateX(3px);
    color: var(--mid);
  }
}

/* Notebook baixo: assinatura permanece inteira, mas ocupa menos área. */
@media (min-width: 901px) and (max-height: 800px) {
  .hero-grid {
    grid-template-areas: "copy portrait";
    row-gap: 0;
  }
  .hero-signature {
    left: -36px;
    bottom: -12px;
    width: min(640px, 62%);
    opacity: .68;
  }
  .hero-video {
    width: 100%;
    max-width: none;
  }
  .video-toggle {
    left: 36px;
    bottom: 5px;
  }
}

/* Mobile/tablet: assinatura continua como pano de fundo, sem virar um card separado. */
@media (max-width: 900px) {
  .hero-grid {
    position: relative;
    z-index: 2;
    max-width: 680px;
  }
  .hero-copy,
  .hero-card {
    position: relative;
    z-index: 4;
  }
  .hero-signature {
    position: absolute;
    z-index: 1;
    left: -18px;
    top: 33%;
    bottom: auto;
    width: calc(100% + 36px);
    max-width: none;
    opacity: .38;
  }
  .hero-video {
    width: 100%;
    max-width: none;
    object-position: left center;
    -webkit-mask-image: linear-gradient(90deg, #000 0%, #000 82%, transparent 100%);
    mask-image: linear-gradient(90deg, #000 0%, #000 82%, transparent 100%);
  }
  .video-toggle {
    display: none !important;
  }
}

@media (max-width: 480px) {
  .hero-signature {
    top: 36%;
    opacity: .32;
  }
}

@media (prefers-reduced-motion: reduce) {
  .area,
  .faq-item,
  .principle,
  .meta > div,
  .insight,
  .step,
  .disclosure-icon,
  .principle b,
  .insight h3,
  .step h3,
  .meta b {
    transition: none !important;
    transform: none !important;
  }
  .area::before,
  .faq-item::before {
    display: none !important;
  }
  .hero-signature {
    opacity: .48;
  }
}
'''

p.write_text(s + override, encoding='utf-8')
