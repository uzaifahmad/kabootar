import React, { useState } from "react";
import { RequestBuilder } from "./components/RequestBuilder";
import { ResponseViewer } from "./components/ResponseViewer";
import { CollectionExplorer } from "./components/CollectionExplorer";
import { EnvironmentManager } from "./components/EnvironmentManager";
import { type KabootarRequest, type KabootarResponse, createRequest, executeRequest } from "@kabootar/core";

export function App() {
  const [activeRequest, setActiveRequest] = useState<KabootarRequest>(createRequest());
  const [response, setResponse] = useState<KabootarResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (req: KabootarRequest) => {
    if (!req.url.trim()) {
      setResponse({
        status: 0,
        statusText: "Request Error: Missing URL",
        headers: {},
        body: "Please enter a valid request URL before sending.",
        bodySize: 0,
        timing: { dns: 0, tcp: 0, tls: 0, ttfb: 0, download: 0, total: 0 },
        redirects: [],
      });
      return;
    }

    setIsLoading(true);
    setResponse(null);

    try {
      const result = await executeRequest(req);
      setResponse(result);
    } catch (error) {
      console.error(error);
      setResponse({
        status: 0,
        statusText: "Network Error",
        headers: {},
        body: error instanceof Error ? error.message : String(error),
        bodySize: 0,
        timing: { dns: 0, tcp: 0, tls: 0, ttfb: 0, download: 0, total: 0 },
        redirects: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden select-none text-kabootar-textMain">
      
      {/* Sidebar - Glassmorphism */}
      <div className="w-72 flex flex-col bg-kabootar-panel/60 backdrop-blur-xl border-r border-white/5 shrink-0 shadow-2xl z-10">
        <div className="drag-region h-12 w-full flex items-center justify-center text-xs font-bold text-white/50 tracking-[0.2em] border-b border-white/5">
          KABOOTAR
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden no-drag custom-scrollbar">
          <CollectionExplorer />
        </div>
        <div className="shrink-0 no-drag bg-black/20 backdrop-blur-md">
          <EnvironmentManager />
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-transparent relative">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-kabootar-accent/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="drag-region h-12 w-full shrink-0 flex items-center px-6 border-b border-white/5 bg-kabootar-bg/40 backdrop-blur-md">
          <div className="text-xs font-medium text-white/40 tracking-wider">WORKSPACE / DEFAULT</div>
        </div>
        
        <div className="flex-1 flex flex-col px-8 py-6 min-h-0 no-drag z-0">
          
          {/* Top Half: Request Builder */}
          <div className="flex-1 flex flex-col min-h-0 mb-6">
            <RequestBuilder 
              request={activeRequest} 
              onChange={setActiveRequest}
              onSend={() => handleSend(activeRequest)}
              isLoading={isLoading}
            />
          </div>

          {/* Bottom Half: Response Viewer */}
          <div className="flex-1 flex flex-col min-h-0 pt-4 border-t border-kabootar-border">
            <ResponseViewer response={response} isLoading={isLoading} />
          </div>

        </div>
      </div>

    </div>
  );
}
