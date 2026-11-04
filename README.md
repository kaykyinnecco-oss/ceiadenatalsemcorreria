# Ceia de Natal Sem Correria

Página estática em HTML, CSS e JavaScript. Sem build, framework, banco de dados ou dependências de produção. Layout pensado primeiro para celulares de 360–430 px.

## Rodar por HTTP

Na raiz do projeto:

~~~sh
npx serve@14.2.4 -l 8765 --no-clipboard .
~~~

Abra http://localhost:8765. O servidor usa gzip. Não use file://; imagens, fontes, scripts e símbolos SVG usam caminhos relativos.

## Configuração

Edite config.js. Não coloque credenciais nesse arquivo público.

| Variável | Uso |
| --- | --- |
| PRECO | R$ 19,99; preço sem animação |
| CHECKOUT | Checkout Cakto da oferta |
| PIXEL_META | Novo ID: 902695826167879; vazio desativa eventos e avisa no console |
| SUPORTE | E-mail mostrado no rodapé e nos termos |
| ALVO_CEIA / ALVO_REVEILLON / FUSO | Datas do calendário de São Paulo |
| TESTIMONIALS / SHOW_TESTIMONIALS | Cinco originais; objetos thumb/full com dimensões, na ordem dos anexos |
| FEEDBACK_SPEED | Velocidade do marquee em px/s; padrão 35 |
| RAZAO_SOCIAL / CNPJ | Primeiras variáveis da oferta; identificação real mostrada no rodapé |
| PAYMENT_BRANDS | Pix, Visa, Mastercard e Elo; bandeiras de cartão confirmadas pelo responsável |
| PRIVACIDADE_URL / TERMOS_URL | URLs dos textos definitivos aprovados |
| ENTREGA_CONFIRMADA | Canal de entrega validado na configuração do produto Cakto; resposta de até 20 palavras |
| ORIENTACAO_13_CONFIRMADA | Só ativar após incluir e validar a orientação para grupos maiores no PDF |
| ENABLE_PIXEL_IN_PREVIEW | false evita eventos reais de QA em localhost e previews explícitos |
| CONSENT_MODE | 'notice' por padrão registra a preferência sem bloquear eventos; 'optin' aguarda o aceite |

A aplicação não precisa de variáveis de ambiente nem de instalação para publicar. As variáveis configuráveis são públicas, carregadas diretamente de config.js.

## Relógio

calendar.js calcula dias, horas, minutos e segundos com Date.now a cada atualização. HEAD da própria página corrige o horário apenas com resposta e cabeçalho Date válidos. Aba oculta pausa o intervalo; reduced motion mantém a contagem sem animação. Não há armazenamento ou prazo artificial de preço.

Simule em localhost com ?agora=2026-11-03T14:41:00-03:00. A simulação também funciona em nomes explícitos de preview Vercel, nunca no domínio normal de produção. Após a ceia, o relógio acompanha o Réveillon; depois das festas mostra acesso e garantia. As fases continuam na descrição acessível da faixa, sem eyebrow extra no hero.

## Conteúdo e quantidades

As amostras públicas são páginas reais. O repositório não contém os PDFs pagos completos. A tabela original traz 4, 6, 8, 10 e 12 pessoas. O seletor inclui 5, 7, 9 e 11 como cálculo proporcional identificado, usando as mesmas proporções da amostra. Para 13 ou mais, exibe apenas a mensagem solicitada, sem tabela ou valores inventados.

O cálculo demonstrativo do site não transforma os formulários do PDF em calculadoras. As listas prontas do material são para 6 e 10 pessoas. Leia README-PENDENCIAS.md antes de alterar promessas.

## Rastreamento e atribuição

PageView é agendado após a primeira pintura, sem depender de aceite. ViewContent ocorre ao alcançar #plano; InitiateCheckout em todos os links de checkout, inclusive no pop-up. utm_* e fbclid são repassados ao checkout. Em localhost, eventos aparecem no console. O QA intercepta o script Meta quando verifica o ID, sem enviar eventos reais.

Em `CONSENT_MODE: 'notice'`, PageView, ViewContent e InitiateCheckout são independentes dos botões do banner: eles registram somente a preferência. Em `CONSENT_MODE: 'optin'`, nenhum evento é enviado antes de “Aceitar”; eventos pendentes são enviados após o aceite. O ID vazio não dispara nenhum evento. A recusa no modo optin mantém o bloqueio.

## Interações

