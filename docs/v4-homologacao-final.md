# Cíntia Advocacia V4 — homologação final de 12/11/2026

Parecer de liberação: **NO-GO para publicação**. A homologação em iPhone Safari e Android físicos continua obrigatória, e a ressalva de estabilidade visual/desempenho móvel precisa ser resolvida ou formalmente avaliada pela direção. Não houve merge, publicação, mudança de DNS ou alteração da V3 em produção.

## Escopo e integridade

- Issue #15; PR #14, mantido em draft; branch `feat/cintia-v4-signature-editorial`.
- Candidato inicial: `4306b81a2b1a320d2b933aaee532131c50eb8cb8`.
- Candidato final testado: `4eab3d09e2ffca03a145b112859fd8f7613e91e4` — **60/60 verificações finais + 9 cenários Chromium + smoke aprovados**, execução #8. A aplicação é idêntica à de `c5f0a00`; a diferença posterior foi a estabilização da medição axe após animações.
- Base V3: `7ddeed2fe15651d9e8573a9847d6c390abf2b5f0`.
- O visual aprovado, textos jurídicos, OAB, endereço, telefone, e-mail, fotografias, vídeo e poster foram preservados.
- Comparação estática confirmou title, description, canonical, metadados OG/Twitter e JSON-LD idênticos à base (exceto o theme-color aprovado na V4). Mídias, robots e sitemap conservaram seus hashes.

## Ambiente e método

Browser plugin indisponível. O processo local de Chromium foi bloqueado por `socket() failed: Operation not permitted`; o ambiente também não tinha as bibliotecas necessárias ao WebKit. A validação executada utiliza GitHub Actions/Ubuntu 24.04, Node 22, Playwright 1.58.2, WebKit 26.0 e Chrome 156.0.8078.79. Não se trata de Safari instalado em iPhone.

Fluxo: abrir a página → renderizar HERO e conteúdo → navegar/menu → operar acordeões por Enter/Espaço → validar formulário → compor destino WhatsApp → conferir fallback quando popup é bloqueado. Dados fictícios e interceptação dos destinos impedem o envio de mensagens.

As capturas WebKit apresentaram timeouts ao aguardar `FontFaceSet.ready`. A bateria final registra o estado das fontes e captura a página sem essa espera interna do Playwright. Imagens lazy são verificadas após entrar no viewport. Essas diferenças do método não foram tratadas como defeitos de conteúdo nem usadas para mudar o visual aprovado.

A execução diagnóstica confirmou `document.fonts.status=loaded`, sem fontes em loading/error nos 12 cenários. A medição de foco usa uma tecla de navegação real; só pressionar Shift não ativava a heurística `:focus-visible` do WebKit. O contraste axe é auditado após finalizar animações de entrada finitas: uma leitura durante o fade gerou alerta transitório na execução #7, sem mudança de cor no produto para contornar o teste.

No runner, Chromium reproduziu a assinatura (`readyState=4`, tempo avançando). WebKit manteve `readyState=0`, sem quadros reproduzidos, com poster visível. Portanto, **fallback aprovado no WebKit; reprodução em Safari físico pendente**. Bloqueio de autoplay, erro de mídia, redução de movimento e ausência de JavaScript também preservaram o conteúdo e o contato.

## Defeitos reproduzidos e correções

