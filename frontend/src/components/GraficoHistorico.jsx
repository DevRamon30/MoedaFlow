import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Brush } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 border border-cyan-500/30 p-3 rounded-lg shadow-[0_0_15px_rgba(34,211,238,0.2)] backdrop-blur-md">
        <p className="text-cyan-400 font-mono text-xs mb-1">{label}</p>
        <p className="text-slate-100 font-semibold tabular-nums text-lg">
          R$ {Number(payload[0].value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
        </p>
      </div>
    );
  }
  return null;
};

const GraficoHistorico = ({ moedaSelecionada }) => {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistorico = async (isPolling = false) => {
      if (!isPolling) setLoading(true);
      setError(null);
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${API_URL}/api/historico?moeda=${encodeURIComponent(moedaSelecionada)}`);
        if (!response.ok) {
          throw new Error('Falha ao buscar histórico');
        }
        const registros = await response.json();
        
        // Inverte a ordem para o gráfico ir do mais antigo para o mais novo
        const formatados = registros.reverse().map(reg => {
          const data = new Date(reg.DataHora);
          return {
            time: `${data.getHours().toString().padStart(2, '0')}:${data.getMinutes().toString().padStart(2, '0')}`,
            valor: Number(reg.ValorCompra)
          };
        });
        
        setDados(formatados);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (moedaSelecionada) {
      fetchHistorico();
      
      const interval = setInterval(() => {
        fetchHistorico(true);
      }, 60000); // 60 segundos
      
      return () => clearInterval(interval);
    }
  }, [moedaSelecionada]);

  return (
    <div className="glass-panel p-6 rounded-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          Análise de Tendência
          <span className="text-cyan-500/70 font-normal ml-2 text-sm bg-cyan-900/20 px-2 py-1 rounded-md border border-cyan-800/50">
            {moedaSelecionada}
          </span>
        </h2>
      </div>

      <div className="h-[340px] w-full">
        {loading && (
          <div className="w-full h-full skeleton rounded-xl"></div>
        )}
        
        {error && !loading && (
          <div className="w-full h-full flex items-center justify-center bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            {error}
          </div>
        )}
        
        {!loading && !error && dados.length === 0 && (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-700 rounded-xl bg-slate-800/20">
            <svg className="w-10 h-10 mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="font-mono text-sm">Aguardando dados para {moedaSelecionada}...</span>
          </div>
        )}
        
        {!loading && !error && dados.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dados} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCyan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="time" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} dy={10} />
              <YAxis 
                stroke="#475569" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(val) => `R$ ${val.toLocaleString('pt-BR')}`} 
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#22d3ee', strokeWidth: 1, strokeDasharray: '5 5' }} />
              <Area 
                type="monotone" 
                dataKey="valor" 
                stroke="#22d3ee" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorCyan)" 
                activeDot={{ r: 6, fill: '#020617', stroke: '#22d3ee', strokeWidth: 3, filter: 'url(#glow)' }}
                filter="url(#glow)"
              />
              <Brush dataKey="time" height={30} stroke="#22d3ee" fill="#0f172a" tickFormatter={() => ''} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default GraficoHistorico;
