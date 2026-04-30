"use client";

export const Footer = () => {
  return (
    <footer className="py-12 border-t border-white/5 bg-brand-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-brand-sm bg-brand-primary flex items-center justify-center">
              <span className="text-brand-bg font-bold text-[8px]">LP</span>
            </div>
            <span className="text-lg font-space font-bold tracking-tight text-white uppercase">
              LaunchPad
            </span>
          </div>

          <div className="flex gap-8 text-[10px] font-bold tracking-widest text-brand-secondary uppercase">
            <a href="#" className="hover:text-brand-primary transition-colors">Documentation</a>
            <a href="#" className="hover:text-brand-primary transition-colors">API Reference</a>
            <a href="#" className="hover:text-brand-primary transition-colors">Status</a>
          </div>

          <div className="text-[10px] font-bold tracking-widest text-brand-secondary/50 uppercase">
            © 2026 Astra-Digital Systems. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
