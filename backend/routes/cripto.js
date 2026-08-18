const express = require('express');
const router = express.Router();

const coinGeckoService = require('../services/coinGeckoService');

// GET /api/cripto
router.get('/', async (req, res) => {
  try {
    const cotacoes = await coinGeckoService.getCotacoes();
    res.json(cotacoes);
  } catch (error) {
    res.status(503).json({ 
      error: 'Serviço Indisponível', 
      message: error.message 
    });
  }
});

module.exports = router;
