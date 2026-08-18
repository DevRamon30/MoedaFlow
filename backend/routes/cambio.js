const express = require('express');
const router = express.Router();

const awesomeApiService = require('../services/awesomeApiService');

// GET /api/cambio
router.get('/', async (req, res) => {
  try {
    const cotacoes = await awesomeApiService.getCotacoes();
    res.json(cotacoes);
  } catch (error) {
    res.status(503).json({ 
      error: 'Serviço Indisponível', 
      message: error.message 
    });
  }
});

module.exports = router;
