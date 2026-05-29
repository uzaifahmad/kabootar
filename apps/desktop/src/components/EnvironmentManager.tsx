import React from "react";
import { Settings, Server, EyeOff, Eye } from "lucide-react";

export function EnvironmentManager() {
  const [showSecret, setShowSecret] = React.useState(false);

  return (
    <div className="border-t border-kabootar-border bg-kabootar-panel p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-kabootar-textMuted uppercase tracking-wider">
          <Server className="w-4 h-4" />
          Environment
        </div>
        <Settings className="w-4 h-4 text-kabootar-textMuted cursor-pointer hover:text-kabootar-textMain transition-colors" />
      </div>
      
      <div className="w-full bg-kabootar-bg border border-kabootar-border rounded-md px-3 py-2 flex items-center justify-between cursor-pointer hover:border-kabootar-textMuted transition-colors">
        <span className="text-sm font-medium text-kabootar-accent">Production</span>
        <div className="w-2 h-2 rounded-full bg-kabootar-get shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="text-[10px] text-kabootar-textMuted font-mono w-16 truncate">API_URL</div>
          <div className="text-xs text-kabootar-textMain truncate flex-1">api.kabootar.dev</div>
        </div>
        <div className="flex items-center gap-2 group">
          <div className="text-[10px] text-kabootar-textMuted font-mono w-16 truncate">API_KEY</div>
          <div className="text-xs text-kabootar-textMuted flex-1 flex items-center justify-between">
            {showSecret ? "sk_live_9a8b7c6d5e" : "••••••••••••••••"}
            <div 
              className="opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
              onClick={() => setShowSecret(!showSecret)}
            >
              {showSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
