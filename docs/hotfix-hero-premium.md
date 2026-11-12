# Cíntia V4 — hotfix premium do HERO · parecer final

**GO para revisão técnica e visual. NO-GO para merge/publicação nesta entrega.** O hotfix resolveu os defeitos P1 nos ambientes emulados, com inspeção das capturas. A direção OT ainda precisa autorizar qualquer publicação; Safari/iPhone, Android e Edge/Windows físicos não foram homologados nesta sessão. O LCP móvel permanece elevado, embora menor no comparativo final.

## Versão, escopo e proteção

- PR #16; branch exclusiva `hotfix/v4-hero-premium`.
- Base publicada confirmada: `aade965e7f3cce532b70fc131bc41c6b3bb21dca`.
- Aplicação final testada: `e78952c0807b1a4f6bbfcb8148691d7f0b806731`. Os commits posteriores de evidências/documentação não alteram a aplicação nem os testes.
- Backup V3 preservado em `backup/v3-antes-da-publicacao-v4-2026-11-12`, apontando para `7ddeed2fe15651d9e8573a9847d6c390abf2b5f0`.
- Nenhum merge, deploy, alteração de DNS, domínio, contatos, conteúdo jurídico, OAB, SEO ou configuração comercial.
- [Conferência de integridade](qa-hero/integrity.json): texto aprovado, destinos dos links e todo o `<head>` idênticos à base; hashes dos assets originais preservados.

## Mudança visível e decisão de composição

Público: visitante buscando atendimento jurídico. Ação dominante: solicitar atendimento. A V4 aprovada continua sendo a referência vinculante: espresso, marfim, dourado, Cormorant Garamond, Inter, foto e logotipo reais. Foram usados os padrões de clareza do HERO (P01), confiança editorial (P10) e atmosfera secundária (P14), sem importar identidade ou assets de outras marcas.

| Defeito / evidência anterior | Correção | Resultado inspecionado |
|---|---|---|
| HERO de aproximadamente 918 px em 1366×768; foto esticada por `height:100%`, `min-height` e crescimento flex | Espaçamento e escala ajustados por largura/altura disponível; foto proporcional e card sem esticamento | HERO de 547,7 px; CTA primário termina em y=495,7 px; título, apoio, áreas e CTA visíveis sem rolagem |
| Assinatura com `bottom:-90px`, parcialmente fora da seção | Posição proporcional dentro do HERO, escala e opacidade discretas | Enquadrada em todos os oito viewports testados |
| Legenda em bloco separado, prolongando o card | Legenda sobre a própria foto com degradê de contraste e filete editorial | Rosto preservado, sem emenda ou cauda vazia no card |
| Retrato PNG de 2.438.940 bytes | Alternativa WebP sem perdas de 1.633.694 bytes, dimensões intrínsecas e fallback PNG via `picture` | Pixels RGBA integralmente idênticos; redução de 33,0% no arquivo servido, sem recorte ou retoque do original |

Não foram adotados novos efeitos, sombras, fontes, arquitetura de página ou gráficos. Em mobile, a mensagem e os CTAs precedem a foto; em paisagem curta, a rolagem vertical é preservada para evitar comprimir ou cortar conteúdo. A inspeção visual das capturas confirmou hierarquia, legibilidade, enquadramento do rosto e fechamento da seção, além das asserções automáticas.

## Diagnóstico comprovado da assinatura

O arquivo original foi inspecionado com ffprobe e quadros em 1 s e 4 s: MP4 H.264, yuv420p, 1280×720, 24 fps, 8 s, 703.384 bytes. O símbolo/pena realmente se move. Vídeo e poster conservaram seus hashes.

