const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  // Retorna notícias mockadas para garantir que a apresentação funcione 100% 
  // sem depender de APIs de terceiros (que estão bloqueando requisições sem chave)
  const noticiasMock = {
    status: 'ok',
    items: [
      {
        title: 'Bitcoin atinge novo marco histórico antes da decisão do FED',
        link: 'https://cointelegraph.com.br/news/bitcoin',
        pubDate: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        thumbnail: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=200&h=200&fit=crop'
      },
      {
        title: 'Ethereum (ETH) registra aumento recorde de transações na rede Layer 2',
        link: 'https://cointelegraph.com.br/news/ethereum',
        pubDate: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        thumbnail: 'https://images.unsplash.com/photo-1622736136977-16788b15d2a9?w=200&h=200&fit=crop'
      },
      {
        title: 'Solana (SOL) anuncia nova parceria institucional para adoção em pagamentos',
        link: 'https://cointelegraph.com.br/news/solana',
        pubDate: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        thumbnail: 'https://images.unsplash.com/photo-1640161704729-cbe966a08476?w=200&h=200&fit=crop'
      },
      {
        title: 'Mercado de Câmbio: Dólar sofre leve queda frente ao Real após dados econômicos',
        link: 'https://cointelegraph.com.br/news/dolar',
        pubDate: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        thumbnail: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=200&h=200&fit=crop'
      },
      {
        title: 'Regulação de Criptomoedas avança com novas propostas e diretrizes',
        link: 'https://cointelegraph.com.br/news/regulation',
        pubDate: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
        thumbnail: 'https://images.unsplash.com/photo-1605792657360-39fb39f4541e?w=200&h=200&fit=crop'
      }
    ]
  };

  res.json(noticiasMock);
});

module.exports = router;
