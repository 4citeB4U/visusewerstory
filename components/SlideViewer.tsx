
import React from "react";
import { DataSources, SlideDefinition } from "../types";
import { ChartRouter } from "./ChartRouter";

interface SlideViewerProps {
  slide: SlideDefinition;
  dataSources: DataSources;
  isSpeaking: boolean;
}

export const SlideViewer: React.FC<SlideViewerProps> = ({ slide, dataSources, isSpeaking }) => {
  return (
    <div 
      key={slide.id} 
      className="h-full w-full flex flex-col lg:flex-row gap-4 lg:gap-8 items-stretch lg:items-center justify-center overflow-hidden lg:overflow-visible"
    >
      
      {/* Left Side: Narration / Text Context */}
      <div className="lg:w-5/12 flex flex-col space-y-4 lg:space-y-6 animate-[fadeIn_0.5s_ease-out] shrink-0 overflow-y-auto lg:max-h-full max-h-[40%] pr-2 custom-scrollbar bg-white/40 text-slate-900 p-6 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border border-white/20 backdrop-blur-xl">
        
        {/* Header Section */}
        <div className="space-y-2 lg:space-y-4 border-l-4 border-orange-600 pl-4 lg:pl-6">
          <div className="flex items-center gap-3">
             <span className="text-orange-800 font-mono text-[10px] lg:text-xs uppercase tracking-widest font-bold">
               {slide.subtitle || "A Visu Sewer Story"}
             </span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-black leading-tight tracking-tight drop-shadow-sm">
            {slide.title}
          </h1>
        </div>

        {/* Main Paragraphs */}
        <div className="space-y-3 lg:space-y-4 text-black text-sm md:text-base lg:text-lg leading-relaxed max-w-prose font-bold shadow-black drop-shadow-sm">
          {slide.narration.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {/* Bullets / Key Takeaways */}
        {slide.narration.bullets.length > 0 && (
           <div className="bg-white/40 p-4 lg:p-6 rounded-lg border border-white/30 shadow-inner">
             <ul className="space-y-2 lg:space-y-3">
               {slide.narration.bullets.map((b, i) => (
                 <li key={i} className="flex items-start gap-2 lg:gap-3 text-xs lg:text-base text-slate-950 font-bold">
                   <span className="mt-1.5 lg:mt-2 w-1.5 h-1.5 rounded-full bg-orange-600 shrink-0 shadow-sm" />
                   <span>{b}</span>
                 </li>
               ))}
             </ul>
           </div>
        )}
      </div>

      {/* Right Side: Visualization Stage */}
      <div className="flex-1 w-full h-[350px] lg:h-full min-h-[300px] relative animate-[slideUp_0.5s_ease-out_0.1s_both]">
         <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 to-slate-950/80 rounded-2xl border border-slate-700/50 shadow-2xl overflow-auto flex flex-col backdrop-blur-sm">
            
            {/* Visual Header */}
            <div className="h-8 bg-slate-950/50 border-b border-slate-800 flex items-center px-4 justify-end gap-2 shrink-0">
                <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-slate-700'}`}></div>
                <div className="w-2 h-2 rounded-full bg-slate-700"></div>
            </div>

            {/* Chart/Content Container */}
            <div className="flex-1 relative p-2 lg:p-6 bg-slate-900/30 overflow-auto">
                <ChartRouter slide={slide} dataSources={dataSources} isSpeaking={isSpeaking} />
            </div>

            {/* Decorative Overlay */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500/0 via-orange-500/50 to-orange-500/0 opacity-50 pointer-events-none"></div>
         </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(203, 213, 225, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(15, 23, 42, 0.8);
        }
      `}</style>
    </div>
  );
};
