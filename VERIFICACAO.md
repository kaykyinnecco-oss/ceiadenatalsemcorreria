# Verificação da rodada anterior — 04/11/2026 (antes do marquee)

Base: git pull --rebase origin main, commit 82aa3dfe04959ab39aa8da2172d5e9b9a7b4e0d7. Somente oferta, mockups, pagamentos, selo, cookies, pop-up, feedbacks e documentação desses pontos foram alterados.

## Layout e imagens

Playwright por HTTP/gzip com npx serve@14.2.4. Seis viewports solicitados, mais duas janelas de 600 px de altura:

| Viewport | Altura do card | Cookies | Cortes por overflow | Slides públicos |
| --- | ---: | ---: | ---: | ---: |
| 360×740 | 945.0 px | 64 px | 0 | 0 |
| 390×844 | 932.5 px | 64 px | 0 | 0 |
| 412×915 | 932.5 px | 64 px | 0 | 0 |
| 768×1024 | 932.5 px | 48 px | 0 | 0 |
| 1366×768 | 631.6 px | 48 px | 0 | 0 |
| 1440×900 | 631.6 px | 48 px | 0 | 0 |
| 360×600 | 945.0 px | 64 px | 0 | 0 |
| 1366×600 | 631.6 px | 48 px | 0 | 0 |

Zero rolagem horizontal, imagens quebradas ou erros JavaScript nos oito tamanhos. O script scripts/qa-final.cjs compara o getBoundingClientRect de cada mockup com todos os ancestrais com overflow diferente de visible, separando os eixos, e falha se detectar corte. Foram verificados 32 elementos na página e 3 em cada variante do pop-up, por viewport. Os pop-ups A/B ficaram abaixo de min(90vh,620px), sem rolagem interna, inclusive nas janelas de 600 px de altura.

As seis linhas da oferta e as miniaturas reais foram preservadas, com os bônus em uma linha. O preço é estático. Desktop: 960 px e grade 5fr/7fr; preço ao lado do título para respeitar 640 px de altura. Celular: capa, título, benefícios, preço, CTA, garantia e bandeiras. Todos os quatro logos oficiais foram mantidos byte a byte, com exibição proporcional na mesma linha, sem recoloração ou recorte.

Selos renderizados a 160, 96 e 44 px. Os arcos usam textPath nos SVGs de assets; a versão compacta até 64 px mostra só 7/DIAS. O 7 da fonte Fraunces foi convertido em vetor para manter o desenho sem carregar uma fonte dentro de cada imagem. O rótulo “Pague com” tem 11 px. A garantia está centralizada em até 720 px.

Prints em prints/ajustes-finais. Nos recortes de componentes, a navegação fixa e o skip-link são ocultados apenas durante a captura para não se sobreporem ao componente; o print hero-cookies conserva a interface real. Os prints estáticos usam reduced motion; os testes de interação usam movimento habilitado.

## Consentimento e carrossel

scripts/qa-final-interactions.cjs aprovou os modos notice e optin. Notice envia PageView, ViewContent e InitiateCheckout mesmo após “Só essenciais”. Optin bloqueia os três até o aceite e então envia os eventos pendentes. ID, preço e UTMs foram preservados. Nenhum evento de QA foi enviado ao Meta real.

Carrossel testado com cinco fixtures locais explicitamente identificadas como TESTE DE LAYOUT: autoavanço em 5 s, pausa ao toque, navegação e lightbox com Esc. Celular: um inteiro e a ponta do próximo. Desktop: três inteiros, setas e pontos. As fixtures não são depoimentos e não foram copiadas para a pasta pública.

A publicação tem zero arquivos de depoimento e zero slides. Os cinco anexos reais têm sobrenomes completos e foram excluídos pela regra expressa do responsável. O feedback anterior foi removido por git rm; não há frase ou legenda criada para substituí-lo. O teste compara o número de slides ao número de arquivos. As conversões preservam as dimensões 887×1774, sem recorte, qualidade WebP 85, fora do Git.

## Desempenho

Lighthouse mobile padrão, Chrome headless, sem alterar fatores de CPU/rede:

- Performance: 96/100.
- LCP: 1.9 s.
- CLS: 0.001.
- TBT: 220 ms.
- Acessibilidade: 100/100.
- Boas práticas: 100/100.
- SEO: 100/100.

As metas ≥90 e LCP <2,5 s foram atingidas nesta execução local. O CLS medido é informado, sem declarar deslocamento absolutamente zero em todos os dispositivos. Fontes e medidas reais podem gerar variação entre execuções. Os relatórios HTML/JSON completos acompanham os prints. A comparação com a versão anterior, sob as mesmas condições, marcou 87; medições anteriores desta rodada variaram e motivaram a otimização dos selos.

11 testes unitários do relógio passaram. A auditoria de arquivos não encontrou recursos ou símbolos SVG faltantes. Os PDFs pagos, originais, arquivos de ambiente, prints e conversões privadas não entram no commit.