| Registro | Gravidade | Reprodução e evidência | Correção na branch |
|---|---|---|---|
| QA-01 — revogação de medição | P2 | Aceitar → Preferências → Recusar. Inspeção confirmou que o código original só mudava localStorage, sem encerrar tags já executadas. O teste de navegador anterior foi bloqueado pela falha de foco anterior e não deve ser citado como prova de envio de Analytics real. | Recarregar após gravar a recusa quando GTM já foi carregado; teste determinístico antes/depois da revogação no candidato corrigido verifica que o marcador opcional para. |
| QA-02 — foco das preferências | P2 | Acionar Preferências por teclado não posicionava o foco nas escolhas; ao fechar, o controle focado podia ficar oculto. | Foco em Recusar ao reabrir; retorno às Preferências ao escolher. Sem roubar foco na primeira visita. |
| QA-03 — foco e alvo de toque | P2 | Capturas/JSON registraram alvo de Preferências com 30px e contraste do foco escuro sobre espresso de 2,83:1. | Alvo mínimo 44px; cor de foco contextual; halo de contraste nas Preferências. |
| QA-04 — retorno da página 404 | P2 | Voltar ao início apontava para `/cintia-almeida-gomes-advocacia/`, caminho inadequado ao domínio próprio configurado. | Link para `/`; retorno exercitado nos dois motores. |
| QA-05 — menu após Escape e novo clique | P2 | Abrir → Escape → reabrir → clicar Sobre. Nos dois motores o menu fechava antes de ativar o link: hash vazio e seção sem tabindex/foco mesmo após 2 segundos. | Fechar ao receber foco fora do cabeçalho (`focusin`), evitando a janela transitória de `focusout` em que activeElement ainda é body. |

Os testes de consentimento interceptam o carregamento do container e usam um marcador determinístico com temporizador para verificar o ciclo de vida, sem enviar Analytics real. Verificam ausência de solicitação GTM antes de consentir, recusa persistida, carregamento após aceite, persistência do aceite e interrupção após revogação. Não constituem auditoria da configuração privada do container GTM nem remoção retroativa de dados já enviados.

## Cobertura e critérios

| Verificação | Resultado observado |
|---|---|
| Identidade, H1 único, conteúdo presente e ausência de tela vazia | PASS nos dois motores |
| Erros de JavaScript no carregamento e respostas de assets locais | PASS; sem erros detectados |
| Overflow, imagens/alternativas e âncoras | PASS; 1440×900, 390×844, 375×812, 320×740, 844×390 e 768×1024 em ambos os motores |
| Menu, Escape, reabertura e destino/foco | PASS após QA-05 |
| Áreas/FAQ com Enter e Espaço | PASS |
| Formulário vazio, mensagem com acentos/símbolos, destino e retry | PASS; telefone oficial `5519971432465`, popup simulado como bloqueado |
| Link preparado invalidado após editar o formulário | PASS |
| Botão flutuante durante preenchimento | PASS; oculto no campo, volta ao sair |
| Foco visível e alvo das Preferências | PASS; 44px, foco contextual de 13,64:1 sobre espresso e 10,20:1 sobre o ponto claro do HERO |
| Axe WCAG 2 A/AA, 2.1 AA e 2.2 AA, desktop/mobile nos dois motores | PASS; zero violações automáticas no estado de leitura final |
| Recusa/aceite persistidos e revogação | PASS com container simulado; sem envio de medição real |
| Sem JS, redução de movimento, autoplay negado, erro de vídeo e storage indisponível | PASS |
| Vídeo Chromium / fallback WebKit | PASS para os estados observados; Safari físico não comprovado |
| Lighthouse móvel | ALERTA; LCP alto e CLS variável entre rodadas, sem causa isolada |
| Safari iPhone e Chrome Android físicos | BLOQUEADO por indisponibilidade de aparelhos; gate permanece aberto |

Esses resultados de acessibilidade são verificações automáticas e de teclado em navegador; não substituem ensaio com VoiceOver/TalkBack e dispositivos reais. Não houve testes com contas de clientes nem envio de contatos.

## Desempenho comparativo

Lighthouse 13.6.0; snapshots locais da V3/main e V4 no mesmo runner; três execuções frias por versão, alternadas; viewport 390×844, DPR 1; simulação móvel com RTT 150ms, throughput 1638,4 Kbps e CPU 4×. Relatórios JSON/HTML registram as demais configurações e a variação. **INP de campo não foi medido**; TBT é apenas medida de laboratório.

| Mediana (intervalo), candidato final `4eab3d0` | V3 | V4 |
|---|---:|---:|
| Performance | 69 (57–74) | 74 (74–74) |
| LCP simulado | 15,758 s (15,006–16,356) | 15,082 s (15,006–15,084) |
| CLS | 0,021 (0–0,147) | 0,00023 (0,00023–0,00023) |
| TBT | 0 ms (0–683) | 0 ms (0–68) |
| Transferência | 3.739.045 bytes | 3.763.892 bytes |

