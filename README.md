# MoedaFlow 🚀

MoedaFlow é uma plataforma moderna e responsiva de monitoramento financeiro em tempo real. O sistema acompanha cotações de criptomoedas e moedas fiduciárias, gera alertas automáticos de volatilidade no banco de dados e exibe um feed contínuo das notícias mais quentes do mercado.

## 🌟 Funcionalidades

- **Dashboard Interativo:** Painel construído com React e TailwindCSS, utilizando efeitos de *Glassmorphism* (design translúcido e elegante).
- **Cotações em Tempo Real:** Acompanhamento de moedas como Bitcoin, Ethereum, Solana, Dólar e Euro, consumindo dados do CoinGecko e AwesomeAPI.
- **Gráficos Históricos:** Visualização clara das oscilações de mercado e histórico de variação.
- **Painel de Alertas Automáticos:** Detecção contínua de variações de preço, salvando e listando registros críticos diretamente no Airtable.
- **Notificações via Webhook:** Envio automático de mensagens para Slack ou Discord em caso de oscilações críticas do mercado.
- **Destaques do Mercado:** Um carrossel automatizado (slider) de notícias do mundo cripto e financeiro (via CoinTelegraph), 100% imune a bloqueios de CORS e sem necessidade de API Keys.
- **Sincronização Background (Cron Job):** Um worker automatizado no backend roda periodicamente para atualizar as cotações e popular o histórico e os alertas no banco de dados de forma autônoma.
- **Segurança Robusta:** Implementação de políticas de proteção contra abusos, incluindo *Rate Limiting*, CORS estrito e validação de inputs (leia o arquivo `SECURITY.md` para mais detalhes).

## 🛠 Tecnologias Utilizadas

**Frontend:**
- React (via Vite)
- TailwindCSS (Estilização e animações avançadas)
- Recharts (Construção dos gráficos)

**Backend:**
- Node.js & Express
- Axios (Consumo de APIs externas e feeds RSS)
- node-cron (Agendamento de tarefas em background)
- express-rate-limit & cors (Segurança e controle)

**Banco de Dados / BaaS:**
- Airtable (Armazenamento histórico de cotações e sistema de logs de alertas)

## ⚙️ Como Executar o Projeto

### Pré-requisitos
- Node.js (v18+)
- Conta no [Airtable](https://airtable.com/) para obter as credenciais de acesso ao banco de dados.

### 1. Configuração de Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto e insira as seguintes variáveis essenciais:
```env
PORT=3000
FRONTEND_URL=http://localhost:5173
AIRTABLE_TOKEN=seu_token_de_acesso_pessoal_do_airtable
AIRTABLE_BASE_ID=seu_id_da_base_do_airtable
WEBHOOK_URL=sua_url_de_webhook_discord_ou_slack
```

### 2. Rodando o Backend (API e Cron Jobs)
Abra um terminal, acesse a pasta do backend e inicie o serviço:
```bash
cd backend
npm install
npm start
```
O servidor iniciará na porta `3000` (ou na porta definida no seu `.env`) e o agendador de tarefas começará a monitorar o mercado imediatamente.

### 3. Rodando o Frontend (Interface)
Abra outro terminal, acesse a pasta do frontend e inicie a aplicação:
```bash
cd frontend
npm install
npm run dev
```
Acesse a aplicação no navegador pela URL fornecida pelo Vite (ex: `http://localhost:5173`).

## 🚀 Deploy / Hospedagem

A aplicação está hospedada e disponível online nos seguintes serviços:
- **Frontend:** Hospedado no Vercel
- **Backend:** Hospedado no Render

🔗 **Link da Aplicação:** [https://moedaflow-app.vercel.app/](https://moedaflow-app.vercel.app/)

## 📚 Arquitetura Resumida
A aplicação foi estruturada separando as responsabilidades. O **Backend** age como uma ponte segura, gerenciando o banco de dados e mascarando chaves (Proxy Pattern para contornar problemas de CORS no frontend). O **Frontend** foi focado unicamente na experiência de usuário (UX) fluida, com atualizações de interface que não travam a navegação.

---
*Projeto desenvolvido para fins educacionais e de apresentação acadêmica.*
