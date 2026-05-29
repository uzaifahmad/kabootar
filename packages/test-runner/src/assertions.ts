// ─────────────────────────────────────────────────────────────
// @kabootar/test-runner — Assertions Library
// Chainable, fluent assertion API for API test scripts
// ─────────────────────────────────────────────────────────────

export class AssertionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AssertionError";
    }
}

/**
 * Fluent assertion wrapper — `kb.expect(value)`.
 */
export class Expectation {
    private value: unknown;
    private negated = false;

    constructor(value: unknown) {
        this.value = value;
    }

    get not(): Expectation {
        this.negated = !this.negated;
        return this;
    }

    private assert(condition: boolean, message: string): void {
        const pass = this.negated ? !condition : condition;
        if (!pass) {
            throw new AssertionError(this.negated ? `Expected NOT: ${message}` : message);
        }
    }

    toBe(expected: unknown): void {
        this.assert(
            this.value === expected,
            `Expected ${JSON.stringify(this.value)} to be ${JSON.stringify(expected)}`
        );
    }

    toEqual(expected: unknown): void {
        const a = JSON.stringify(this.value);
        const b = JSON.stringify(expected);
        this.assert(a === b, `Expected ${a} to equal ${b}`);
    }

    toBeTruthy(): void {
        this.assert(!!this.value, `Expected ${JSON.stringify(this.value)} to be truthy`);
    }

    toBeFalsy(): void {
        this.assert(!this.value, `Expected ${JSON.stringify(this.value)} to be falsy`);
    }

    toBeNull(): void {
        this.assert(this.value === null, `Expected ${JSON.stringify(this.value)} to be null`);
    }

    toBeUndefined(): void {
        this.assert(
            this.value === undefined,
            `Expected ${JSON.stringify(this.value)} to be undefined`
        );
    }

    toBeDefined(): void {
        this.assert(
            this.value !== undefined,
            `Expected value to be defined`
        );
    }

    toBeGreaterThan(n: number): void {
        this.assert(
            (this.value as number) > n,
            `Expected ${this.value} to be greater than ${n}`
        );
    }

    toBeLessThan(n: number): void {
        this.assert(
            (this.value as number) < n,
            `Expected ${this.value} to be less than ${n}`
        );
    }

    toContain(item: unknown): void {
        if (typeof this.value === "string") {
            this.assert(
                this.value.includes(item as string),
                `Expected "${this.value}" to contain "${item}"`
            );
        } else if (Array.isArray(this.value)) {
            this.assert(
                this.value.includes(item),
                `Expected array to contain ${JSON.stringify(item)}`
            );
        } else {
            throw new AssertionError("toContain only works on strings and arrays");
        }
    }

    toHaveLength(len: number): void {
        const actual = (this.value as string | unknown[]).length;
        this.assert(actual === len, `Expected length ${actual} to be ${len}`);
    }

    toMatch(pattern: RegExp | string): void {
        const regex = typeof pattern === "string" ? new RegExp(pattern) : pattern;
        this.assert(
            regex.test(this.value as string),
            `Expected "${this.value}" to match ${regex}`
        );
    }

    toHaveProperty(key: string, expectedValue?: unknown): void {
        const obj = this.value as Record<string, unknown>;
        const hasKey = obj != null && key in obj;
        if (expectedValue !== undefined) {
            this.assert(
                hasKey && obj[key] === expectedValue,
                `Expected property "${key}" to be ${JSON.stringify(expectedValue)}, got ${JSON.stringify(obj?.[key])}`
            );
        } else {
            this.assert(hasKey, `Expected object to have property "${key}"`);
        }
    }

    toHaveStatus(status: number): void {
        this.assert(
            (this.value as number) === status,
            `Expected status ${status}, got ${this.value}`
        );
    }

    toBeBelow(n: number): void {
        this.assert(
            (this.value as number) < n,
            `Expected ${this.value} to be below ${n}`
        );
    }

    toBeAbove(n: number): void {
        this.assert(
            (this.value as number) > n,
            `Expected ${this.value} to be above ${n}`
        );
    }

    toInclude(substring: string): void {
        this.toContain(substring);
    }

    toBeType(type: string): void {
        this.assert(
            typeof this.value === type,
            `Expected typeof to be "${type}", got "${typeof this.value}"`
        );
    }
}

/**
 * Create a new expectation.
 */
export function expect(value: unknown): Expectation {
    return new Expectation(value);
}
