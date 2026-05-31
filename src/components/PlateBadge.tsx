import React from 'react';

const isMercosul = (plate: string): boolean => {
  if (!plate) return false;
  const clean = plate.replace(/[^a-zA-Z0-9]/g, '');
  if (clean.length < 5) return false;
  return /[a-zA-Z]/.test(clean[4]);
};

export const PlateBadge = ({ plate }: { plate: string | null }) => {
  if (!plate) return null;
  const cleanPlate = plate.toUpperCase().trim();
  if (cleanPlate.length < 7) return null;
  const mercosul = isMercosul(cleanPlate);
  
  if (mercosul) {
    return (
      <div className="inline-flex relative w-[140px] h-[44px] bg-white border-[2.5px] border-slate-950 rounded-[6px] flex-col items-center justify-between overflow-hidden shadow-md select-none shrink-0 my-1">
        {/* Top Blue Strip */}
        <div className="w-full h-[13px] bg-[#003399] flex items-center justify-between px-2 shrink-0 relative">
          {/* Mercosul Stars Logo */}
          <div className="flex items-center gap-[1px]">
            <div className="w-[3px] h-[3px] rounded-full bg-white opacity-80 animate-pulse"></div>
            <div className="w-[4px] h-[4px] rounded-full bg-white opacity-90"></div>
            <div className="w-[3px] h-[3px] rounded-full bg-white opacity-80"></div>
          </div>
          {/* BRASIL Text */}
          <span className="text-white text-[7.5px] font-black tracking-[0.2em] uppercase font-sans leading-none">BRASIL</span>
          {/* Brazil Flag */}
          <div className="w-[12px] h-[8px] bg-green-600 border-[0.5px] border-yellow-400 relative flex items-center justify-center shrink-0">
            <div className="w-[5px] h-[5px] rounded-full bg-blue-800"></div>
          </div>
        </div>
        {/* Plate Number */}
        <div className="flex-1 flex items-center justify-center w-full bg-white">
          <span className="text-[#111111] font-sans font-extrabold text-[20px] tracking-[0.08em] leading-none">{cleanPlate}</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="inline-flex relative w-[140px] h-[44px] bg-[#D9D9D9] border-[2.5px] border-slate-950 rounded-[6px] flex-col items-center justify-between overflow-hidden shadow-md select-none shrink-0 my-1">
      {/* Top Strip */}
      <div className="w-full h-[11px] bg-[#BDBDBD] flex items-center justify-center shrink-0 border-b border-slate-400 relative">
        <span className="text-slate-800 text-[6.5px] font-black tracking-widest uppercase font-sans leading-none">BRASIL</span>
      </div>
      {/* Plate Number */}
      <div className="flex-1 flex items-center justify-center w-full bg-[#E0E0E0]">
        <span className="text-[#111111] font-sans font-extrabold text-[20px] tracking-[0.08em] leading-none">{cleanPlate}</span>
      </div>
    </div>
  );
};
