const cron = require('node-cron');
const awesomeApiService = require('../services/awesomeApiService');
const coinGeckoService = require('../services/coinGeckoService');
const airtableService = require('../services/airtableService');

function startSyncJob() {
  const runSync = async () => {
    console.log('[CRON] Iniciando sincronização automática de cotações para o Airtable...');
    
    // Validação inicial das variáveis de ambiente críticas
    if (!process.env.AIRTABLE_TOKEN || !process.env.AIRTABLE_BASE_ID) {
      console.warn('[CRON] Sincronização ignorada: AIRTABLE_TOKEN ou AIRTABLE_BASE_ID não estão configurados no .env.');
      return;
    }

    try {
      // 1. Busca dados de câmbio
      let cotacoesCambio = [];
      try {
        cotacoesCambio = await awesomeApiService.getCotacoes();
      } catch (err) {
        console.error('[CRON] Falha ao buscar câmbio:', err.message);
      }

      // 2. Busca dados de cripto
      let cotacoesCripto = [];
      try {
        cotacoesCripto = await coinGeckoService.getCotacoes();
      } catch (err) {
        console.error('[CRON] Falha ao buscar cripto:', err.message);
      }

      const notificacaoService = require('../services/notificacaoService');
      
      async function processarEsalvarCotacao(cotacao, tipo) {
        // Busca último registro para verificar variação
        const historico = await airtableService.buscarHistorico(cotacao.moeda, 1);
        if (historico && historico.length > 0) {
          const ultimoRegistro = historico[0];
          const ultimoValor = ultimoRegistro.ValorCompra;
          const novoValor = cotacao.valorCompra;
          
          if (ultimoValor && ultimoValor > 0) {
            const variacao = ((novoValor - ultimoValor) / ultimoValor) * 100;
            
            // Se variou mais que 0.01% (positivo ou negativo) para facilitar a apresentação
            if (Math.abs(variacao) > 0.01) {
              const mensagem = `A moeda ${cotacao.moeda} variou ${variacao.toFixed(2)}% em relação ao último registro (De ${ultimoValor} para ${novoValor}).`;
              console.log(`[ALERTA] ${mensagem}`);
              
              const alerta = {
                moeda: cotacao.moeda,
                variacao: variacao,
                mensagem: mensagem,
                dataHora: new Date().toISOString()
              };
              
              // Salva alerta no Airtable e dispara webhook
              await airtableService.salvarAlerta(alerta);
              await notificacaoService.enviarAlertaWebhook(alerta);
            }
          }
        }

        // Salva o novo registro no histórico
        await airtableService.salvarCotacao({ ...cotacao, tipo });
      }

      // 3. Salva no banco (Airtable) e checa variações
      let registrosSalvos = 0;
      
      for (const cotacao of cotacoesCambio) {
        await processarEsalvarCotacao(cotacao, 'cambio');
        registrosSalvos++;
      }

      for (const cotacao of cotacoesCripto) {
        await processarEsalvarCotacao(cotacao, 'cripto');
        registrosSalvos++;
      }

      console.log(`[CRON] Sincronização concluída com sucesso! ${registrosSalvos} novos registros inseridos no Airtable.`);
      
      // 4. Executa a limpeza automática de registros mais velhos que 24 horas
      await airtableService.limparRegistrosAntigos(24);
    } catch (error) {
      console.error('[CRON] Ocorreu um erro fatal no job de sincronização:', error.message);
    }
  };

  // Executa uma vez imediatamente ao iniciar o servidor
  runSync();

  // Roda a cada 5 minutos ('*/5 * * * *')
  cron.schedule('*/5 * * * *', runSync);

  console.log('[CRON] Job agendado: Sincronização de cotações ocorrerá a cada 5 minutos em background (com auto-limpeza de 24h).');
}

module.exports = {
  startSyncJob
};
