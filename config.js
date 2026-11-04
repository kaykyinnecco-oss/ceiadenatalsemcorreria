// DADOS DA OFERTA — edite aqui, sem build.
window.CEIA_CONFIG = Object.freeze({
  PRECO: 19.99,
  RAZAO_SOCIAL: '', // Informe a razão social real do responsável.
  CNPJ: '', // Informe o CNPJ real; exibido junto à razão social no rodapé.
  CHECKOUT: 'https://pay.cakto.com.br/pabj6or_1277278',
  PIXEL_META: '902695826167879',
  SUPORTE: 'empresakagency@gmail.com',
  ALVO_CEIA: '2026-12-24T20:00:00-03:00',
  ALVO_REVEILLON: '2026-12-31T23:59:59-03:00',
  FUSO: 'America/Sao_Paulo',
  SHOW_TESTIMONIALS: true, // Nomes/sobrenomes autorizados expressamente nesta rodada.
  TESTIMONIALS: [
    {
        "thumb": "./depoimentos/feedback-01.webp",
        "full": "./assets/feedbacks/feedback-01.webp",
        "width": 320,
        "height": 640,
        "fullWidth": 900,
        "fullHeight": 1800
    },
    {
        "thumb": "./depoimentos/feedback-02.webp",
        "full": "./assets/feedbacks/feedback-02.webp",
        "width": 320,
        "height": 640,
        "fullWidth": 900,
        "fullHeight": 1800
    },
    {
        "thumb": "./depoimentos/feedback-03.webp",
        "full": "./assets/feedbacks/feedback-03.webp",
        "width": 320,
        "height": 640,
        "fullWidth": 900,
        "fullHeight": 1800
    },
    {
        "thumb": "./depoimentos/feedback-04.webp",
        "full": "./assets/feedbacks/feedback-04.webp",
        "width": 320,
        "height": 640,
        "fullWidth": 900,
        "fullHeight": 1800
    },
    {
        "thumb": "./depoimentos/feedback-05.webp",
        "full": "./assets/feedbacks/feedback-05.webp",
        "width": 320,
        "height": 640,
        "fullWidth": 900,
        "fullHeight": 1800
    }
],
  PAYMENT_BRANDS: ['pix', 'visa', 'mastercard', 'elo'], // Aceitação confirmada pelo responsável.
  CONSENT_MODE: 'notice',
  ENABLE_PIXEL_IN_PREVIEW: false, // Evita eventos de teste no pixel real.
  PRIVACIDADE_URL: '', // Informe a URL aprovada antes de publicar.
  TERMOS_URL: '',
  ENTREGA_CONFIRMADA: '', // Preencha com o canal validado na configuração do produto Cakto.
  ORIENTACAO_13_CONFIRMADA: false, // Falta a orientação no PDF publicado.
});
