# Cíntia V5 — revisão final e comparação com V4

Revisão de 12/11/2026, retomada do [checkpoint do PR #17](https://github.com/olegariotech-site/cintia-almeida-gomes-advocacia/pull/17#issuecomment-6836444747). A implementação existente foi preservada.

## Parecer

**GO técnico, com ressalva de desempenho, para avaliação final da direção OT. NO-GO para publicação neste momento:** faltam homologação em Edge/Windows, Android e iPhone físicos e autorização expressa para merge/publicação. O PR permanece em draft. A revisão automatizada e visual não substitui essas validações.

- V4 de comparação: `8ff0e64088696e6c7b815c10282d3fc1b8b41cd1`.
- Aplicação V5 revisada: `65e2506772faad1983d6ca5c40fc423354678328`.
- Revisão de QA: `faf3e35fdebc9984b427b4504a21bfff33dbc678`; altera somente `tests/v5-experience.mjs`. Os arquivos entregues ao visitante são idênticos aos de `65e2506`.
- Esta retomada não altera layout, textos, mídia, fontes, lógica de contato ou controlador de vídeo. Não houve merge, deploy ou alteração da `main`.

## Ambiente e fluxo verificado

Playwright em GitHub Actions/Ubuntu 24.04; Chromium 157.0.8103.50 e WebKit 26.0 na execução original. Browser plugin indisponível. Uma tentativa local de Chromium nesta retomada também terminou em `socket() failed: Operation not permitted`; as provas de renderização são dos runners, e não de um navegador local que não chegou a abrir.

Fluxo: abrir → ler HERO → consultar uma área → acionar explicitamente atendimento → manter nome/resumo preenchidos e selecionar a área → compor o destino WhatsApp oficial. Abrir um acordeão não seleciona assunto nem abre WhatsApp. Os destinos externos foram interceptados; nenhuma mensagem foi enviada.

| Verificação | Resultado da execução original #43306039990 |
|---|---|
| Identidade/URL/title, H1 único, conteúdo significativo e ausência de página vazia | PASS nos dois motores |
| Carregamento sem erros de JS, avisos de console ou assets locais com HTTP ≥400 | PASS nos 36 cenários V4/V5 |
| HERO, ordem dos textos, foto/legenda, overflow e fontes | PASS; nove resoluções por versão e motor |
| Área → formulário por Enter, preservação de dados e destino oficial | PASS; quatro áreas por motor |
| Contato nativo sem JavaScript | PASS; GET somente com `text`, acentos e símbolos preservados |
| Movimento reduzido | PASS; zero solicitações de MP4 e zero animações no estado observado |
| Reflow equivalente a 200% | PASS; 683×384 CSS/DPR 2, menu, Escape e foco; não é zoom do sistema operacional |
| Conteúdo antes de foto/fontes/vídeo lentos | PASS; título e CTA presentes enquanto as fontes ainda carregavam |
| Vídeos de navegação desktop/mobile e FAQ/contato estáveis | PASS; execução de foto/filete/pilares e etapas observada |
| Total da suíte V5 | **47 PASS; zero FAIL/BLOCKED** |

Resoluções: 1920×1080, 1366×768, 1280×720, 1024×768, 768×1024, 390×844, 375×812, 320×740 e 844×390. Em paisagem baixa há rolagem vertical; a prova de CTA dentro da primeira dobra aplica-se aos tamanhos indicados no teste, não a toda resolução.

As suítes anteriores também passaram no mesmo código: [V4 #43306040351](https://github.com/olegariotech-site/cintia-almeida-gomes-advocacia/actions/runs/43306040351), com 60 verificações finais e nove cenários Chromium, e [hotfix HERO #43306040648](https://github.com/olegariotech-site/cintia-almeida-gomes-advocacia/actions/runs/43306040648). Cobrem menu/teclado, acordeões, validação/retry, cookies, 404, vídeo/fallback e axe. Nos seis relatórios Lighthouse originais, acessibilidade, boas práticas e SEO obtiveram 100; isso não constitui certificação de acessibilidade ou teste com leitor de tela real.

## Inspeção visual e movimento

Foram comparados os HEROs V4/V5 nos nove tamanhos e nos dois motores, páginas inteiras em notebook/mobile, primeira visita com consentimento, no-JS, reflow e as capturas das seções. Os dois WebM foram decodificados a 5 quadros/s para inspeção ao longo de toda a gravação: desktop 1366×768/9,80 s; mobile 390×844/9,72 s. Essa amostragem e os eventos de animação comprovam estados e sequência; não medem FPS nem fluidez em hardware real.

| Elemento | Evidência e decisão |
|---|---|
| HERO | Hierarquia e composição V4 preservadas; fotografia real e legenda sem cauda vazia. Título/CTA não aguardam mídia. Enquadramento finito e filete dourado observados. |
| Recorte oblíquo experimental | Capturas `*-oblique-trial.png` comparadas. Manter a borda reta: o ensaio não demonstrou ganho de legibilidade ou hierarquia que justifique alterar a moldura aprovada. Decisão estética, não correção de defeito. |
| Sobre/áreas | Foto responsiva e texto com ordem preservada. CTA contextual está junto à área e exige ação explícita. |
| Pilares | Entrada sequencial observada nas capturas de seção e nos quadros dos vídeos; conteúdo legível durante a entrada, sem depender de hover. |
| Etapas | Linha nativa no desktop; linha estática no mobile (`animationTimeline: auto`), quatro etapas presentes. Rolagem permanece nativa. |
| FAQ/contato | Eventos/estados finais sem animação de entrada; controles e texto estáveis. |

### Pendência de evidência corrigida

As primeiras capturas `chromium-*-v5-full.png` omitiam o texto dos pilares abaixo da dobra, enquanto as capturas de seção, o vídeo de navegação e o WebKit o exibiam. Essas capturas longas isoladas não serviam como prova de integridade do bloco. A inspeção do CSS confirmou conteúdo visível por padrão, mas não foi usada sozinha para descartar a divergência.

O commit `faf3e35` ajusta a coleta: percorre as seções no viewport, volta ao início, aguarda o fim das entradas e captura a leitura completa com animações finitas concluídas. Acrescenta capturas e asserções dos três pilares sem JS e com movimento reduzido, em ambos os motores. As gravações reais de movimento continuam com animações habilitadas, em contextos separados. Nenhuma alteração no site foi feita para mascarar a captura.

**Confirmação concluída:** [run #43311734719 — SUCCESS](https://github.com/olegariotech-site/cintia-almeida-gomes-advocacia/actions/runs/43311734719), **47/47 PASS**, zero FAIL/BLOCKED. As novas capturas longas Chromium notebook/mobile exibem os três pilares; as quatro capturas sem JS/reduced motion (Chromium e WebKit) também foram inspecionadas, com opacidade 1 e visibilidade `visible` para os três textos. A divergência de captura está encerrada; nenhum defeito de ocultação foi reproduzido no fluxo real. [Resumo da confirmação](qa-v5/experience-summary-43311734719.json) · [integridade](qa-v5/integrity-run-43311734719.json) · [capturas/vídeos](https://github.com/olegariotech-site/cintia-almeida-gomes-advocacia/actions/runs/43311734719/artifacts/13987090901). Os workflows [V4 #43311734746](https://github.com/olegariotech-site/cintia-almeida-gomes-advocacia/actions/runs/43311734746) e [HERO #43311734880](https://github.com/olegariotech-site/cintia-almeida-gomes-advocacia/actions/runs/43311734880) também terminaram com SUCCESS no mesmo commit.

## Desempenho V4 × V5

Fonte primária: [run #43306039990](https://github.com/olegariotech-site/cintia-almeida-gomes-advocacia/actions/runs/43306039990), três execuções frias alternadas por versão no mesmo runner, Lighthouse 13.6.0, 390×844/DPR 1, simulação móvel, RTT 150 ms, throughput 1638,4 Kbps e CPU 4×. As configurações completas, os seis resultados e os intervalos estão em [JSON versionado](qa-v5/performance-run-43306039990.json).

| Mediana (mínimo–máximo) | V4 | V5 | Leitura |
|---|---:|---:|---|
| Performance | 75 (64–75) | 91 (91–91) | +16 pontos |
| LCP | 11,706 s (11,705–11,706) | 3,529 s (3,528–3,532) | redução de 69,9% neste ensaio |
| CLS | 0 (0–0,127223) | 0 (0–0) | V5 estável nas três rodadas; medianas iguais |
| TBT | 0 ms (0–278,656) | 15 ms (14–16) | +15 ms na mediana; dentro do gate, sem alegar redução |
| FCP | 1,537 s (1,536–1,538) | 1,353 s (1,352–1,355) | redução de 12,0% |
| Transferência | 2.960.132 bytes | 1.181.022 bytes | redução de 60,1%; MB decimal 2,96 → 1,18 |

Os quatro [gates registrados](qa-v5/performance-gates-43306039990.json) passaram: LCP ≤105% da base; CLS ≤base+0,02; TBT ≤máximo de 200 ms ou base+50 ms; transferência ≤102% da base. São gates de regressão, não metas absolutas de velocidade.

A primeira rodada V4 teve benchmark de CPU 1615,5 versus aproximadamente 2480–2498 nas outras, além de CLS/TBT maiores. Por isso foram mantidos os valores individuais e usados intervalos/medianas, sem selecionar só a pior rodada V4. O LCP V4 permaneceu aproximadamente 11,706 s nas três, e o V5 aproximadamente 3,53 s nas três. Não há medição de campo, INP, rede de cliente ou CDN de produção; TBT não é INP.

### Interpretação e ressalva

Os relatórios de rede mostram a foto HERO transferida em aproximadamente 1.633.885 bytes na V4 e 81.199 bytes na V5 móvel; a foto Sobre passa de 294.680 para 60.139 bytes. A V4 faz quatro solicitações de CSS/fontes a domínios Google, e a V5 não faz solicitações de terceiros nesse carregamento. O MP4 original permanece com 703.573 bytes nas duas versões. A redução de fotos e a descoberta local das fontes são compatíveis com o ganho observado; o ensaio conjunto não isola a contribuição causal de cada mudança.

**Ressalva média, não bloqueadora do aceite técnico:** LCP de 3,53 s ainda supera o alvo de 2,5 s citado no contrato. Os relatórios identificam a assinatura/poster como candidato a LCP e CSS bloqueante. Próxima otimização deve medir descoberta/prioridade do poster e a cadeia de CSS, preservando assinatura/controlador, em missão específica. Cache/compressão de produção não podem ser julgados pelos avisos de um servidor Python local. O contrato não exige atingir 2,5 s para esta candidata; não há justificativa para redesenhar o HERO ou remover o vídeo nesta revisão.

Confirmação independente no [run #43311734719](https://github.com/olegariotech-site/cintia-almeida-gomes-advocacia/actions/runs/43311734719), mesma aplicação e mais três medições por versão: V4/V5 com medianas de performance **70/91**, LCP **11,705/3,531 s**, CLS **0,127223/0**, TBT **0/7 ms** e transferência **2.960.132/1.181.022 bytes**. Os quatro gates passaram novamente. A V4 variou de 47 a 75 pontos e teve uma rodada com TBT de 1074,423 ms; a V5 manteve 91/91/91. Isso reforça a redução de LCP/bytes e a estabilidade observada da candidata, sem transformar a oscilação da base em promessa de ganho de score em produção. [Medições completas da confirmação](qa-v5/performance-run-43311734719.json) · [gates](qa-v5/performance-gates-43311734719.json) · [JSON/HTML completos](https://github.com/olegariotech-site/cintia-almeida-gomes-advocacia/actions/runs/43311734719/artifacts/13986941340).

## Integridade e rastreabilidade

O [relatório de integridade](qa-v5/integrity-run-43306039990.json) confirma igualdade de texto aprovado, title, metadados, canonical, JSON-LD, destinos anteriores, fotos originais, logotipo, MP4/poster, robots/sitemap/CNAME/404 e controlador do vídeo. As adições funcionais continuam limitadas aos links contextuais e ao campo nativo de mensagem.

- [Resumo dos 47 cenários originais](qa-v5/experience-summary-43306039990.json).
- [Manifesto de arquivos/hashes e IDs dos artefatos](qa-v5/evidence-manifest.json).
- [Capturas e vídeos originais](https://github.com/olegariotech-site/cintia-almeida-gomes-advocacia/actions/runs/43306039990/artifacts/13983553146).
- [Seis relatórios Lighthouse JSON/HTML originais](https://github.com/olegariotech-site/cintia-almeida-gomes-advocacia/actions/runs/43306039990/artifacts/13983467722).
- Artefatos originais com retenção até 10/02/2027; as medições e o manifesto ficam versionados. O manifesto permite conferir os bytes, mas não substitui o arquivo após sua expiração.

Comandos de revisão: `node --check tests/v5-experience.mjs`, `node tests/v4-smoke.mjs`, `git diff --check`; inspeção dos JSON/HTML de CI; decodificação dos WebM por ffmpeg; hashes SHA-256 confrontados com os digests retornados pelo GitHub. A nova suíte é executada no runner porque o navegador local está bloqueado.

## Gate restante para publicação

Responsável: direção OT. Validar esta mesma aplicação em **Edge/Windows, Chrome Android e Safari iPhone reais**, registrando modelo/SO/navegador/commit/data e resultado. O checklist concentra as lacunas que emulação não cobre:

1. HERO e rolagem em retrato/paisagem; vídeo inline/silencioso ou poster em autoplay bloqueado, economia de energia e movimento reduzido.
2. Menu, âncoras, áreas/FAQ, retorno de foco e zoom real; teclado virtual e controles de toque sem cobertura pelo botão flutuante.
3. Área → formulário, dados preservados, validação e composição/retry do WhatsApp sem enviar mensagem de teste à cliente.
4. Recusa, reabertura, aceite e revogação de consentimento; VoiceOver/TalkBack conforme disponibilidade.

Critério: nenhum defeito funcional/visual bloqueador nesses fluxos, registro do resultado e decisão OT sobre a ressalva de desempenho. **Autorização expressa da direção OT continua necessária antes de merge/publicação.** Este parecer não concede essa autorização.
