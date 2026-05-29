import React from "react";

export function CollectionExplorer() {
    return (
        <div style={{ padding: "0 16px", color: "var(--text-primary)", fontSize: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>
                    Collections
                </div>
                <button style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    fontSize: 14
                }}>+</button>
            </div>

            {/* Static Mock UI */}
            <div>
                <div style={{ display: "flex", alignItems: "center", padding: "6px 0", cursor: "pointer" }}>
                    <span style={{ marginRight: 8, opacity: 0.7 }}>📁</span>
                    <span>Sample Collection</span>
                </div>

                <div style={{ paddingLeft: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", padding: "6px 0", cursor: "pointer", background: "rgba(255,255,255,0.05)", borderRadius: 4 }}>
                        <span style={{
                            fontSize: 10,
                            fontWeight: 600,
                            color: "var(--get-color)",
                            width: 32,
                            fontFamily: "monospace"
                        }}>GET</span>
                        <span>Get User</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", padding: "6px 0", cursor: "pointer" }}>
                        <span style={{
                            fontSize: 10,
                            fontWeight: 600,
                            color: "var(--post-color)",
                            width: 32,
                            fontFamily: "monospace"
                        }}>POST</span>
                        <span>Create User</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
