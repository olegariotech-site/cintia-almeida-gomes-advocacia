# Cíntia Almeida Gomes Advocacia

Site institucional premium desenvolvido pela **Olegario Tech**.

## Arquitetura de publicação

Este projeto usa o **GitHub como fonte única de verdade e o GitHub Pages como ambiente de publicação**.

- Código e versionamento: GitHub
- Hospedagem: GitHub Pages
- Publicação: branch `main`, diretório raiz `/`
- Formulário de contato: JavaScript → WhatsApp
- Domínio personalizado: GitHub Pages + DNS do domínio `.com.br`

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

A fonte de verdade e o ambiente de publicação deste site são o GitHub e o GitHub Pages. Mudanças de infraestrutura devem ser deliberadas e documentadas antes de qualquer alteração no projeto.