Histórico: na primeira rodada, a V3 teve LCP 16,506 s/CLS 0,153 e a V4 15,758 s/CLS 0,127. Na segunda, a V3 teve 15,307 s/0,023 e a V4 15,083 s/0,127. No candidato `c5f0a00`, a V3 teve 15,605 s/0,021 e a V4 15,755 s/0,127. A última rodada, sem mudar a aplicação, produziu CLS baixo na V4. **Não há evidência de ganho causal de desempenho, nem diagnóstico conclusivo de regressão da V4.** O LCP alto é comum às duas versões e o CLS oscilou entre rodadas. Isso permanece ressalva de liberação, não um PASS irrestrito de performance. Os relatórios identificam o fundo/poster de assinatura como candidato a LCP, imagem HERO de 2.438.940 bytes e CSS/fontes bloqueantes; isso não prova uma causa única. Não foram trocadas imagens nem removida a assinatura sem diagnóstico que justifique a alteração.

## Evidências antes/depois

- Antes, aplicação original V4 com bateria ampliada (`ddae6da`): [execução #3](https://github.com/olegariotech-site/cintia-almeida-gomes-advocacia/actions/runs/43251865679).
- Primeiras correções (`776f76d`): [execução #4](https://github.com/olegariotech-site/cintia-almeida-gomes-advocacia/actions/runs/43253096470). Consentimento, preferências e 404 aprovados em WebKit e Chromium. A bateria ainda apontava diferenças de foco/captura em investigação.
- Diagnóstico do menu (`4afd41a`): [execução #6](https://github.com/olegariotech-site/cintia-almeida-gomes-advocacia/actions/runs/43254537595). Registro do hash vazio e foco perdido após Escape/reabertura.
- Correção do menu (`c5f0a00`): [execução #7](https://github.com/olegariotech-site/cintia-almeida-gomes-advocacia/actions/runs/43255314263). 59 PASS; único alerta durante o fade de entrada de texto.
- **Final (`4eab3d0`): [execução #8 — PASS](https://github.com/olegariotech-site/cintia-almeida-gomes-advocacia/actions/runs/43256129708)**. 60 PASS, zero FAIL/BLOCKED na suíte final; 9 cenários Chromium originais e smoke também passaram.
- [Capturas e JSON final](https://github.com/olegariotech-site/cintia-almeida-gomes-advocacia/actions/runs/43256129708/artifacts/13962115738) · [Lighthouse final completo](https://github.com/olegariotech-site/cintia-almeida-gomes-advocacia/actions/runs/43256129708/artifacts/13961428586).
- Artefatos `cintia-v4-final-qa` e `cintia-v3-v4-lighthouse`: retenção 90 dias, com screenshots, relatórios axe, medições de foco, resultados por cenário e Lighthouse completo. A suíte Chromium original mantém seu artefato separado e não foi apagada.

## Gate físico para a direção OT

Testar o mesmo candidato em Safari de iPhone e Chrome de Android reais, a partir de uma cópia local da branch em rede de testes, sem publicar a V4. Registrar modelo, sistema, navegador, commit, data, resultado e capturas:

1. HERO em retrato e paisagem, fontes, vídeo silencioso/inline ou poster em modo de economia de energia.
2. Menu, âncoras, retorno do foco, rolagem, áreas/FAQ e rodapé.
3. Teclado virtual em todos os campos; botão flutuante oculto enquanto digita; validação vazia e mensagem WhatsApp/fallback sem enviar.
4. Cookies: primeira visita, recusa, reabertura, aceite e revogação.
5. Recursos de acessibilidade do aparelho e foco com teclado externo, quando disponível.

O próximo gate é registrar esses testes e a decisão sobre a ressalva de desempenho. Qualquer merge/publicação exige nova autorização expressa; este parecer não a concede.
