const axios = require('axios');

async function enviarAlertaWebhook(alerta) {
  const webhookUrl = process.env.WEBHOOK_URL;
  
  if (!webhookUrl || webhookUrl.trim() === '' || webhookUrl.includes('your_webhook_url_here')) {
    console.warn('[Notificação] Webhook URL não configurada. Ignorando envio da notificação.');
    return;
  }

  try {
    // Formato genérico que funciona bem para Slack/Discord (dependendo da configuração do webhook,
    // o Discord costuma aceitar o formato do Slack, ou apenas enviar text/content)
    const payload = {
      text: `🚨 *Alerta de Variação de Preço* 🚨\nMoeda: ${alerta.moeda}\nVariação: ${alerta.variacao.toFixed(2)}%\nMensagem: ${alerta.mensagem}`
    };

    await axios.post(webhookUrl, payload);
    console.log(`[Notificação] Alerta enviado com sucesso para a moeda ${alerta.moeda}`);
  } catch (error) {
    console.error('[Notificação] Erro ao enviar notificação via Webhook:', error.message);
  }
}

module.exports = {
  enviarAlertaWebhook
};
