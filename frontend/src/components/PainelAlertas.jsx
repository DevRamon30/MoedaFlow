import React, { useState, useEffect } from 'react';

const getRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'agora mesmo';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `há ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `há ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `há ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`;
};

const PainelAlertas = () => {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlertas = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${API_URL}/api/alertas`);
        if (!response.ok) {
          throw new Error('Falha ao carregar alertas');
        }
        const data = await response.json();
        setAlertas(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAlertas();
  }, []);

  return (
    <div className="glass-panel p-6 rounded-2xl h-full">
      <div className="flex items-center gap-2 mb-6">
        <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <h2 className="text-lg font-semibold text-slate-100">Painel de Alertas</h2>
      </div>
      
      {loading && (
        <div className="space-y-4">
          <div className="h-16 w-full skeleton rounded-xl"></div>
          <div className="h-16 w-full skeleton rounded-xl"></div>
        </div>
      )}

      {error && !loading && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          Erro: {error}
        </div>
      )}
      
      {!loading && !error && alertas.length === 0 && (
        <div className="flex flex-col items-center justify-center text-slate-500 h-32 border border-dashed border-slate-700 rounded-xl">
          <svg className="w-8 h-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Nenhum alerta recente</span>
        </div>
      )}

      {!loading && !error && alertas.length > 0 && (
        <ul className="space-y-3">
          {alertas.map((alerta) => {
            const variacao = alerta.VariacaoDetectada || 0;
            const isPositive = variacao > 0;
            const relativeTime = getRelativeTime(alerta.DataHora);
            
            return (
              <li key={alerta.id} className={`flex flex-col gap-1 p-4 rounded-xl border relative overflow-hidden transition-all hover:scale-[1.02] ${isPositive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.15)]'}`}>
                {/* Glow effect on the edge */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${isPositive ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-red-400 shadow-[0_0_10px_#f87171]'}`}></div>
                
                <div className="flex justify-between items-start gap-4 pl-2">
                  <span className="font-medium text-sm leading-snug">
                    {alerta.Mensagem || `${alerta.Moeda} variou ${variacao.toFixed(2)}%`}
                  </span>
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold tabular-nums border ${isPositive ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-red-500/20 border-red-500/30'}`}>
                    {variacao > 0 ? '+' : ''}{variacao.toFixed(1)}%
                  </span>
                </div>
                {relativeTime && (
                  <span className="text-xs opacity-60 mt-1 pl-2 font-mono flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {relativeTime}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default PainelAlertas;
