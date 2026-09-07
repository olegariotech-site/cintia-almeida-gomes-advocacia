from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')
old='''@media (hover:hover) and (pointer:fine){\n  .principle,.insight,.faq-item{transition:transform .3s var(--signature-ease),box-shadow .3s ease,border-color .3s ease}\n  .principle:hover,.insight:hover,.faq-item:hover{transform:translateY(-4px);border-color:rgba(198,166,106,.4);box-shadow:0 20px 48px rgba(36,19,13,.1)}\n}'''
new='''@media (hover:hover) and (pointer:fine){\n  .principle,.insight,.faq-item{transition:transform .3s var(--signature-ease),box-shadow .3s ease,border-color .3s ease}\n  .motion-ready .area.reveal.on:hover{transform:translateY(-5px) scale(1);transition-delay:0ms;border-color:rgba(198,166,106,.42);box-shadow:0 25px 65px rgba(36,19,13,.12)}\n  .motion-ready .principle.reveal.on:hover,.motion-ready .insight.reveal.on:hover,.motion-ready .faq-item.reveal.on:hover{transform:translateY(-4px) scale(1);transition-delay:0ms;border-color:rgba(198,166,106,.4);box-shadow:0 20px 48px rgba(36,19,13,.1)}\n}'''
if old not in s: raise SystemExit('Bloco de hover esperado não encontrado')
s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')
