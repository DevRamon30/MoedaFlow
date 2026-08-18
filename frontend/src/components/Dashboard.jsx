import React, { useState } from 'react';
import GraficoHistorico from './GraficoHistorico';
import TabelaCotacoes from './TabelaCotacoes';
import PainelAlertas from './PainelAlertas';
import PainelNoticias from './PainelNoticias';
import SeletorMoeda from './SeletorMoeda';

const Dashboard = () => {
  const [moedaSelecionada, setMoedaSelecionada] = useState('Bitcoin');

  return (
    <div className="space-y-6">
      {/* Header do Dashboard */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 glass-panel p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 mb-1">Visão Geral</h2>
          <p className="text-slate-400 text-sm">Acompanhe as variações em tempo real.</p>
        </div>
        <SeletorMoeda moedaSelecionada={moedaSelecionada} onChange={setMoedaSelecionada} />
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GraficoHistorico moedaSelecionada={moedaSelecionada} />
          <TabelaCotacoes />
          <PainelNoticias />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <PainelAlertas />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
