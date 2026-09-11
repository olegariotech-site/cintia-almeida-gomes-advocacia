from pathlib import Path

path = Path('index.html')
html = path.read_text(encoding='utf-8')
old = 'https://olegariotech-site.github.io/cintia-almeida-gomes-advocacia/'
new = 'https://cintiaalmeidaadvocacia.com.br/'
count = html.count(old)
if count < 2:
    raise SystemExit(f'Unexpected old-domain occurrence count: {count}')
html = html.replace(old, new)
path.write_text(html, encoding='utf-8')
print(f'Replaced {count} old-domain references')
