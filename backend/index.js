const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração de CORS estrito (Whitelist)
const corsOptions = {
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:5174'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Configuração de Rate Limiting (Proteção contra Abuso/DDoS)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 requisições por IP
  message: { error: 'Muitas requisições deste IP. Tente novamente após 15 minutos.' }
});
app.use('/api/', apiLimiter);

app.use(express.json());

// Importação das rotas
const cambioRoutes = require('./routes/cambio');
const criptoRoutes = require('./routes/cripto');
const alertasRoutes = require('./routes/alertas');
const historicoRoutes = require('./routes/historico');
const noticiasRoutes = require('./routes/noticias');

// Definição das rotas
app.use('/api/cambio', cambioRoutes);
app.use('/api/cripto', criptoRoutes);
app.use('/api/alertas', alertasRoutes);
app.use('/api/historico', historicoRoutes);
app.use('/api/noticias', noticiasRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Bem-vindo à API do MoedaFlow!' });
});

const syncCotacoes = require('./jobs/syncCotacoes');

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  // Inicia o job agendado ao ligar o servidor
  syncCotacoes.startSyncJob();
});
