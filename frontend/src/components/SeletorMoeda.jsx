import React from 'react';

const moedasOpcoes = [
  "Bitcoin",
  "Bitcoin/Real Brasileiro",
  "Dólar Americano/Real Brasileiro",
  "Ethereum",
  "Euro/Real Brasileiro",
  "Solana"
];

const SeletorMoeda = ({ moedaSelecionada, onChange }) => {
  return (
    <div className="relative inline-block w-64">
      <select
        value={moedaSelecionada}
        onChange={(e) => onChange(e.target.value)}
        className="block appearance-none w-full bg-slate-800 border border-slate-700 text-slate-200 py-2.5 px-4 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        <option value="" disabled>Selecione uma moeda</option>
        {moedasOpcoes.map((moeda) => (
          <option key={moeda} value={moeda}>
            {moeda}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
};

export default SeletorMoeda;
