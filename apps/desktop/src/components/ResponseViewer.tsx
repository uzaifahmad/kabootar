import React, { useMemo, useState } from "react";
import { Clock, HardDrive, CheckCircle2, AlertCircle } from "lucide-react";
import type { KabootarResponse } from "@kabootar/core";

interface Props {
  response: KabootarResponse | null;
  isLoading: boolean;
}

const TABS = ["Body", "Headers", "Test Results"] as const;

type ResponseTab = (typeof TABS)[number];

export function ResponseViewer({ response, isLoading }: Props) {
  const [activeTab, setActiveTab] = useState<ResponseTab>("Body");

  const formattedBody = useMemo(() => {
    if (!response) return "";
    try {
      const parsed = JSON.parse(response.body);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return response.body;
    }
  }, [response]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-kabootar-textMuted space-y-4">
        <div className="w-8 h-8 border-4 border-kabootar-border border-t-kabootar-accent rounded-full animate-spin" />
        <div className="text-sm font-medium animate-pulse">Awaiting response...</div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center bg-black/20 backdrop-blur-md p-10 rounded-2xl border border-white/5 shadow-2xl">
          <div className="text-5xl mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">🚀</div>
          <div className="text-white/50 text-sm font-medium">Enter a URL and hit send to get a response</div>
        </div>
      </div>
    );
  }

  const isSuccess = response.status >= 200 && response.status < 300;
  const statusColorClass = isSuccess ? "text-kabootar-get" : "text-kabootar-delete";
  const StatusIcon = isSuccess ? CheckCircle2 : AlertCircle;

  return (
    <div className="flex flex-col h-full bg-transparent">
      <div className="flex items-center gap-6 mb-4 px-2 text-xs font-medium">
        <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full border border-white/5 shadow-inner">
          <StatusIcon className={`w-4 h-4 ${statusColorClass}`} />
          <span className="text-white/50">Status:</span>
          <span className={`${statusColorClass} font-bold text-sm tracking-wide`}>
            {response.status} {response.statusText}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-kabootar-textMuted" />
          <span className="text-kabootar-textMuted">Time:</span>
          <span className="text-kabootar-textMain font-mono">{response.timing.total.toFixed(0)} ms</span>
        </div>

        <div className="flex items-center gap-1.5">
          <HardDrive className="w-4 h-4 text-kabootar-textMuted" />
          <span className="text-kabootar-textMuted">Size:</span>
          <span className="text-kabootar-textMain font-mono">{(response.bodySize / 1024).toFixed(2)} KB</span>
        </div>
      </div>

      <div className="flex border-b border-white/10 gap-4 px-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm transition-colors relative ${
              activeTab === tab
                ? "text-white font-semibold border-b-2 border-kabootar-accent"
                : "text-white/50 font-medium border-b-2 border-transparent hover:text-white hover:border-white/20"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 mt-6 bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="h-10 bg-white/5 border-b border-white/5 flex items-center px-4 gap-4 text-xs font-medium text-white/50 justify-between shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-white bg-white/10 px-3 py-1 rounded-md shadow-inner">JSON</span>
            <span className="cursor-pointer hover:text-white transition-colors">Raw</span>
            <span className="cursor-pointer hover:text-white transition-colors">Preview</span>
          </div>
          <div className="cursor-pointer hover:text-white transition-colors">Copy to Clipboard</div>
        </div>

        <div className="flex-1 overflow-auto p-5 custom-scrollbar">
          {activeTab === "Body" && (
            <pre className="text-[13px] font-mono leading-relaxed m-0 text-white whitespace-pre-wrap break-words">
              <code className="text-[#86efac]">{formattedBody || "(empty response body)"}</code>
            </pre>
          )}

          {activeTab === "Headers" && (
            <div className="space-y-3">
              {Object.keys(response.headers).length === 0 ? (
                <div className="text-sm text-white/50">No headers returned.</div>
              ) : (
                <div className="grid gap-2 text-sm text-white/80">
                  {Object.entries(response.headers).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-[160px_1fr] gap-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                      <span className="text-white/60">{key}</span>
                      <span className="text-white break-all">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "Test Results" && (
            <div className="text-sm text-white/60">
              Test result integration is coming soon. The response body and headers are available now.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
