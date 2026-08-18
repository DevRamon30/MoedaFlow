const axios = require('axios');

// O cache é essencial aqui porque a API gratuita do CoinGecko possui um rate limit
// rigoroso (geralmente entre 10 a 30 chamadas por minuto). Armazenando a resposta em 
// memória por 60 segundos, garantimos que não excederemos esse limite mesmo se 
// múltiplos usuários (ou componentes no frontend) acessarem o dashboard simultaneamente.
// Isso evita que nossa aplicação seja bloqueada temporariamente (Erro 429).
let cache = null;
let lastFetchTime = 0;
const CACHE_TTL = 60 * 1000; // 60 segundos

const API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=brl,usd&include_24hr_change=true';

const apiClient = axios.create({
  timeout: 5000,
});

async function getCotacoesComRetry(tentativas = 3) {
  try {
    const response = await apiClient.get(API_URL);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 429 && tentativas > 1) {
      console.warn(`[CoinGecko] Rate limit atingido (429). Retentando... (${tentativas - 1} tentativas restantes)`);
      
      // Exponential backoff: espera 1s na primeira falha, depois 2s
      const delay = (4 - tentativas) * 1000; 
      await new Promise(res => setTimeout(res, delay));
      
      return getCotacoesComRetry(tentativas - 1);
    }
    throw error;
  }
}

async function getCotacoes() {
  const now = Date.now();
  if (cache && (now - lastFetchTime < CACHE_TTL)) {
    return cache;
  }

  try {
    const data = await getCotacoesComRetry();
    const dataHora = new Date().toISOString();
    
    // Normalizando dados para o mesmo formato do câmbio:
    // { moeda, valorCompra, valorVenda, variacaoPercentual, dataHora }
    // Obs: O CoinGecko não separa compra (bid) e venda (ask) de forma simples,
    // então usaremos o mesmo preço base de mercado para ambos os campos.
    const normalizedData = [
      {
        moeda: 'Bitcoin',
        valorCompra: data.bitcoin.brl,
        valorVenda: data.bitcoin.brl,
        variacaoPercentual: data.bitcoin.brl_24h_change,
        dataHora
      },
      {
        moeda: 'Ethereum',
        valorCompra: data.ethereum.brl,
        valorVenda: data.ethereum.brl,
        variacaoPercentual: data.ethereum.brl_24h_change,
        dataHora
      },
      {
        moeda: 'Solana',
        valorCompra: data.solana.brl,
        valorVenda: data.solana.brl,
        variacaoPercentual: data.solana.brl_24h_change,
        dataHora
      }
    ];

    cache = normalizedData;
    lastFetchTime = Date.now();

    return cache;
  } catch (error) {
    console.error('Erro ao buscar criptomoedas do CoinGecko:', error.message);
    throw new Error('Serviço de criptomoedas indisponível no momento.');
  }
}

module.exports = {
  getCotacoes
};