Abas acessíveis por teclado e toque; seletor de convidados; marquee contínuo de feedbacks abaixo de #plano. Os cinco nomes e sobrenomes foram expressamente autorizados nesta rodada. Não há legendas nem relatos criados. O loop duplica apenas a apresentação visual: há cinco cartões únicos e cinco miniaturas em ./depoimentos; as ampliações ficam em ./assets/feedbacks. Mais detalhes em DEPOIMENTOS.md. A faixa pausa em hover, toque prolongado e lightbox; o arrasto usa scroll nativo e a animação retoma após 3 s de inatividade. Com reduced motion ou menos de quatro prints, não há movimento automático. Sem arquivos na configuração, a seção é removida e o FAQ fica imediatamente depois do plano.

popup.js só é carregado após a primeira pintura. Variante A: saída pelo topo no desktop após 15 s e 25% de leitura; subida rápida no celular após 20 s e 50%. Variante B: 12 s contínuos com o cartão do plano visível, com três respostas curtas. Uma única abertura por sessão, bloqueada no fim da página e após clique no checkout. Sem interceptar histórico/voltar. Fecha por X, Esc, fora, “Agora não” e gesto no handle móvel. O foco fica dentro do diálogo e retorna à origem.

Animações usam CSS e Web Animations API, apenas transform/opacity. A entrada dos cartões e count-up do hero aguardam a pintura da capa; o hero nunca começa oculto. Não há biblioteca de animação ou script externo bloqueando o carregamento.

## Testes e manutenção

~~~sh
node --test tests/calendar.test.cjs
node scripts/audit-files.cjs
node scripts/qa-marquee.cjs
node scripts/qa-marquee-navigation.cjs
~~~

Os testes Playwright exigem Playwright e Chrome. Os scripts qa-final/qa-conversion anteriores guardam premissas de rodadas antigas e não são a suíte atual do marquee. Instale Playwright no ambiente de desenvolvimento ou defina CEIA_RUNTIME_MODULES com o diretório de módulos. CEIA_CHROME_PATH permite indicar o executável do Chrome. Os testes não são dependências de produção.

Depois de editar as regras entre CRITICAL START e CRITICAL END de styles.css, execute node scripts/sync-critical.cjs para atualizar o CSS inline versionado em index.html. Isso é manutenção do código; a Vercel não executa build.

Relatórios em tests/reports; prints desta rodada em prints/marquee, ambos ignorados no Git. VERIFICACAO-MARQUEE.md registra os testes atuais; VERIFICACAO.md guarda a medição anterior. qa-final.cjs compara cada mockup com todos os ancestrais que têm overflow diferente de visible, por eixo, e falha se houver corte. Os selos usam SVGs com textPath e o dígito original Fraunces em vetor, carregados sob demanda; até 64 px a versão compacta mostra apenas “7” e “DIAS”. As fontes e suas licenças OFL estão em assets/fonts.

## GitHub e Vercel

Remote: https://github.com/kaykyinnecco-oss/ceiadenatalsemcorreria.git. Envio à main autorizado pelo responsável nesta revisão. Fazer commits pequenos, git pull --rebase origin main e git push origin main, sem force push. Falha de autenticação interrompe o envio.

Para importar na Vercel: selecione esse repositório, Production Branch main, Framework Preset Other, raiz do projeto **.**, Build Command vazio, Install Command vazio e Output Directory **.**. Não há package.json nem etapa de build. vercel.json mantém a configuração estática. Quando o projeto já está ligado ao GitHub, um push à main aciona a publicação.

Os ícones estão em assets/icons-v2.svg, com URL nova para evitar o cache da versão anterior. .gitignore exclui PDFs, originais, fontes-pdf, prints, ZIPs, .env e node_modules. Não publicar material pago, credenciais ou links privados de entrega.

## Revisão de marcas e miniaturas

Origens oficiais e regras: assets/pagamentos/FONTES.md. As sete miniaturas reais ficam em assets/beneficios, com até 5 KB por arquivo e 56×72 px no layout. O selo próprio está em assets/verified.svg. Previews recortados ficam em assets/previews; as páginas originais de assets/pages são preservadas para os mockups do hero e para ampliação. O preço segue R$ 19,99 e o pixel não foi alterado.

A pasta de depoimentos tem apenas o terceiro anexo da rodada atual, convertido integralmente para WebP de qualidade 85, em 887×1774 px. Os demais aguardam tarja. A seção some quando a lista está vazia; não se duplicam prints para simular mais depoimentos.

## Medidas do carrossel

Os tetos de 440 px no celular e 520 px no desktop não comportam simultaneamente os cartões de 300/380 px, título, CTA e padding solicitado. Para respeitar os tetos e manter as imagens inteiras, os cartões usam 119×238 px no celular e 138×276 px no desktop, com gap de 12 px e padding de 48/64 px. Não há recorte nem distorção das mensagens.

As miniaturas têm 320×640 e no máximo 25.000 bytes. O responsável autorizou reduzir a qualidade apenas nelas para respeitar o limite; as ampliações têm 900×1800 e qualidade 85. Os valores de cada arquivo estão em assets/feedbacks/manifest.json.
