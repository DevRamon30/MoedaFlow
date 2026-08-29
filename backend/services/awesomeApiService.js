const axios = require('axios');

// Cache configuration
let cache = null;
let lastFetchTime = 0;
const CACHE_TTL = 60 * 1000; // 60 seconds

const API_URL = 'https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,BTC-BRL';

async function getCotacoes() {
  const now = Date.now();
  if (cache && (now - lastFetchTime < CACHE_TTL)) {
    return cache;
  }

  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'MoedaFlow/1.0 (Integration)'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Normalize data
    const normalizedData = [
      normalizeMoeda(data.USDBRL),
      normalizeMoeda(data.EURBRL),
      normalizeMoeda(data.BTCBRL)
    ].filter(Boolean);

    cache = normalizedData;
    lastFetchTime = Date.now();

    return cache;
  } catch (error) {
    if (cache) {
      console.warn('Usando cache devido a erro na AwesomeAPI:', error.message);
      return cache;
    }
    console.error('Erro ao buscar cotações da AwesomeAPI:', error.message);
    throw new Error('Serviço de cotações indisponível no momento.');
  }
}

function normalizeMoeda(item) {
  if (!item) return null;
  
  // A AwesomeAPI retorna 'YYYY-MM-DD HH:mm:ss' (ex: '2026-08-28 18:30:00')
  // O Airtable exige formato ISO 8601. Precisamos converter de forma segura.
  let isoDate = new Date().toISOString(); // Default seguro
  if (item.create_date) {
    // Tratando como horário de Brasília (-03:00) para ter um parse correto
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

module.exports = {
  getCotacoes
};
