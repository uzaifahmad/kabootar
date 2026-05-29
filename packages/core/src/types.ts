// ─────────────────────────────────────────────────────────────
// @kabootar/core — Types
// Core type definitions for requests, collections, environments
// ─────────────────────────────────────────────────────────────

/** HTTP methods supported by the request engine */
export type HttpMethod =
    | "GET"
    | "POST"
    | "PUT"
    | "PATCH"
    | "DELETE"
    | "OPTIONS"
    | "HEAD";

/** Body content types */
export type BodyType = "none" | "json" | "form-data" | "x-www-form-urlencoded" | "raw" | "binary" | "graphql";

/** Authentication types */
export type AuthType = "none" | "bearer" | "basic" | "api-key" | "oauth2";

/** Key-value pair with optional enable toggle */
export interface KeyValue {
    key: string;
    value: string;
    enabled: boolean;
    description?: string;
}

/** Authentication configuration */
export interface AuthConfig {
    type: AuthType;
    bearer?: { token: string };
    basic?: { username: string; password: string };
    apiKey?: { key: string; value: string; addTo: "header" | "query" };
    oauth2?: {
        grantType: "authorization_code" | "client_credentials";
        authUrl?: string;
        tokenUrl: string;
        clientId: string;
        clientSecret: string;
        scope?: string;
        redirectUri?: string;
        accessToken?: string;
    };
}

/** Request body */
export interface RequestBody {
    type: BodyType;
    raw?: string;
    rawLanguage?: "json" | "xml" | "text" | "html" | "javascript";
    formData?: KeyValue[];
    urlencoded?: KeyValue[];
    binary?: { path: string };
    graphql?: { query: string; variables?: string };
}

/** A single API request definition */
export interface KabootarRequest {
    id: string;
    name: string;
    method: HttpMethod;
    url: string;
    params: KeyValue[];
    headers: KeyValue[];
    auth: AuthConfig;
    body: RequestBody;
    preRequestScript?: string;
    testScript?: string;
    timeout?: number;
    followRedirects?: boolean;
    maxRedirects?: number;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

/** Folder within a collection */
export interface CollectionFolder {
    id: string;
    name: string;
    description?: string;
    items: Array<CollectionFolder | KabootarRequest>;
    auth?: AuthConfig;
    preRequestScript?: string;
    testScript?: string;
}

/** Top-level collection */
export interface Collection {
    id: string;
    name: string;
    description?: string;
    version: string;
    items: Array<CollectionFolder | KabootarRequest>;
    auth?: AuthConfig;
    variables?: KeyValue[];
    preRequestScript?: string;
    testScript?: string;
    createdAt: string;
    updatedAt: string;
}

/** Environment variable (can be secret) */
export interface EnvironmentVariable {
    key: string;
    value: string;
    enabled: boolean;
    secret: boolean;
}

/** Named environment */
export interface Environment {
    id: string;
    name: string;
    variables: EnvironmentVariable[];
    createdAt: string;
    updatedAt: string;
}

/** Timing breakdown of a response */
export interface ResponseTiming {
    dns: number;
    tcp: number;
    tls: number;
    ttfb: number;
    download: number;
    total: number;
}

/** Response from executing a request */
export interface KabootarResponse {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;
    bodySize: number;
    timing: ResponseTiming;
    redirects: string[];
}

/** Test result from script execution */
export interface TestResult {
    name: string;
    passed: boolean;
    error?: string;
    duration: number;
}

/** Full execution result */
export interface ExecutionResult {
    request: KabootarRequest;
    response: KabootarResponse;
    testResults: TestResult[];
    consoleOutput: string[];
    error?: string;
    timestamp: string;
}

/** Type guard — is this item a folder? */
export function isFolder(
    item: CollectionFolder | KabootarRequest
): item is CollectionFolder {
    return "items" in item;
}

/** Type guard — is this item a request? */
export function isRequest(
    item: CollectionFolder | KabootarRequest
): item is KabootarRequest {
    return "method" in item;
}
