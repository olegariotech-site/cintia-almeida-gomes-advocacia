"""Responsive derivatives and verbatim local Google Fonts Latin faces; originals untouched."""
from pathlib import Path
import hashlib,json,re,urllib.request
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
CSS_URL='https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Inter:wght@400;500;600;700&display=swap'
UA='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
font_css=urllib.request.urlopen(urllib.request.Request(CSS_URL,headers={'User-Agent':UA}),timeout=30).read().decode()
manifest={'photos':[],'fonts':[],'licenses':[]}
for source,prefix,widths in [('assetsdra-cintia-hero.png','cintia-hero',[540,810,1086]),('assetsdra-cintia-sobre.jpeg','cintia-sobre',[540,810,1122])]:
 image=Image.open(ROOT/source).convert('RGB')
 for width in widths:
  target=ROOT/f'assets/media/{prefix}-{width}.webp'
  image.resize((width,round(image.height*width/image.width)),Image.Resampling.LANCZOS).save(target,'WEBP',quality=90,method=6)
  manifest['photos'].append({'source':source,'path':str(target.relative_to(ROOT)),'width':width,'height':Image.open(target).height,'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'quality':90,'resampling':'Lanczos','note':'responsive derivative, no retouch; original preserved'})
font_groups={}
for block in re.findall(r'/\* latin \*/\s*@font-face\s*\{([^}]+)\}',font_css):
 family=re.search(r"font-family: '([^']+)'",block)[1];style=re.search(r'font-style: (\w+)',block)[1];weight=int(re.search(r'font-weight: (\d+)',block)[1]);url=re.search(r'url\(([^)]+)\)',block)[1]
 key=(family,style);group=font_groups.setdefault(key,{'source':url,'weights':[]});assert group['source']==url
 group['weights'].append(weight)
for (family,style),group in font_groups.items():
 raw=urllib.request.urlopen(group['source'],timeout=30).read();assert raw[:4]==b'wOF2'
 name=f"{family.lower().replace(' ','-')}-{style}.woff2";target=ROOT/'assets/fonts'/name;target.write_bytes(raw)
 manifest['fonts'].append({'family':family,'style':style,'weights':group['weights'],'source':group['source'],'path':str(target.relative_to(ROOT)),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest(),'coverage':'Google Fonts Latin face, served verbatim locally; Portuguese accents included'})
for family,folder in [('Cormorant Garamond','cormorantgaramond'),('Inter','inter')]:
 url=f'https://raw.githubusercontent.com/google/fonts/main/ofl/{folder}/OFL.txt';raw=urllib.request.urlopen(url,timeout=30).read();target=ROOT/f'assets/fonts/{folder}-OFL.txt';target.write_bytes(raw);manifest['licenses'].append({'family':family,'source':url,'path':str(target.relative_to(ROOT))})
(ROOT/'docs/qa-v5/asset-provenance.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'photo_bytes':sum(x['bytes'] for x in manifest['photos']),'font_bytes':sum(x['bytes'] for x in manifest['fonts']),'photos':manifest['photos'],'fonts':[(x['path'],x['bytes']) for x in manifest['fonts']]},indent=2))
