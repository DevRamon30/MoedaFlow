const express = require('express');
const router = express.Router();
const airtableService = require('../services/airtableService');

// Whitelist de moedas permitidas para prevenir Injeção e abusos
const MOEDAS_VALIDAS = [
  'Bitcoin',
  'Bitcoin/Real Brasileiro',
  'Dólar Americano/Real Brasileiro',
  'Ethereum',
  'Euro/Real Brasileiro',
  'Solana'
];

// GET /api/historico?moeda=Bitcoin
router.get('/', async (req, res) => {
  try {
    const { moeda } = req.query;
    if (!moeda) {
      return res.status(400).json({ error: 'Parâmetro "moeda" é obrigatório.' });
    }

    if (!MOEDAS_VALIDAS.includes(moeda)) {
      return res.status(400).json({ error: 'Moeda inválida ou não suportada.' });
    }
    
    // Busca os últimos 24 registros para a moeda selecionada
    const historico = await airtableService.buscarHistorico(moeda, 24);
    
    // Como os registros vêm com ordenação DESC (mais recentes primeiro),
    // invertemos para o gráfico ficar da esquerda (antigo) para a direita (novo).
    const historicoOrdenado = historico.reverse();
    
    res.json(historicoOrdenado);
  } catch (error) {
    res.status(503).json({ 
      error: 'Serviço Indisponível', 
      message: error.message 
    });
  }
});

module.exports = router;
