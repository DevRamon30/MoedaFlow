import React, { useState, useEffect } from 'react';

const PainelNoticias = () => {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchNoticias = async () => {
      try {
        setLoading(true);
        // Consome a API do nosso próprio backend para evitar bloqueios de CORS do navegador
        const response = await fetch('http://localhost:3000/api/noticias');
        if (!response.ok) throw new Error('Falha ao buscar notícias');
        
        const data = await response.json();
        // A API retorna os artigos no array 'items'
        if (data.status !== 'ok') throw new Error('Falha na resposta da API');
        setNoticias(data.items.slice(0, 5));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNoticias();
    // Atualiza as notícias a cada 15 minutos
    const interval = setInterval(fetchNoticias, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Efeito do Slider (Carousel Automático)
  useEffect(() => {
    if (noticias.length <= 1) return;
    const sliderInterval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % noticias.length);
    }, 6000); // Muda de notícia a cada 6 segundos
    return () => clearInterval(sliderInterval);
  }, [noticias.length]);

  const formatarData = (dataString) => {
    const data = new Date(dataString.replace(' ', 'T'));
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="glass-panel p-6 rounded-2xl h-full flex flex-col relative overflow-hidden">
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <svg className="w-5 h-5 text-cyan-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
        </svg>
        <h3 className="text-lg font-semibold text-slate-100">Destaques do Mercado</h3>
      </div>

      <div className="flex-1">
        {loading ? (
          <div className="flex items-center gap-6 animate-pulse">
            <div className="w-32 h-32 bg-slate-700/50 rounded-xl shrink-0"></div>
            <div className="flex-1 space-y-4">
              <div className="h-4 bg-slate-700/50 rounded w-full"></div>
              <div className="h-4 bg-slate-700/50 rounded w-3/4"></div>
              <div className="h-3 bg-slate-700/50 rounded w-1/2 mt-4"></div>
            </div>
          </div>
        ) : error ? (
          <div className="text-red-400/90 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">
            Erro: {error}
          </div>
        ) : noticias.length === 0 ? (
          <div className="text-slate-400 text-sm italic flex items-center justify-center py-8">
            Nenhuma notícia no momento.
          </div>
        ) : (
          <div className="grid">
            {noticias.map((noticia, idx) => (
              <div 
                key={idx} 
                className={`col-start-1 row-start-1 flex items-center gap-6 transition-all duration-700 ease-out ${
                  idx === currentIndex 
                    ? 'opacity-100 translate-x-0 z-10 relative' 
                    : 'opacity-0 translate-x-12 pointer-events-none z-0 absolute'
                }`}
              >
                <div className="w-32 h-32 shrink-0 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(34,211,238,0.15)] border border-cyan-500/30 relative">
                  <img 
                    src={noticia.thumbnail || (noticia.enclosure && noticia.enclosure.link) || 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=200&h=200&fit=crop'} 
                    alt="Notícia"
                    className="w-full h-full object-cover scale-105"
                  />
                </div>
                <div className="flex-1 min-w-0 py-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]"></span>
                    <span className="text-xs font-bold tracking-widest text-cyan-400 uppercase">Plantão</span>
                  </div>
                  <h4 className="text-lg font-medium text-slate-100 line-clamp-2 leading-relaxed">
                    {noticia.title}
                  </h4>
                  <div className="flex items-center text-sm text-slate-400 mt-4 font-mono">
                    <span className="bg-slate-800/50 px-2 py-1 rounded-md border border-slate-700/50">MERCADO</span>
                    <span className="mx-3 text-slate-600">•</span>
                    <span>{formatarData(noticia.pubDate)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Indicadores de Progresso do Slide */}
      {!loading && !error && noticias.length > 0 && (
        <div className="flex justify-center gap-3 mt-6 relative z-10">
          {noticias.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 rounded-full transition-all duration-500 ${
                idx === currentIndex ? 'w-8 bg-cyan-400 shadow-[0_0_8px_#22d3ee]' : 'w-2 bg-slate-700'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PainelNoticias;
