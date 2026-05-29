// ─────────────────────────────────────────────────────────────
// @kabootar/core — Environment Manager
// Variable interpolation, scoping, and secret masking
// ─────────────────────────────────────────────────────────────

import type { Environment, EnvironmentVariable, KeyValue } from "./types.js";
import { v4 as uuid } from "uuid";

/** Variable scope priority: local > environment > collection > global */
export interface VariableScope {
    global: Record<string, string>;
    collection: Record<string, string>;
    environment: Record<string, string>;
    local: Record<string, string>;
}

/**
 * Manages environments and variable resolution with scoped overrides.
 */
export class EnvironmentManager {
    private scopes: VariableScope = {
        global: {},
        collection: {},
        environment: {},
        local: {},
    };

    private secrets = new Set<string>();

    /**
     * Load an environment — its variables populate the `environment` scope.
     */
    loadEnvironment(env: Environment): void {
        this.scopes.environment = {};
        for (const v of env.variables) {
            if (v.enabled) {
                this.scopes.environment[v.key] = v.value;
                if (v.secret) this.secrets.add(v.key);
            }
        }
    }

    /**
     * Load collection-level variables.
     */
    loadCollectionVariables(variables: KeyValue[]): void {
        this.scopes.collection = {};
        for (const v of variables) {
            if (v.enabled) {
                this.scopes.collection[v.key] = v.value;
            }
        }
    }

    /**
     * Set global variables.
     */
    setGlobals(variables: Record<string, string>): void {
        this.scopes.global = { ...variables };
    }

    /**
     * Set or update a variable in the local scope (runtime mutations).
     */
    set(key: string, value: string): void {
        this.scopes.local[key] = value;
    }

    /**
     * Get a variable value, resolving through scopes (local > env > collection > global).
     */
    get(key: string): string | undefined {
        return (
            this.scopes.local[key] ??
            this.scopes.environment[key] ??
            this.scopes.collection[key] ??
            this.scopes.global[key]
        );
    }

    /**
     * Resolve all `{{variable}}` placeholders in a string.
     */
    interpolate(input: string): string {
        return input.replace(/\{\{([^}]+)\}\}/g, (_match, key: string) => {
            const trimmed = key.trim();
            return this.get(trimmed) ?? `{{${trimmed}}}`;
        });
    }

    /**
     * Mask secret values in a string for safe logging/display.
     */
    maskSecrets(input: string): string {
        let masked = input;
        for (const key of this.secrets) {
            const value = this.get(key);
            if (value && value.length > 0) {
                masked = masked.replaceAll(value, "••••••••");
            }
        }
        return masked;
    }

    /**
     * Get a flat map of all resolved variables (for display/debugging).
     */
    getAllResolved(): Record<string, { value: string; scope: string; secret: boolean }> {
        const result: Record<string, { value: string; scope: string; secret: boolean }> = {};
        const layers: Array<[string, Record<string, string>]> = [
            ["global", this.scopes.global],
            ["collection", this.scopes.collection],
            ["environment", this.scopes.environment],
            ["local", this.scopes.local],
        ];

        for (const [scope, vars] of layers) {
            for (const [key, value] of Object.entries(vars)) {
                result[key] = { value, scope, secret: this.secrets.has(key) };
            }
        }
        return result;
    }

    /**
     * Clear the local scope (used between request executions).
     */
    clearLocal(): void {
        this.scopes.local = {};
    }

    /**
     * Reset all scopes.
     */
    reset(): void {
        this.scopes = { global: {}, collection: {}, environment: {}, local: {} };
        this.secrets.clear();
    }

    /**
     * Create a new empty environment.
     */
    static createEnvironment(name: string): Environment {
        const now = new Date().toISOString();
        return {
            id: uuid(),
            name,
            variables: [],
            createdAt: now,
            updatedAt: now,
        };
    }

    /**
     * Add a variable to an environment definition.
     */
    static addVariable(
        env: Environment,
        key: string,
        value: string,
        opts: { secret?: boolean; enabled?: boolean } = {}
    ): Environment {
        const variable: EnvironmentVariable = {
            key,
            value,
            enabled: opts.enabled ?? true,
            secret: opts.secret ?? false,
        };
        return {
            ...env,
            variables: [...env.variables, variable],
            updatedAt: new Date().toISOString(),
        };
    }
}
