// ─────────────────────────────────────────────────────────────
// @kabootar/test-runner — Script Sandbox
// Secure JavaScript execution with timeout + memory limits
// ─────────────────────────────────────────────────────────────

import vm from "node:vm";
import type { KabootarResponse, TestResult } from "@kabootar/core";
import { expect, Expectation } from "./assertions.js";
import { EnvironmentManager } from "@kabootar/core";

export interface SandboxOptions {
    /** Max execution time in ms (default: 5000) */
    timeout?: number;
    /** Console output collector */
    consoleOutput?: string[];
}

export interface SandboxResult {
    testResults: TestResult[];
    consoleOutput: string[];
    error?: string;
}

/**
 * Execute a user's test script in a secure sandbox.
 *
 * The sandbox exposes a `kb` global with:
 *   - kb.test(name, fn)
 *   - kb.expect(value)
 *   - kb.response  (read-only response data)
 *   - kb.environment.set(k,v) / .get(k)
 *   - console.log/warn/error
 */
export function runScript(
    script: string,
    response: KabootarResponse,
    envManager: EnvironmentManager,
    options: SandboxOptions = {}
): SandboxResult {
    const timeout = options.timeout ?? 5000;
    const consoleOutput: string[] = options.consoleOutput ?? [];
    const testResults: TestResult[] = [];

    // Safe console proxy
    const safeConsole = {
        log: (...args: unknown[]) =>
            consoleOutput.push(args.map(String).join(" ")),
        warn: (...args: unknown[]) =>
            consoleOutput.push(`[WARN] ${args.map(String).join(" ")}`),
        error: (...args: unknown[]) =>
            consoleOutput.push(`[ERROR] ${args.map(String).join(" ")}`),
        info: (...args: unknown[]) =>
            consoleOutput.push(`[INFO] ${args.map(String).join(" ")}`),
    };

    // Parse response body as JSON if possible
    let jsonBody: unknown = undefined;
    try {
        jsonBody = JSON.parse(response.body);
    } catch {
        // Not JSON — that's fine
    }

    // Build the `kb` global object
    const kb = {
        test: (name: string, fn: () => void) => {
            const start = Date.now();
            try {
                fn();
                testResults.push({
                    name,
                    passed: true,
                    duration: Date.now() - start,
                });
            } catch (err: unknown) {
                testResults.push({
                    name,
                    passed: false,
                    error: err instanceof Error ? err.message : String(err),
                    duration: Date.now() - start,
                });
            }
        },
        expect: (value: unknown): Expectation => expect(value),
        response: Object.freeze({
            status: response.status,
            statusText: response.statusText,
            headers: Object.freeze({ ...response.headers }),
            body: response.body,
            json: () => jsonBody,
            text: () => response.body,
            responseTime: response.timing.total,
            timing: Object.freeze({ ...response.timing }),
            bodySize: response.bodySize,
        }),
        environment: {
            set: (key: string, value: string) => envManager.set(key, value),
            get: (key: string) => envManager.get(key),
        },
    };

    // Restricted global context — no require, no process, no fs
    const sandbox = vm.createContext({
        kb,
        console: safeConsole,
        JSON,
        Math,
        Date,
        parseInt,
        parseFloat,
        isNaN,
        isFinite,
        encodeURIComponent,
        decodeURIComponent,
        encodeURI,
        decodeURI,
        atob: globalThis.atob,
        btoa: globalThis.btoa,
        Array,
        Object,
        String,
        Number,
        Boolean,
        RegExp,
        Map,
        Set,
        Promise,
        Error,
        TypeError,
        RangeError,
        SyntaxError,
        // Explicitly NOT exposing: require, process, fs, child_process, etc.
    });

    try {
        const compiled = new vm.Script(script, {
            filename: "test-script.js",
        });
        compiled.runInContext(sandbox, { timeout });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return { testResults, consoleOutput, error: message };
    }

    return { testResults, consoleOutput };
}