O enquadramento CSS era um defeito confirmado. Separadamente, os eventos do navegador revelaram um ciclo de seleção de mídia no WebKit do runner: mais de 100 mil `loadstart` em poucos segundos, `readyState=0` e tempo parado. Um poster visível não era prova suficiente de um fallback saudável. [Diagnóstico anterior resumido](qa-hero/video-diagnostic-before-fix.json); a execução intermediária [reprovou o candidato](https://github.com/olegariotech-site/cintia-almeida-gomes-advocacia/actions/runs/43271921396) quando a nova asserção passou a detectar o ciclo.

O controlador agora atribui o MP4 diretamente a `video.src` apenas quando movimento/visibilidade permitem, com `muted` e `playsinline`. `play()` é o único responsável pela reprodução; não há autoplay nativo concorrente nem `<source>` sem `src` aguardando seleção. Falha de mídia/bloqueio libera a fonte e mantém o poster original. Uma proteção encerra reinícios anormais de carregamento. Nenhuma tentativa é feita com movimento reduzido ativo.

| Evidência final em 1366×768 | Chromium 157.0.8103.50 | WebKit 26.0 |
|---|---:|---:|
| `loadstart` observado antes das interações | 1 | 1 |
| `readyState` | 4 | 4 |
| Tempo inicial → posterior | 1,700 → 3,787 s | 1,689 → 3,999 s |
| Pausa fora do HERO / retomada ao voltar | PASS | PASS |
| Ativar movimento reduzido durante reprodução / reativar movimento | PASS | PASS |
| Autoplay negado e erro de mídia | Poster, sem comprometer contato | Poster, sem comprometer contato |

[Timeline Chromium](qa-hero/chromium-video-timeline.json) · [Timeline WebKit](qa-hero/webkit-video-timeline.json). A causa não foi atribuída genericamente à política de autoplay, nem comprovada no Edge físico usado pela direção: são observações e correções verificadas nos motores do runner.

## Homologação responsiva e funcional

Ambiente: GitHub Actions, Ubuntu 24.04, Node 22, Playwright 1.58.2, Chromium 157.0.8103.50 e WebKit 26.0. Browser plugin indisponível; Chromium local bloqueado por `socket() failed: Operation not permitted`. Foram usados snapshots servidos em localhost no CI. WebKit em Linux não equivale a Safari instalado em iPhone; nenhum aparelho físico foi usado.

Fluxo validado: abrir página → ler HERO → abrir/fechar menu → navegar a seções → operar áreas/FAQ por teclado → preencher formulário fictício → compor destino WhatsApp e fallback. O envio de mensagens foi interceptado; os testes de consentimento usam container simulado, sem enviar Analytics real.

| Viewport em ambos os motores | Layout / enquadramento / overflow | CTA primário: limite inferior em Chromium |
|---|---|---:|
| Desktop 1920×1080 | PASS | 589,9 px |
| Notebook 1366×768 | PASS | 495,7 px |
| Notebook compacto 1280×720 | PASS | 476,2 px |
| Tablet 768×1024 | PASS | 460,5 px |
| Android emulado 390×844 | PASS | 450,4 px |
| Largura iPhone / WebKit 375×812 | PASS | 446,2 px |
| Mobile estreito 320×740 | PASS | 485,4 px |
| Paisagem 844×390 | PASS; rolagem vertical necessária | 472,4 px |

| Verificação | Evidência final |
|---|---|
| Identidade, página não vazia, H1 e conteúdo | PASS |
| Console no comparativo final | Zero erros/avisos nos 16 carregamentos do hotfix; zero falhas de rede registradas |
| Título, apoio, áreas e CTA primário na dobra exigida | PASS em 1366×768 e 1280×720, nos dois motores |
| Imagem, legenda, assinatura, ausência de sobreposição/overflow | PASS automático + inspeção visual das capturas |
| Menu, Escape, destino e retorno de foco | PASS |
| Áreas e FAQ com Enter/Espaço | PASS |
| Formulário, validação, acentos/símbolos, link de retry e invalidação de mensagem antiga | PASS, com dados fictícios e sem envio |
| Foco visível, alvos de toque, movimento reduzido e ausência de JS | PASS |
| Axe WCAG A/AA em desktop/mobile, ambos os motores | Zero violações automáticas nos estados auditados |
| Cookies: recusa, aceite, preferências e revogação | PASS com container determinístico de teste |
| Reprodução, fallback e ciclo de visibilidade/preferências | PASS |

[Execução comparativa final](https://github.com/olegariotech-site/cintia-almeida-gomes-advocacia/actions/runs/43272868550): **36/36 cenários comparativos e de fallback**. [Execução funcional final](https://github.com/olegariotech-site/cintia-almeida-gomes-advocacia/actions/runs/43272868545): **60/60 verificações finais + 9/9 cenários da suíte de navegador + smoke Node**. Não são ensaios com VoiceOver/TalkBack ou aparelhos físicos.

Relatórios preservados: [layout/mídia](qa-hero/layout-media-report.json), [funcional/acessibilidade](qa-hero/functional-accessibility-report.json), [suíte adicional](qa-hero/browser-report.json).

## Desempenho antes/depois

Lighthouse 13.6.0; três execuções frias alternadas por versão, no mesmo runner, 390×844, DPR 1, simulação móvel, RTT 150 ms, throughput 1638,4 Kbps e CPU 4×. Base e candidato são os SHAs registrados acima. Os relatórios completos registram os demais parâmetros. Não foram medidos hospedagem pública, INP de campo ou aparelhos reais.

| Mediana (intervalo) | V4 publicada | Hotfix final |
|---|---:|---:|
| Performance | 75 (45–75) | 75 (75–75) |
| LCP | 15,757 s (15,756–15,758) | 11,706 s (11,705–11,707) |
| CLS | 0,00023 (0,00023–0,12746) | 0 (0–0) |
| TBT | 0 ms (0–1295) | 0 ms (0–0) |
| Transferência | 3.763.895 bytes | 2.960.133 bytes |

A mediana do LCP ficou 25,7% menor e a transferência caiu 803.762 bytes. Nenhuma das métricas comparadas piorou no candidato final. Isso é evidência do laboratório, não garantia de ganho equivalente em produção. Rodadas anteriores apresentaram CLS de 0,127 também no hotfix; não se atribui causalmente o CLS zero final a uma única alteração nem se declara o problema global resolvido.

O candidato a LCP identificado no hotfix foi `.hero-signature` (poster/fundo); na base também apareceu o próprio vídeo. Os relatórios mostram CSS e a folha externa de fontes no caminho bloqueante. A foto grande disputa transferência no carregamento inicial; sua versão sem perdas foi uma otimização justificada e verificada. O LCP de 11,7 s continua alto. Redimensionamento adicional de imagens, estratégia das fontes e poster/vídeo exigem medição própria antes de ampliar este hotfix. Não foram trocados assets originais para mascarar o resultado.

[Comparação detalhada](qa-hero/performance-comparison.json) · [Lighthouse JSON/HTML completo](https://github.com/olegariotech-site/cintia-almeida-gomes-advocacia/actions/runs/43272868550/artifacts/13968028796).

## Capturas e revisão visual

As imagens abaixo são screenshots originais do CI, sem retoque. Capturas de página inteira, primeira visita com cookies, demais resoluções e estados de fallback estão no [artefato completo](https://github.com/olegariotech-site/cintia-almeida-gomes-advocacia/actions/runs/43272868550/artifacts/13968388816), com retenção de 90 dias. Os comparativos selecionados e os JSON desta pasta ficam versionados no repositório.

| Ambiente | Antes | Depois |
|---|---|---|
| Desktop | [1920×1080](qa-hero/before-1920x1080.png) | [1920×1080](qa-hero/after-1920x1080.png) |
| Notebook | [1366×768](qa-hero/before-1366x768.png) | [1366×768](qa-hero/after-1366x768.png) |
| Mobile | [390×844](qa-hero/before-390x844.png) | [390×844](qa-hero/after-390x844.png) |
| WebKit | — | [375×812](qa-hero/webkit-375x812.png) |

## Próximo gate

A revisão do PR está pronta. Antes da publicação, registrar a decisão expressa da direção OT e a homologação em iPhone/Safari e Android reais: modelo, sistema, navegador, commit, retrato/paisagem, vídeo/poster, menu, teclado virtual, formulário sem envio e movimento reduzido. Conferir também no Edge/Windows usado para a avaliação original. O LCP elevado deve permanecer uma ressalva explícita de liberação ou receber uma intervenção de desempenho medida separadamente. Este parecer não autoriza merge ou deploy.
