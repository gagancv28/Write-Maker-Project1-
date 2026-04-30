"use client";

import Link from "next/link";

export const Hero = () => {
  return (
    <section className="relative pt-20 pb-32 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-brand-primary/10 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-brand-tertiary/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-tertiary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-tertiary"></span>
          </span>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-tertiary">Mission Control Active</span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-space font-bold text-white mb-6 tracking-tighter leading-none">
          Accelerate Into <br />
          <span className="text-brand-primary glow-text-primary">The Future</span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-brand-secondary mb-12 font-inter leading-relaxed">
          The next generation mission management platform. Engineered for precision, 
          built for scale, and designed for the visionaries of tomorrow.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/register" 
            className="w-full sm:w-auto px-8 py-4 bg-brand-primary text-brand-bg font-bold rounded-brand-sm glow-primary hover:scale-105 transition-all text-sm tracking-widest uppercase"
          >
            Launch System
          </Link>
          <button className="w-full sm:w-auto px-8 py-4 glass text-white font-bold rounded-brand-sm hover:bg-white/10 transition-all text-sm tracking-widest uppercase">
            View Telemetry
          </button>
        </div>

        {/* Floating Glass HUD Card */}
        <div className="mt-24 relative max-w-5xl mx-auto">
          <div className="glass rounded-brand-lg p-1 border-white/10 shadow-2xl overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-primary to-transparent opacity-50"></div>
            <div className="bg-brand-bg/80 rounded-[7px] overflow-hidden aspect-video relative flex items-center justify-center">
              {/* Mock UI Content */}
              <div className="absolute inset-0 flex flex-col p-8 text-left">
                <div className="flex justify-between items-start mb-12">
                  <div>
                    <div className="text-[10px] text-brand-tertiary font-bold tracking-widest uppercase mb-1">System Status</div>
                    <div className="text-2xl font-space font-bold text-white uppercase">Operational</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-brand-secondary font-bold tracking-widest uppercase mb-1">Latency</div>
                    <div className="text-2xl font-space font-bold text-brand-tertiary">4.2ms</div>
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="w-full h-24 relative">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 400 100">
                      <path 
                        d="M0,50 Q20,30 40,60 T80,40 T120,70 T160,20 T200,50 T240,30 T280,60 T320,40 T360,70 T400,20" 
                        fill="none" 
                        stroke="#00dbe9" 
                        strokeWidth="2"
                        className="animate-[dash_10s_linear_infinite]"
                        strokeDasharray="1000"
                        strokeDashoffset="1000"
                        style={{animation: 'dash 3s ease-in-out forwards'}}
                      />
                    </svg>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-brand-secondary tracking-widest uppercase mt-4">
                    <span>Alpha-01</span>
                    <span>Beta-02</span>
                    <span>Gamma-03</span>
                    <span>Delta-04</span>
                  </div>
                </div>
              </div>
              <div className="text-white/10 font-space font-bold text-9xl select-none">ASTRA</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes dash {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </section>
  );
};
