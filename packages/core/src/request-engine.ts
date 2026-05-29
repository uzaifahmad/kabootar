// ─────────────────────────────────────────────────────────────
// @kabootar/core — Request Engine
// HTTP executor with timing, auth, variable interpolation
// ─────────────────────────────────────────────────────────────

import { v4 as uuid } from "uuid";
import type {
    KabootarRequest,
    KabootarResponse,
    ResponseTiming,
    KeyValue,
} from "./types.js";
import { resolveAuth } from "./auth.js";
import { EnvironmentManager } from "./environment.js";

export interface RequestEngineOptions {
    /** Custom fetch implementation (for testing or Node.js < 18) */
    fetch?: typeof globalThis.fetch;
    /** Environment manager for variable interpolation */
    environment?: EnvironmentManager;
    /** Abort signal for cancellation */
    signal?: AbortSignal;
}

/**
 * Build the final URL with interpolated params.
 */
function buildUrl(
    rawUrl: string,
    params: KeyValue[],
    env?: EnvironmentManager
): string {
    let url = env ? env.interpolate(rawUrl) : rawUrl;

    const enabledParams = params.filter((p) => p.enabled);
    if (enabledParams.length > 0) {
        const separator = url.includes("?") ? "&" : "?";
        const qs = enabledParams
            .map((p) => {
                const key = env ? env.interpolate(p.key) : p.key;
                const value = env ? env.interpolate(p.value) : p.value;
                return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
            })
            .join("&");
        url = `${url}${separator}${qs}`;
    }

    return url;
}

/**
 * Build headers map from KeyValue array.
 */
function buildHeaders(
    headers: KeyValue[],
    env?: EnvironmentManager
): Record<string, string> {
    const result: Record<string, string> = {};
    for (const h of headers) {
        if (h.enabled) {
            const key = env ? env.interpolate(h.key) : h.key;
            const value = env ? env.interpolate(h.value) : h.value;
            result[key] = value;
        }
    }
    return result;
}

/**
 * Build the request body.
 */
function buildBody(
    request: KabootarRequest,
    headers: Record<string, string>,
    env?: EnvironmentManager
): string | FormData | URLSearchParams | undefined {
    const { body } = request;
    if (!body || body.type === "none") return undefined;

    switch (body.type) {
        case "json":
        case "raw":
        case "graphql": {
            if (!headers["Content-Type"] && body.type === "json") {
                headers["Content-Type"] = "application/json";
            }
            if (body.type === "graphql" && body.graphql) {
                const payload = {
                    query: body.graphql.query,
                    variables: body.graphql.variables
                        ? JSON.parse(body.graphql.variables)
                        : undefined,
                };
                headers["Content-Type"] = "application/json";
                return JSON.stringify(payload);
            }
            const raw = body.raw ?? "";
            return env ? env.interpolate(raw) : raw;
        }

        case "x-www-form-urlencoded": {
            const params = new URLSearchParams();
            for (const item of body.urlencoded ?? []) {
                if (item.enabled) {
                    const key = env ? env.interpolate(item.key) : item.key;
                    const value = env ? env.interpolate(item.value) : item.value;
                    params.append(key, value);
                }
            }
            headers["Content-Type"] = "application/x-www-form-urlencoded";
            return params;
        }

        case "form-data": {
            const formData = new FormData();
            for (const item of body.formData ?? []) {
                if (item.enabled) {
                    const key = env ? env.interpolate(item.key) : item.key;
                    const value = env ? env.interpolate(item.value) : item.value;
                    formData.append(key, value);
                }
            }
            // Let the browser/runtime set Content-Type with boundary
            delete headers["Content-Type"];
            return formData;
        }

        default:
            return undefined;
    }
}

/**
 * Execute an HTTP request and return a structured response with timing.
 */
export async function executeRequest(
    request: KabootarRequest,
    options: RequestEngineOptions = {}
): Promise<KabootarResponse> {
    const fetchFn = options.fetch ?? globalThis.fetch;
    const env = options.environment;

    // --- Resolve auth ---
    const authResult = resolveAuth(request.auth);
    const allHeaders = [...request.headers];
    const allParams = [...request.params];

    // Merge auth headers
    for (const [key, value] of Object.entries(authResult.headers)) {
        allHeaders.push({ key, value, enabled: true });
    }
    for (const [key, value] of Object.entries(authResult.queryParams)) {
        allParams.push({ key, value, enabled: true });
    }

    // --- Build final request ---
    const url = buildUrl(request.url, allParams, env);
    const headers = buildHeaders(allHeaders, env);
    const bodyContent = buildBody(request, headers, env);

    // --- Timing ---
    const timing: ResponseTiming = {
        dns: 0,
        tcp: 0,
        tls: 0,
        ttfb: 0,
        download: 0,
        total: 0,
    };

    const startTime = performance.now();

    // --- Execute ---
    const controller = new AbortController();
    const timeoutId = request.timeout
        ? setTimeout(() => controller.abort(), request.timeout)
        : undefined;

    // Chain abort signals
    if (options.signal) {
        options.signal.addEventListener("abort", () => controller.abort());
    }

    try {
        const fetchOptions: RequestInit = {
            method: request.method,
            headers,
            body: bodyContent as BodyInit | undefined,
            signal: controller.signal,
            redirect: request.followRedirects === false ? "manual" : "follow",
        };

        const ttfbStart = performance.now();
        const response = await fetchFn(url, fetchOptions);
        timing.ttfb = performance.now() - ttfbStart;

        const downloadStart = performance.now();
        const bodyText = await response.text();
        timing.download = performance.now() - downloadStart;
        timing.total = performance.now() - startTime;

        // Extract response headers
        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
            responseHeaders[key] = value;
        });

        return {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
            body: bodyText,
            bodySize: new TextEncoder().encode(bodyText).length,
            timing,
            redirects: response.redirected ? [response.url] : [],
        };
    } catch (error: unknown) {
        timing.total = performance.now() - startTime;

        if (error instanceof DOMException && error.name === "AbortError") {
            return {
                status: 0,
                statusText: "Request Timeout",
                headers: {},
                body: "",
                bodySize: 0,
                timing,
                redirects: [],
            };
        }

        const message = error instanceof Error ? error.message : String(error);
        return {
            status: 0,
            statusText: `Network Error: ${message}`,
            headers: {},
            body: "",
            bodySize: 0,
            timing,
            redirects: [],
        };
    } finally {
        if (timeoutId) clearTimeout(timeoutId);
    }
}

/**
 * Create a default empty request.
 */
export function createRequest(
    overrides: Partial<KabootarRequest> = {}
): KabootarRequest {
    const now = new Date().toISOString();
    return {
        id: uuid(),
        name: "New Request",
        method: "GET",
        url: "",
        params: [],
        headers: [],
        auth: { type: "none" },
        body: { type: "none" },
        timeout: 30_000,
        followRedirects: true,
        maxRedirects: 10,
        createdAt: now,
        updatedAt: now,
        ...overrides,
    };
}
