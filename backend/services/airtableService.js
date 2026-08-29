const axios = require('axios');

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const TABLE_NAME = 'HistoricoCotacoes';
const TABLE_ALERTAS = 'Alertas';

// Configuração do Axios para a REST API do Airtable (Histórico)
const airtableApi = axios.create({
  baseURL: `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${TABLE_NAME}`,
  headers: {
    'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Configuração do Axios para a REST API do Airtable (Alertas)
const airtableApiAlertas = axios.create({
  baseURL: `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${TABLE_ALERTAS}`,
  headers: {
    'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

/**
 * Estrutura da tabela HistoricoCotacoes esperada no Airtable:
 * - Moeda (texto - Single line text)
 * - Tipo (select - Single select: "cambio" ou "cripto")
 * - ValorCompra (número - Number, format decimal)
 * - ValorVenda (número - Number, format decimal)
 * - VariacaoPercentual (número - Number, format decimal)
 * - DataHora (data/hora - Date with time, ISO 8601 format)
 */

async function salvarCotacao(dados) {
  try {
    const payload = {
      fields: {
        "Moeda": dados.moeda,
        "Tipo": dados.tipo, // 'cambio' ou 'cripto'
        "ValorCompra": Number(dados.valorCompra) || 0,
        "ValorVenda": Number(dados.valorVenda) || 0,
        "VariacaoPercentual": Number(dados.variacaoPercentual) || 0,
        "DataHora": dados.dataHora
      },
      typecast: true
    };

    const response = await airtableApi.post('/', payload);
    return response.data;
  } catch (error) {
    tratarErroAirtable(error, 'Erro ao salvar cotação no Airtable');
  }
}

async function buscarHistorico(moeda, limite = 10) {
  try {
    const response = await airtableApi.get('/', {
      params: {
        filterByFormula: `{Moeda} = '${moeda}'`,
        sort: [{ field: "DataHora", direction: "desc" }],
        maxRecords: limite
      }
    });

    return response.data.records.map(record => ({
      id: record.id,
      ...record.fields
    }));
  } catch (error) {
    tratarErroAirtable(error, 'Erro ao buscar histórico no Airtable');
  }
}

async function salvarAlerta(alerta) {
  try {
    const payload = {
      fields: {
        "Moeda": alerta.moeda,
        "VariacaoDetectada": Number(alerta.variacao) || 0,
        "Mensagem": alerta.mensagem,
        "DataHora": alerta.dataHora
      },
      typecast: true
    };

    const response = await airtableApiAlertas.post('/', payload);
    return response.data;
  } catch (error) {
    tratarErroAirtable(error, 'Erro ao salvar alerta no Airtable');
  }
}

async function buscarAlertas(limite = 20) {
  try {
    const response = await airtableApiAlertas.get('/', {
      params: {
        sort: [{ field: "DataHora", direction: "desc" }],
        maxRecords: limite
      }
    });

    return response.data.records.map(record => ({
      id: record.id,
      ...record.fields
    }));
  } catch (error) {
    tratarErroAirtable(error, 'Erro ao buscar alertas no Airtable');
  }
}

function tratarErroAirtable(error, mensagemContexto) {
  if (error.response) {
    const status = error.response.status;
    const errorType = error.response.data?.error?.type;
    
    // Tratamento de erro sem expor o token
    if (status === 401) {
      console.error(`[Airtable] ${mensagemContexto}: Token de acesso inválido ou não fornecido. Verifique AIRTABLE_TOKEN.`);
    } else if (status === 404) {
      console.error(`[Airtable] ${mensagemContexto}: Base ou Tabela não encontrada. Verifique AIRTABLE_BASE_ID e se a tabela "${TABLE_NAME}" existe.`);
    } else {
      console.error(`[Airtable] ${mensagemContexto}: HTTP STATUS ${status} - Tipo: ${errorType}`);
    }
  } else {
    console.error(`[Airtable] ${mensagemContexto}: Erro de rede.`, error.message);
  }
  
  throw new Error('Falha de persistência no banco de dados. Verifique os logs do servidor para mais detalhes.');
}

async function limparRegistrosAntigos(horas = 24) {
  try {
    const dataLimite = new Date(Date.now() - horas * 60 * 60 * 1000).toISOString();
    let deletadosTotal = 0;
    
    // Função auxiliar para deletar de uma tabela específica
    const limparTabela = async (api, nomeTabela) => {
      const response = await api.get('/', {
        params: {
          filterByFormula: `IS_BEFORE({DataHora}, '${dataLimite}')`,
          maxRecords: 100 // Remove de 100 em 100 para evitar timeout
        }
      });

      const records = response.data.records;
      if (!records || records.length === 0) {
        return 0;
      }

      const ids = records.map(r => r.id);
      let deletados = 0;

      // A API do Airtable exige que a exclusão em lote seja de no máximo 10 registros por requisição
      for (let i = 0; i < ids.length; i += 10) {
        const lote = ids.slice(i, i + 10);
        const query = lote.map(id => `records[]=${id}`).join('&');
        await api.delete(`/?${query}`);
        deletados += lote.length;
      }
      
      console.log(`[Airtable] Auto-Limpeza (${nomeTabela}): ${deletados} registros mais antigos que ${horas}h apagados.`);
      return deletados;
    };

    // Limpa Histórico
    deletadosTotal += await limparTabela(airtableApi, 'HistoricoCotacoes');
    
    // Limpa Alertas
    deletadosTotal += await limparTabela(airtableApiAlertas, 'Alertas');

    return deletadosTotal;
  } catch (error) {
    console.error('[Airtable] Falha na auto-limpeza de registros antigos:', error.response?.data || error.message);
    return 0;
  }
}

module.exports = {
  salvarCotacao,
  buscarHistorico,
  salvarAlerta,
  buscarAlertas,
  limparRegistrosAntigos
};
