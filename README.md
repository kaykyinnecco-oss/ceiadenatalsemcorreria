# Ceia de Natal Sem Correria

Página estática em HTML/CSS/JS. Sem build e sem dependências para publicação. Revisão mais curta inspirada na ordem da referência 500 Mantras: hero, solução, abas, bônus, feedbacks, plano, FAQ e garantia/rodapé.

## Rodar localmente

Na pasta do projeto, execute:

```sh
npx serve@14.2.4 -l 8765 --no-clipboard .
```

Abra `http://localhost:8765`. Não abra `index.html` por `file://`. Todos os recursos locais usam caminhos relativos `./assets/...` e `./depoimentos/...`.

## Variáveis da oferta

Edite o objeto no topo de `config.js`: `PRECO`, `CHECKOUT`, `PIXEL_META`, `SUPORTE`, `ALVO_CEIA`, `ALVO_REVEILLON`, `RAZAO_SOCIAL`, `CNPJ`, `PRIVACIDADE_URL` e `TERMOS_URL`.

Dados preservados: R$ 19,00; checkout Cakto fornecido; pixel 2429955871112248; empresakagency@gmail.com. O preço não tem count-up ou animação.

## Relógio

`calendar.js` é um script clássico, sem imports. A contagem é calculada imediatamente após o HTML da faixa, antes da primeira pintura. Não há zeros escritos como placeholders. Usa `Date.now()` em cada atualização; HEAD da própria página só corrige o offset com uma resposta e cabeçalho `Date` válidos, somente em HTTP/HTTPS. Em `file://`, a sincronização é ignorada.

Dias, horas, minutos e segundos permanecem visíveis, inclusive no dia 24. Reduced motion desliga a animação, não a contagem. Aba oculta pausa o intervalo. Não há cookie/localStorage relacionado ao relógio. A data não altera o preço.

Para testar, use `?agora=2026-11-03T14:41:00-03:00`. Só localhost e nomes explícitos de preview Vercel habilitam a simulação. Os nomes de fase anteriores permanecem no texto acima do título e no nome acessível da faixa.

## Pixel e atribuição

PageView ocorre ao carregar, sem aguardar aceite. ViewContent ocorre ao alcançar `#plano`; InitiateCheckout só nos links que levam ao checkout. `utm_*` e `fbclid` são repassados. ID vazio desabilita todos os eventos e gera um aviso no console. Em localhost há console.log dos eventos. Em preview, `ENABLE_PIXEL_IN_PREVIEW=false` evita enviar eventos de QA ao pixel real.

Uma recusa explícita no banner interrompe os eventos posteriores. Os diálogos de privacidade/termos são informações básicas da oferta; configure as URLs de textos aprovados antes da publicação.

## Feedbacks

Somente o print real anexado está em `depoimentos/`. Não foi duplicado. Com um item, as setas ficam desabilitadas; com vários, o carrossel avança a cada 5 s, permite deslizar e pausa ao toque/foco. Reduced motion também impede o autoavanço. Sem imagens/configuração, a seção é omitida.

## Saída

Sem pop-up por tempo. Após 15 s e 40% de leitura, a saída pelo topo no desktop pode mostrar o aviso. No celular, é necessário passar de 50% e rolar rapidamente para cima. Uma vez por sessão. Fecha por X, Esc, clique fora ou “Agora não”. Nenhum desconto ou contagem de oferta.

## Testes

```sh
node --test tests/calendar.test.cjs
node scripts/audit-files.cjs
```

Os scripts Playwright em `scripts/qa-revision.cjs` e `scripts/capture-revision.cjs` dependem do Playwright e de Chrome; ajuste seus caminhos locais de runtime se executar em outra máquina. Relatórios em `tests/reports/`, prints em `prints/revisao/`. São ferramentas de revisão, não dependências do site.

`ARQUIVOS-REFERENCIADOS.md` lista cada arquivo local e confirma sua presença. As fontes WOFF2 e licenças OFL ficam em `assets/fonts/`.

## GitHub e Vercel

Destino solicitado: https://github.com/kaykyinnecco-oss/ceiadenatalsemcorreria.git

O push só deve acontecer após aprovação dos prints. `.gitignore` impede PDFs, `/originais`, `/fontes-pdf`, `.env` e `node_modules`. Não incluir os PDFs pagos, links de entrega ou credenciais.

Após a aprovação: inicializar Git se necessário, usar branch `main`, commit claro e remote `origin`. Se existir conteúdo remoto, integrar com `pull --rebase`; nunca fazer force push. Falha de autenticação deve interromper o envio.

Na Vercel, importe o repositório, selecione **Other**, sem comando de build e diretório de saída `.`. `vercel.json` contém a configuração estática. A publicação usa os mesmos caminhos relativos testados por HTTP.
