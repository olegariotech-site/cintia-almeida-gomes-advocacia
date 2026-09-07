# Cíntia Almeida Gomes Advocacia

Site institucional premium desenvolvido pela **Olegario Tech**.

## Arquitetura de publicação

Este projeto é **100% GitHub**.

- Código e versionamento: GitHub
- Hospedagem: GitHub Pages
- Publicação: branch `main`, diretório raiz `/`
- Formulário de contato: JavaScript → WhatsApp
- Domínio personalizado: GitHub Pages + DNS do domínio `.com.br`
- Netlify: **não utilizado**

## Estrutura de GitHub Pages

- `index.html` — aplicação/site principal
- `.nojekyll` — publicação estática direta, sem processamento Jekyll
- `robots.txt` — regras para mecanismos de busca
- `sitemap.xml` — sitemap do endereço publicado
- `404.html` — página de erro do GitHub Pages
- assets de imagem, vídeo e WhatsApp na raiz do projeto

## Domínio personalizado

O arquivo `CNAME` **não deve ser criado antes da definição e registro do domínio oficial**.

Quando o domínio `.com.br` estiver confirmado:

1. configurar o domínio personalizado no GitHub Pages;
2. criar `CNAME` com o domínio definitivo;
3. configurar DNS no registrador/provedor;
4. ativar HTTPS no GitHub Pages;
5. substituir as URLs provisórias `olegariotech-site.github.io/cintia-almeida-gomes-advocacia` em `index.html`, `robots.txt`, `sitemap.xml` e `404.html` pelo domínio oficial;
6. revisar `canonical`, Open Graph e compartilhamento social;
7. validar publicação, HTTPS, desktop e mobile.

## Regra OT

Não adicionar dependências de Netlify, Vercel, WordPress ou outros hosts a este projeto sem uma decisão explícita de arquitetura. A fonte de verdade e o ambiente de publicação deste site são o GitHub e o GitHub Pages.
