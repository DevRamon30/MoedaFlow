const express = require('express');
const router = express.Router();

const airtableService = require('../services/airtableService');

// GET /api/alertas
router.get('/', async (req, res) => {
  try {
    const alertas = await airtableService.buscarAlertas(20);
    res.json(alertas);
  } catch (error) {
    res.status(503).json({ 
      error: 'Serviço Indisponível', 
      message: error.message 
    });
  }
});

module.exports = router;
