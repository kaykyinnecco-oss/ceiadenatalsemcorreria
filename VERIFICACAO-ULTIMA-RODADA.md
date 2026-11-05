# Última rodada — 04/11/2026

Base recebida por git pull --rebase: afdb0fad86b6b22569a26ea7d52ba470888c04e4. Somente os ajustes solicitados; estrutura e ordem das seções, cores, ícones, imagens de produto, preço de R$ 19,99, pixel e checkout preservados. Não foi incluída identificação empresarial.

## Feedbacks

5 arquivos em ./depoimentos; 0 duplicatas; 5 mantidos. SHA-256 e dHash de 9×8 em cinza, distância de Hamming ≤5, ordem lexical para escolher o primeiro de um grupo. A menor distância observada entre os arquivos foi 14. Não havia arquivo duplicado a remover com git rm. O problema era a repetição dos mesmos cinco prints em conjuntos no DOM.

O carrossel agora contém cinco cartões e cinco fontes únicas, sem clones, conjuntos repetidos, pontos ou setas externas. Larguras: 150 px no celular e 190 px no desktop. As alturas existentes de cartão e seção foram preservadas: seção 440 px no celular e 520 px no desktop. Avanço a cada 3,5 s onde há conteúdo para rolar; no desktop amplo os cinco cabem ao mesmo tempo. Pausa em toque, arrasto, hover, foco de teclado e lightbox; reativa o temporizador após 3 s de inatividade. Retorno suave ao primeiro ao chegar à extremidade; sem autoavanço com reduced motion. Arrasto real de mouse e a navegação do lightbox pelos cinco originais foram testados.

As cinco miniaturas WebP permanecem intactas, de 19.114 a 24.758 bytes, 320×640, lazy/async e com dimensões declaradas. As ampliações não geraram requisição antes de abrir o lightbox; carregam sob demanda, uma imagem por vez.

## Pix e benefícios

Os quatro arquivos oficiais de assets/pagamentos foram preservados byte a byte. Azulejos de 34 px de altura nos dois locais, com compensação do respiro transparente de cada SVG para aproximadamente 20 px de altura visível. Sem filtro, recoloração ou opacidade artificial; o cinza do nome Pix pertence à arte oficial.

As miniaturas dos benefícios usam 44×56 px, alinhadas e com os selos existentes. Foram trocados somente os três recortes pedidos: tabela (kit-19), dia 24 (kit-10) e tarefas (kit-28), a partir dos cabeçalhos e primeiras linhas reais. Não foram preenchidos campos em branco nem inventadas informações. URLs novas evitam o cache imutável da arte anterior.

## Tipografia e layout

Tabela completa em TIPOGRAFIA-MOBILE.md. Playwright em 360×740, 390×844, 412×915, 430×932, 1366×768 e 1440×900: sem rolagem horizontal, texto cortado, alvos interativos menores de 44 px no celular ou imagens visíveis quebradas. Primeira tela em 390×844 mostra título, botão e mockup. Hero com até três linhas e plano com até duas. Pop-ups A/B e banner de cookies cabem nas quatro telas móveis. CLS 0 na carga dos seis tamanhos.

## Desempenho por HTTP/gzip

Mesmo computador e Chrome headless, Lighthouse 12.8.2, serve 14.2.4, simulação mobile padrão. Medição de laboratório; não é um dado agregado de usuários reais.

| Métrica | Antes | Depois |
| --- | ---: | ---: |
| Lighthouse mobile | 97 | 98 |
| LCP | 2.513 s | 2.482 s |
| CLS | 0 | 0 |
| TBT | 65 ms | 1 ms |
| Transferência inicial (Lighthouse) | 368.445 bytes | 368.011 bytes |
| Página inteira, sem ampliações | 586.816 bytes | 585.698 bytes |

Página inteira: recursos medidos no navegador em 390×844 após carregar todas as imagens da página, somados à transferência do documento no Lighthouse correspondente. Ampliações e tráfego de checkout não entram nessa soma. Valores de transferência HTTP comprimida, não tamanho descompactado em memória. O hero e as duas fontes principais continuam com preload; fontes com swap e scripts de aplicação com defer. Metas ≥90, LCP ≤2,5 s e CLS 0 atendidas.

## Funções e rastreio

11 testes do relógio e 10 grupos da suíte atual passaram. Abas com naturalWidth > 0; quantidades originais; cinco fases do calendário; carrossel e lightbox; reduced motion; conteúdo sem JS/observador; layouts; gatilhos de pop-up desktop e celular; uma abertura por sessão; bloqueio após checkout.

O caminho real do clique hero → plano → checkout foi testado com utm_source=teste e fbclid=abc. A URL de destino mantém ambos. PageView, ViewContent e InitiateCheckout foram capturados no console de localhost. A requisição ao checkout foi interceptada em QA para evitar enviar dados ou realizar compra. Nenhum evento de QA foi transmitido ao Meta.

## Pendências verificadas

- Privacidade: PRIVACIDADE_URL vazia; o controle abre apenas o diálogo existente. Não existe página real para confirmar HTTP 200.
- Termos: TERMOS_URL vazia; o controle abre apenas o diálogo existente. Não existe página real para confirmar HTTP 200.
- Cookies: o controle reabre o banner; não há página de cookies nem URL configurada para testar HTTP 200.
- Atualização da rodada do card: a copy de convidados foi definida pelo responsável; continua pendente a confirmação do canal de entrega Cakto.

Nenhum texto jurídico foi inventado e nenhum desses diálogos foi apresentado como página legal definitiva. As pendências legais permanecem explicitamente informadas após o push. Produção só é confirmada na entrega depois de esperar entre um e dois minutos e abrir a URL pública.
