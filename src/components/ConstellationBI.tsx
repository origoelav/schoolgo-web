import React, { useRef, useEffect, useState, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

interface ConstellationBIProps {
  width?: number;
  height?: number;
}

const ConstellationBI: React.FC<ConstellationBIProps> = ({ width, height }) => {
  const fgRef = useRef<any>();
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        setContainerSize({
          width: entries[0].contentRect.width,
          height: entries[0].contentRect.height
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const graphData = useMemo(() => {
    const nodes: any[] = [];
    const links: any[] = [];
    
    // Master Node
    nodes.push({ id: 'master', name: 'Plataforma OrigGo', val: 30, color: '#FACC15', group: 'master' });

    const frotistasCount = 5;
    
    for (let i = 1; i <= frotistasCount; i++) {
       const fId = `frotista_${i}`;
       nodes.push({ id: fId, name: `Frotista ${i}`, val: 15, color: '#4B6BFB', group: 'frotista' });
       links.push({ source: 'master', target: fId, color: 'rgba(75, 107, 251, 0.4)' });

       const motoristasCount = Math.floor(Math.random() * 3) + 2;
       for (let m = 1; m <= motoristasCount; m++) {
          const mId = `motorista_${i}_${m}`;
          nodes.push({ id: mId, name: `Veículo ${i}-${m}`, val: 8, color: '#10b981', group: 'motorista' });
          links.push({ source: fId, target: mId, color: 'rgba(16, 185, 129, 0.4)' });

          const alunosCount = Math.floor(Math.random() * 8) + 5;
          for (let a = 1; a <= alunosCount; a++) {
             const aId = `aluno_${i}_${m}_${a}`;
             nodes.push({ id: aId, name: `Aluno`, val: 3, color: '#ffffff', group: 'aluno' });
             links.push({ source: mId, target: aId, color: 'rgba(255, 255, 255, 0.1)' });
          }
       }
    }

    return { nodes, links };
  }, []);

  useEffect(() => {
    // Adiciona uma força de repulsão suave para a constelação espalhar bem
    if (fgRef.current) {
       fgRef.current.d3Force('charge').strength(-50);
       fgRef.current.d3Force('link').distance(40);
    }
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative bg-[#0a0f18] rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-school-blue">Rede de Conexões</h3>
        <p className="text-xl font-black text-white italic tracking-tighter">Constelação OrigGo</p>
        <div className="flex flex-col gap-2 mt-4">
           <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-school-yellow" /> <span className="text-[9px] text-white/50 uppercase font-bold tracking-widest">Master</span></div>
           <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-school-blue" /> <span className="text-[9px] text-white/50 uppercase font-bold tracking-widest">Frotistas</span></div>
           <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /> <span className="text-[9px] text-white/50 uppercase font-bold tracking-widest">Motoristas</span></div>
           <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-white" /> <span className="text-[9px] text-white/50 uppercase font-bold tracking-widest">Alunos</span></div>
        </div>
      </div>
      
      {(containerSize.width > 0 && containerSize.height > 0) && (
        <ForceGraph2D
          ref={fgRef}
          width={width || containerSize.width}
          height={height || containerSize.height}
          graphData={graphData}
          nodeLabel="name"
          nodeColor={node => (node as any).color}
          nodeRelSize={4}
          linkColor={link => (link as any).color}
          linkWidth={1}
          linkDirectionalParticles={2}
          linkDirectionalParticleWidth={1.5}
          linkDirectionalParticleSpeed={0.005}
          backgroundColor="transparent"
        />
      )}
    </div>
  );
};

export default ConstellationBI;
