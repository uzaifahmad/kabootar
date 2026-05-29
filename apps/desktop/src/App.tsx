import React, { useState } from "react";
import { RequestBuilder } from "./components/RequestBuilder";
import { ResponseViewer } from "./components/ResponseViewer";
import { CollectionExplorer } from "./components/CollectionExplorer";
import { EnvironmentManager } from "./components/EnvironmentManager";
import { type KabootarRequest, type KabootarResponse, createRequest } from "@kabootar/core";

export function App() {
    const [activeRequest, setActiveRequest] = useState<KabootarRequest>(createRequest());
    const [response, setResponse] = useState<KabootarResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async (req: KabootarRequest) => {
        setIsLoading(true);
        setResponse(null);
        try {
            // In a real app, this would use the request-engine via IPC or native rust sidecar
            // For this UI scaffolding, we simulate a response
            setTimeout(() => {
                setResponse({
                    status: 200,
                    statusText: "OK",
                    headers: {
                        "content-type": "application/json",
                        "server": "kabootar-mock"
                    },
                    body: JSON.stringify({ message: "Hello from Kabootar API tester!", url: req.url }, null, 2),
                    bodySize: 154,
                    timing: { dns: 5, tcp: 10, tls: 20, ttfb: 40, download: 5, total: 80 },
                    redirects: []
                });
                setIsLoading(false);
            }, 500);
        } catch (e) {
            console.error(e);
            setIsLoading(false);
        }
    };

    return (
        <div className="app-container">
            <div className="sidebar">
                <div className="drag-region">Kabootar</div>
                <div style={{ flex: 1, overflowY: "auto", padding: "16px 0" }}>
                    <CollectionExplorer />
                </div>
                <EnvironmentManager />
            </div>

            <div className="main-content">
                <div className="drag-region" style={{ backgroundColor: "var(--bg-primary)" }}></div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0 24px 24px" }}>

                    {/* Top Half: Request Builder */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, marginBottom: 24 }}>
                        <RequestBuilder
                            request={activeRequest}
                            onChange={setActiveRequest}
                            onSend={() => handleSend(activeRequest)}
                            isLoading={isLoading}
                        />
                    </div>

                    {/* Bottom Half: Response Viewer */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, borderTop: "1px solid var(--border-subtle)", paddingTop: 24 }}>
                        <ResponseViewer response={response} isLoading={isLoading} />
                    </div>

                </div>
            </div>
        </div>
    );
}
