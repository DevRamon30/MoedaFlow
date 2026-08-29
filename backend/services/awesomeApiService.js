const axios = require('axios');
const https = require('https');

// Cache configuration
let cache = null;
let lastFetchTime = 0;
const CACHE_TTL = 60 * 1000; // 60 seconds

// URLs das APIs
const AWESOME_API_URL = 'https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,BTC-BRL';
const EXCHANGE_RATE_API_URL = 'https://open.er-api.com/v6/latest/USD';
const COINGECKO_BTC_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl&include_24hr_change=true';

// Cliente HTTP com IPv4 forçado para evitar problemas de resolução DNS
// em plataformas cloud (Render, Railway, etc.) que podem ter issues com IPv6
const apiClient = axios.create({
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; MoedaFlow/1.0)',
    'Accept': 'application/json'
  },
  httpsAgent: new https.Agent({
    family: 4, // Força IPv4
    rejectUnauthorized: true
  })
});

// ====================================================================
// FONTE PRIMÁRIA: AwesomeAPI (economia.awesomeapi.com.br)
// ====================================================================
async function fetchFromAwesomeApi() {
  console.log('[Câmbio] Tentando AwesomeAPI (fonte primária)...');
  const response = await apiClient.get(AWESOME_API_URL);
  const data = response.data;

  return [
    normalizeMoedaAwesome(data.USDBRL),
    normalizeMoedaAwesome(data.EURBRL),
    normalizeMoedaAwesome(data.BTCBRL)
  ].filter(Boolean);
}

function normalizeMoedaAwesome(item) {
  if (!item) return null;

  // Converte data da AwesomeAPI ('YYYY-MM-DD HH:mm:ss') para ISO 8601
  let isoDate = new Date().toISOString();
  if (item.create_date) {
    const dateStr = item.create_date.replace(' ', 'T') + '-03:00';
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      isoDate = parsed.toISOString();
    }
  }

  return {
    moeda: item.name,
    valorCompra: parseFloat(item.bid),
    valorVenda: parseFloat(item.ask),
    variacaoPercentual: parseFloat(item.pctChange),
    dataHora: isoDate
  };
}

// ====================================================================
// FONTE FALLBACK: ExchangeRate-API (open.er-api.com) + CoinGecko (BTC)
// Usada quando a AwesomeAPI está inacessível (comum em servidores cloud)
// ====================================================================
async function fetchFromFallback() {
  console.log('[Câmbio] AwesomeAPI falhou. Tentando fontes alternativas (ExchangeRate-API + CoinGecko)...');
  const dataHora = new Date().toISOString();
  const result = [];

  // 1. Busca USD/BRL e EUR/BRL via ExchangeRate-API
  try {
    const response = await apiClient.get(EXCHANGE_RATE_API_URL);
    const rates = response.data.rates;

    if (rates && rates.BRL) {
      const usdBrl = rates.BRL; // 1 USD = X BRL

      result.push({
        moeda: 'Dólar Americano/Real Brasileiro',
        valorCompra: parseFloat(usdBrl.toFixed(4)),
        valorVenda: parseFloat(usdBrl.toFixed(4)),
        variacaoPercentual: 0,
        dataHora
      });

      if (rates.EUR) {
        const eurBrl = rates.BRL / rates.EUR; // EUR/BRL = USD_BRL / USD_EUR
        result.push({
          moeda: 'Euro/Real Brasileiro',
          valorCompra: parseFloat(eurBrl.toFixed(4)),
          valorVenda: parseFloat(eurBrl.toFixed(4)),
          variacaoPercentual: 0,
          dataHora
        });
      }
    }
  } catch (err) {
    console.error('[Câmbio] ExchangeRate-API também falhou:', err.message);
  }

  // 2. Busca BTC/BRL via CoinGecko (como fallback para "Bitcoin/Real Brasileiro")
  try {
    const response = await apiClient.get(COINGECKO_BTC_URL);
    const data = response.data;

    if (data.bitcoin && data.bitcoin.brl) {
      result.push({
        moeda: 'Bitcoin/Real Brasileiro',
        valorCompra: data.bitcoin.brl,
        valorVenda: data.bitcoin.brl,
        variacaoPercentual: data.bitcoin.brl_24h_change || 0,
        dataHora
      });
    }
  } catch (err) {
    console.error('[Câmbio] CoinGecko BTC fallback também falhou:', err.message);
  }

  if (result.length === 0) {
    throw new Error('Todas as fontes de câmbio falharam.');
  }

  console.log(`[Câmbio] Fallback bem-sucedido! ${result.length} cotações obtidas via fontes alternativas.`);
  return result;
}

// ====================================================================
// FUNÇÃO PRINCIPAL: Tenta AwesomeAPI → Fallback → Cache antigo
// ====================================================================
async function getCotacoes() {
  const now = Date.now();
  if (cache && (now - lastFetchTime < CACHE_TTL)) {
    return cache;
  }

  // Tentativa 1: AwesomeAPI (fonte primária)
  try {
    const data = await fetchFromAwesomeApi();
    cache = data;
    lastFetchTime = Date.now();
    console.log('[Câmbio] AwesomeAPI respondeu com sucesso.');
    return cache;
  } catch (error) {
    console.error('[Câmbio] Falha na AwesomeAPI:', error.message);
  }

  // Tentativa 2: APIs alternativas (fallback)
  try {
    const data = await fetchFromFallback();
    cache = data;
    lastFetchTime = Date.now();
    return cache;
  } catch (fallbackError) {
    console.error('[Câmbio] Falha no fallback:', fallbackError.message);
  }

  // Tentativa 3: Retorna cache antigo se existir
  if (cache) {
    console.warn('[Câmbio] Usando cache antigo. Todas as fontes falharam.');
    return cache;
  }

  throw new Error('Serviço de cotações de câmbio completamente indisponível.');
}

module.exports = {
  getCotacoes
};
