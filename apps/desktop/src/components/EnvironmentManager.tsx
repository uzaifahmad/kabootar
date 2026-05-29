import React, { useState } from "react";

interface EnvVar {
    key: string;
    value: string;
    secret: boolean;
}

export function EnvironmentManager() {
    const [vars, setVars] = useState<EnvVar[]>([
        { key: "API_URL", value: "https://api.example.com", secret: false },
        { key: "API_KEY", value: "sk_live_1234567890", secret: true }
    ]);

    return (
        <div style={{ padding: 16, borderTop: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 12, textTransform: "uppercase" }}>
                Active Environment: Development
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {vars.map((v, i) => (
                    <div key={i} style={{ display: "flex", gap: 8 }}>
                        <input
                            value={v.key}
                            readOnly
                            style={{
                                background: "var(--bg-primary)",
                                border: "1px solid var(--border-subtle)",
                                color: "var(--text-primary)",
                                padding: "4px 8px",
                                borderRadius: 4,
                                fontSize: 12,
                                fontFamily: "monospace",
                                width: 100
                            }}
                        />
                        <input
                            value={v.secret ? "••••••••" : v.value}
                            readOnly
                            style={{
                                flex: 1,
                                background: "var(--bg-primary)",
                                border: "1px solid var(--border-subtle)",
                                color: v.secret ? "var(--text-secondary)" : "var(--text-primary)",
                                padding: "4px 8px",
                                borderRadius: 4,
                                fontSize: 12,
                                fontFamily: "monospace"
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
