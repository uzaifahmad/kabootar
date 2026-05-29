import React from "react";
import type { KabootarRequest, HttpMethod } from "@kabootar/core";

interface Props {
    request: KabootarRequest;
    onChange: (req: KabootarRequest) => void;
    onSend: () => void;
    isLoading: boolean;
}

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export function RequestBuilder({ request, onChange, onSend, isLoading }: Props) {
    const methodColor = `var(--${request.method.toLowerCase()}-color, var(--text-primary))`;

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            {/* URL Bar */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <select
                    value={request.method}
                    onChange={(e) => onChange({ ...request, method: e.target.value as HttpMethod })}
                    style={{
                        background: "var(--bg-secondary)",
                        color: methodColor,
                        fontWeight: 600,
                        border: "1px solid var(--border-subtle)",
                        borderRadius: 6,
                        padding: "8px 12px",
                        outline: "none",
                        cursor: "pointer",
                        width: 100
                    }}
                >
                    {METHODS.map((m) => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </select>

                <input
                    value={request.url}
                    onChange={(e) => onChange({ ...request, url: e.target.value })}
                    placeholder="https://api.example.com/v1/users"
                    style={{
                        flex: 1,
                        background: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: 6,
                        padding: "8px 16px",
                        outline: "none",
                        fontFamily: "monospace",
                        fontSize: 14
                    }}
                />

                <button
                    onClick={onSend}
                    disabled={isLoading}
                    style={{
                        background: "var(--accent-primary)",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        padding: "0 24px",
                        fontWeight: 600,
                        cursor: isLoading ? "not-allowed" : "pointer",
                        opacity: isLoading ? 0.7 : 1,
                    }}
                >
                    {isLoading ? "Sending..." : "Send"}
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid var(--border-subtle)", gap: 24, marginBottom: 16 }}>
                {["Params", "Headers", "Auth", "Body", "Tests"].map((tab, i) => (
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

            {/* Tab Content Placeholder */}
            <div style={{ flex: 1, background: "var(--bg-secondary)", borderRadius: 6, border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                Query parameters editor (key-value grid placeholder)
            </div>
        </div>
    );
}
