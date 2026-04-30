"use client";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  label: string;
}

export const FeatureCard = ({ title, description, icon, label }: FeatureCardProps) => {
  return (
    <div className="glass-card p-8 flex flex-col items-start text-left relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
        {icon}
      </div>
      
      <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-tertiary mb-4">
        {label}
      </div>
      
      <h3 className="text-xl font-space font-bold text-white mb-4 uppercase tracking-tight">
        {title}
      </h3>
      
      <p className="text-brand-secondary text-sm leading-relaxed font-inter">
        {description}
      </p>

      <div className="mt-8 pt-6 border-t border-white/5 w-full">
        <button className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-primary flex items-center gap-2 group-hover:gap-3 transition-all">
          Learn More <span>→</span>
        </button>
      </div>
    </div>
  );
};
