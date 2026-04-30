"use client";

export const TelemetryDashboard = () => {
  return (
    <section className="py-24 bg-brand-bg relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-primary mb-4">
              Advanced Analytics
            </div>
            <h2 className="text-4xl md:text-5xl font-space font-bold text-white mb-8 tracking-tighter uppercase">
              Real-Time <br />
              <span className="text-brand-tertiary">Telemetry Stream</span>
            </h2>
            <p className="text-brand-secondary mb-8 text-lg leading-relaxed">
              Monitor every parameter of your mission with millisecond precision. 
              Our distributed telemetry engine provides instant feedback from the edge.
            </p>
            
            <ul className="space-y-4">
              {[
                "Distributed Event Processing",
                "Sub-millisecond Latency",
                "Automated Anomaly Detection",
                "Infinite Horizontal Scaling"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-white font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-tertiary glow-primary"></div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="glass rounded-brand-lg p-6 border-white/5 bg-white/[0.02]">
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-[10px] font-bold tracking-widest text-white uppercase">Live Feed: Omega-7</span>
              </div>
              <div className="text-[10px] font-bold tracking-widest text-brand-secondary uppercase">
                Uptime: 99.999%
              </div>
            </div>

            <div className="space-y-4">
              {[
                { label: "CPU Load", val: "24%", color: "bg-brand-tertiary" },
                { label: "Memory", val: "68%", color: "bg-brand-primary" },
                { label: "I/O Speed", val: "92%", color: "bg-green-400" },
                { label: "Temp", val: "42°C", color: "bg-orange-400" }
              ].map((stat, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[10px] font-bold text-brand-secondary uppercase mb-1">
                    <span>{stat.label}</span>
                    <span>{stat.val}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${stat.color} transition-all duration-1000 ease-out`}
                      style={{ width: stat.val }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-brand-sm border border-white/5">
                <div className="text-[8px] font-bold text-brand-secondary uppercase mb-1">Requests/Sec</div>
                <div className="text-xl font-space font-bold text-white">12,482</div>
              </div>
              <div className="p-4 bg-white/5 rounded-brand-sm border border-white/5">
                <div className="text-[8px] font-bold text-brand-secondary uppercase mb-1">Active Nodes</div>
                <div className="text-xl font-space font-bold text-white">256</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
