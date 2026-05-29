import React from "react";
import type { KabootarResponse } from "@kabootar/core";

interface Props {
    response: KabootarResponse | null;
    isLoading: boolean;
}

export function ResponseViewer({ response, isLoading }: Props) {
    if (isLoading) {
        return (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                <div style={{ animation: "pulse 1.5s infinite" }}>Awaiting response...</div>
            </div>
        );
    }

    if (!response) {
        return (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                Hit send to get a response
            </div>
        );
    }

    const isSuccess = response.status >= 200 && response.status < 300;
    const statusColor = isSuccess ? "var(--get-color)" : "var(--delete-color)";

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            {/* Meta Bar */}
            <div style={{ display: "flex", gap: 24, marginBottom: 16, fontSize: 13 }}>
                <div>
                    <span style={{ color: "var(--text-secondary)" }}>Status: </span>
                    <span style={{ color: statusColor, fontWeight: 600 }}>{response.status} {response.statusText}</span>
                </div>
                <div>
                    <span style={{ color: "var(--text-secondary)" }}>Time: </span>
                    <span style={{ color: "var(--text-primary)" }}>{response.timing.total.toFixed(0)} ms</span>
                </div>
                <div>
                    <span style={{ color: "var(--text-secondary)" }}>Size: </span>
                    <span style={{ color: "var(--text-primary)" }}>{(response.bodySize / 1024).toFixed(2)} KB</span>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid var(--border-subtle)", gap: 24, marginBottom: 16 }}>
                {["Body", "Headers", "Test Results"].map((tab, i) => (
                    <div
                        key={tab}
                        style={{
                            padding: "8px 0",
                            color: i === 0 ? "var(--text-primary)" : "var(--text-secondary)",
                            borderBottom: i === 0 ? "2px solid var(--accent-primary)" : "2px solid transparent",
                            cursor: "pointer",
                            fontSize: 14,
                            fontWeight: i === 0 ? 600 : 400
                        }}
                    >
                        {tab}
                    </div>
                ))}
            </div>

            {/* Body Viewer */}
            <div style={{
                flex: 1,
                background: "var(--bg-secondary)",
                borderRadius: 6,
                border: "1px solid var(--border-subtle)",
                padding: 16,
                overflow: "auto",
                fontFamily: "monospace",
                fontSize: 13,
                color: "#a5d6ff" // JSON string color
            }}>
                <pre style={{ margin: 0 }}>
                    {response.body}
                </pre>
            </div>
        </div>
    );
}
