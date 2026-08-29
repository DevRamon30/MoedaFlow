import React, { useState, useEffect } from 'react';

const TabelaCotacoes = () => {
  const [cotacoes, setCotacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchCotacoes = async (isPolling = false) => {
    if (!isPolling) setLoading(true);
    setError(null);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const [resCambio, resCripto] = await Promise.all([
        fetch(`${API_URL}/api/cambio`).catch(() => ({ ok: false })),
        fetch(`${API_URL}/api/cripto`).catch(() => ({ ok: false }))
      ]);

      let dataCambio = [];
      let dataCripto = [];

      if (resCambio.ok) dataCambio = await resCambio.json();
      if (resCripto.ok) dataCripto = await resCripto.json();

      if (!resCambio.ok && !resCripto.ok) {
        throw new Error('Falha ao buscar cotações do servidor (Limite de acessos ou serviço fora do ar)');
      }

      const todasCotacoes = [...dataCambio, ...dataCripto].sort((a, b) => a.moeda.localeCompare(b.moeda));
      setCotacoes(todasCotacoes);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCotacoes();
    const interval = setInterval(() => {
      fetchCotacoes(true); // isPolling = true, don't show full loading skeleton
    }, 60000); // 60 segundos
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel p-6 rounded-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-slate-100">Cotações em Tempo Real</h2>
        {lastUpdate && !loading && (
          <span className="text-xs text-slate-400">
            Atualizado às {lastUpdate.toLocaleTimeString()}
          </span>
        )}
      </div>
      
      {loading && (
        <div className="space-y-3 flex flex-col items-center justify-center py-6">
          <div className="animate-pulse flex space-x-2 items-center mb-4">
             <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
             <div className="w-2 h-2 bg-cyan-400 rounded-full opacity-75"></div>
             <div className="w-2 h-2 bg-cyan-400 rounded-full opacity-50"></div>
          </div>
          <p className="text-sm text-cyan-400 animate-pulse text-center">
            Conectando ao servidor...<br/>
            <span className="text-xs text-slate-500">(Pode levar até 50s no primeiro acesso devido à inicialização)</span>
          </p>
          <div className="w-full space-y-3 mt-4">
            <div className="h-10 w-full skeleton rounded-lg opacity-50"></div>
            <div className="h-10 w-full skeleton rounded-lg opacity-50"></div>
            <div className="h-10 w-full skeleton rounded-lg opacity-50"></div>
          </div>
        </div>
      )}
      
      {error && !loading && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          Erro: {error}
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-300">
            <thead className="text-cyan-500/70 border-b border-slate-700/50 uppercase tracking-wider text-xs">
              <tr>
                <th className="py-4 px-4 font-semibold">Moeda</th>
                <th className="py-4 px-4 font-semibold">Valor de Compra</th>
                <th className="py-4 px-4 font-semibold">Valor de Venda</th>
                <th className="py-4 px-4 font-semibold">Variação (24h)</th>
              </tr>
            </thead>
            <tbody>
              {cotacoes.map((cotacao, index) => {
                const variacao = Number(cotacao.variacaoPercentual) || 0;
                const isPositive = variacao >= 0;
                const variacaoSignal = variacao > 0 ? '+' : '';

                return (
                  <tr key={index} className="hover:bg-cyan-900/10 transition-all border-b border-slate-700/30 last:border-0 group relative overflow-hidden">
                    <td className="py-4 px-4 font-medium text-slate-200 group-hover:text-cyan-300 transition-colors relative z-10 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-cyan-400 group-hover:shadow-[0_0_8px_#22d3ee] transition-all"></div>
                      {cotacao.moeda}
                    </td>
                    <td className="py-4 px-4 tabular-nums text-slate-300 group-hover:text-cyan-50 transition-colors relative z-10">R$ {Number(cotacao.valorCompra).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</td>
                    <td className="py-4 px-4 tabular-nums text-slate-300 group-hover:text-cyan-50 transition-colors relative z-10">R$ {Number(cotacao.valorVenda).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</td>
                    <td className="py-4 px-4 tabular-nums font-medium relative z-10">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${isPositive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]'}`}>
                        {variacaoSignal}{variacao.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TabelaCotacoes;
