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
| PRECO | R$ 19,00; preço sem animação |
| CHECKOUT | Checkout Cakto da oferta |
| PIXEL_META | Novo ID: 902695826167879; vazio desativa eventos e avisa no console |
| SUPORTE | E-mail mostrado no rodapé e nos termos |
| ALVO_CEIA / ALVO_REVEILLON / FUSO | Datas do calendário de São Paulo |
| TESTIMONIALS / SHOW_TESTIMONIALS | Prints WebP fornecidos, sem duplicação |
| RAZAO_SOCIAL / CNPJ | Identificação do fornecedor; preencher com dados reais |
| PRIVACIDADE_URL / TERMOS_URL | URLs dos textos definitivos aprovados |
| ENTREGA_CONFIRMADA | Canal de entrega validado na configuração do produto Cakto; resposta de até 20 palavras |
| ORIENTACAO_13_CONFIRMADA | Só ativar após incluir e validar a orientação para grupos maiores no PDF |
| ENABLE_PIXEL_IN_PREVIEW | false evita eventos reais de QA em localhost e previews explícitos |

A aplicação não precisa de variáveis de ambiente nem de instalação para publicar. As variáveis configuráveis são públicas, carregadas diretamente de config.js.

## Relógio

calendar.js calcula dias, horas, minutos e segundos com Date.now a cada atualização. HEAD da própria página corrige o horário apenas com resposta e cabeçalho Date válidos. Aba oculta pausa o intervalo; reduced motion mantém a contagem sem animação. Não há armazenamento ou prazo artificial de preço.

Simule em localhost com ?agora=2026-11-03T14:41:00-03:00. A simulação também funciona em nomes explícitos de preview Vercel, nunca no domínio normal de produção. Após a ceia, o relógio acompanha o Réveillon; depois das festas mostra acesso e garantia. As fases continuam na descrição acessível da faixa, sem eyebrow extra no hero.

## Conteúdo e quantidades

As amostras públicas são páginas reais. O repositório não contém os PDFs pagos completos. A tabela original traz 4, 6, 8, 10 e 12 pessoas. O seletor inclui 5, 7, 9 e 11 como cálculo proporcional identificado, usando as mesmas proporções da amostra. Para 13 ou mais, exibe apenas a mensagem solicitada, sem tabela ou valores inventados.

O cálculo demonstrativo do site não transforma os formulários do PDF em calculadoras. As listas prontas do material são para 6 e 10 pessoas. Leia README-PENDENCIAS.md antes de alterar promessas.

## Rastreamento e atribuição

PageView é agendado após a primeira pintura, sem depender de aceite. ViewContent ocorre ao alcançar #plano; InitiateCheckout em todos os links de checkout, inclusive no pop-up. utm_* e fbclid são repassados ao checkout. Em localhost, eventos aparecem no console. O QA intercepta o script Meta quando verifica o ID, sem enviar eventos reais.

Uma recusa explícita no banner bloqueia os eventos posteriores. O ID vazio não dispara nenhum evento.

## Interações

Abas acessíveis por teclado e toque; seletor de convidados; carrossel com autoavanço de 5 s e pausa ao tocar/focar; lightbox de ampliação. As setas ficam ocultas no celular e, com menos de três prints, em qualquer tamanho. Reduced motion desliga autoavanço e animações.

popup.js só é carregado após a primeira pintura. Variante A: saída pelo topo no desktop após 15 s e 25% de leitura; subida rápida no celular após 20 s e 50%. Variante B: 12 s contínuos com o cartão do plano visível, com três respostas curtas. Uma única abertura por sessão, bloqueada no fim da página e após clique no checkout. Sem interceptar histórico/voltar. Fecha por X, Esc, fora, “Agora não” e gesto no handle móvel. O foco fica dentro do diálogo e retorna à origem.

Animações usam CSS e Web Animations API, apenas transform/opacity. A entrada dos cartões e count-up do hero aguardam a pintura da capa; o hero nunca começa oculto. Não há biblioteca de animação ou script externo bloqueando o carregamento.

## Testes e manutenção

~~~sh
node --test tests/calendar.test.cjs
node scripts/audit-files.cjs
node scripts/qa-revision.cjs
node scripts/qa-conversion.cjs
node scripts/capture-revision.cjs
~~~

Os três últimos scripts exigem Playwright e Chrome. Instale Playwright no ambiente de desenvolvimento ou defina CEIA_RUNTIME_MODULES com o diretório de módulos. CEIA_CHROME_PATH permite indicar o executável do Chrome. Os testes não são dependências de produção.

Depois de editar as regras entre CRITICAL START e CRITICAL END de styles.css, execute node scripts/sync-critical.cjs para atualizar o CSS inline versionado em index.html. Isso é manutenção do código; a Vercel não executa build.

Relatórios em tests/reports; prints em prints/revisao, ambos ignorados no Git. VERIFICACAO.md registra métricas, método e limites. As fontes locais e suas licenças OFL estão em assets/fonts.

## GitHub e Vercel

Remote: https://github.com/kaykyinnecco-oss/ceiadenatalsemcorreria.git. Envio à main autorizado pelo responsável nesta revisão. Fazer commits pequenos, git pull --rebase origin main e git push origin main, sem force push. Falha de autenticação interrompe o envio.

Para importar na Vercel: selecione esse repositório, Production Branch main, Framework Preset Other, raiz do projeto **.**, Build Command vazio, Install Command vazio e Output Directory **.**. Não há package.json nem etapa de build. vercel.json mantém a configuração estática. Quando o projeto já está ligado ao GitHub, um push à main aciona a publicação.

Os ícones estão em assets/icons-v2.svg, com URL nova para evitar o cache da versão anterior. .gitignore exclui PDFs, originais, fontes-pdf, prints, ZIPs, .env e node_modules. Não publicar material pago, credenciais ou links privados de entrega.
