// ─────────────────────────────────────────────────────────────
// @kabootar/core — Auth Helpers
// Applies authentication to outgoing requests
// ─────────────────────────────────────────────────────────────

import type { AuthConfig, KeyValue } from "./types.js";

export interface AuthResult {
    headers: Record<string, string>;
    queryParams: Record<string, string>;
}

/**
 * Resolve an AuthConfig into the headers/query-params it produces.
 */
export function resolveAuth(auth: AuthConfig): AuthResult {
    const result: AuthResult = { headers: {}, queryParams: {} };

    switch (auth.type) {
        case "bearer":
            if (auth.bearer?.token) {
                result.headers["Authorization"] = `Bearer ${auth.bearer.token}`;
            }
            break;

        case "basic":
            if (auth.basic?.username !== undefined) {
                const encoded = btoa(
                    `${auth.basic.username}:${auth.basic.password ?? ""}`
                );
                result.headers["Authorization"] = `Basic ${encoded}`;
            }
            break;

        case "api-key":
            if (auth.apiKey) {
                if (auth.apiKey.addTo === "header") {
                    result.headers[auth.apiKey.key] = auth.apiKey.value;
                } else {
                    result.queryParams[auth.apiKey.key] = auth.apiKey.value;
                }
            }
            break;

        case "oauth2":
            if (auth.oauth2?.accessToken) {
                result.headers["Authorization"] = `Bearer ${auth.oauth2.accessToken}`;
            }
            break;

        case "none":
        default:
            break;
    }

    return result;
}

/**
 * Merge auth-produced headers/params into existing ones (auth takes lower priority).
 */
export function mergeAuth(
    existingHeaders: KeyValue[],
    existingParams: KeyValue[],
    auth: AuthConfig
): { headers: KeyValue[]; params: KeyValue[] } {
    const resolved = resolveAuth(auth);
    const headers = [...existingHeaders];
    const params = [...existingParams];

    for (const [key, value] of Object.entries(resolved.headers)) {
        const exists = headers.some(
            (h) => h.key.toLowerCase() === key.toLowerCase() && h.enabled
        );
        if (!exists) {
            headers.push({ key, value, enabled: true, description: "Auto: auth" });
        }
    }

    for (const [key, value] of Object.entries(resolved.queryParams)) {
        const exists = params.some((p) => p.key === key && p.enabled);
        if (!exists) {
            params.push({ key, value, enabled: true, description: "Auto: auth" });
        }
    }

    return { headers, params };
}
