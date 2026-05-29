// ─────────────────────────────────────────────────────────────
// @kabootar/core — Collection Manager
// CRUD ops, validation, search, import/export
// ─────────────────────────────────────────────────────────────

import { v4 as uuid } from "uuid";
import type {
    Collection,
    CollectionFolder,
    KabootarRequest,
} from "./types.js";
import { isFolder, isRequest } from "./types.js";

/**
 * Create a new empty collection.
 */
export function createCollection(
    name: string,
    overrides: Partial<Collection> = {}
): Collection {
    const now = new Date().toISOString();
    return {
        id: uuid(),
        name,
        description: "",
        version: "1.0.0",
        items: [],
        auth: { type: "none" },
        variables: [],
        createdAt: now,
        updatedAt: now,
        ...overrides,
    };
}

/**
 * Create a new folder.
 */
export function createFolder(
    name: string,
    overrides: Partial<CollectionFolder> = {}
): CollectionFolder {
    return {
        id: uuid(),
        name,
        items: [],
        ...overrides,
    };
}

/**
 * Deep-find an item by ID in a collection tree.
 */
export function findItemById(
    items: Array<CollectionFolder | KabootarRequest>,
    id: string
): (CollectionFolder | KabootarRequest) | undefined {
    for (const item of items) {
        if (item.id === id) return item;
        if (isFolder(item)) {
            const found = findItemById(item.items, id);
            if (found) return found;
        }
    }
    return undefined;
}

/**
 * Find the parent folder of an item by its ID.
 * Returns null if the item is at root level.
 */
export function findParent(
    items: Array<CollectionFolder | KabootarRequest>,
    targetId: string,
    parent: CollectionFolder | null = null
): CollectionFolder | null | undefined {
    for (const item of items) {
        if (item.id === targetId) return parent;
        if (isFolder(item)) {
            const found = findParent(item.items, targetId, item);
            if (found !== undefined) return found;
        }
    }
    return undefined;
}

/**
 * Add an item (request or folder) to a collection at a given path.
 * If parentId is undefined, adds to root.
 */
export function addItem(
    collection: Collection,
    item: CollectionFolder | KabootarRequest,
    parentId?: string
): Collection {
    const updated = { ...collection, updatedAt: new Date().toISOString() };

    if (!parentId) {
        updated.items = [...updated.items, item];
        return updated;
    }

    updated.items = addItemRecursive(updated.items, item, parentId);
    return updated;
}

function addItemRecursive(
    items: Array<CollectionFolder | KabootarRequest>,
    newItem: CollectionFolder | KabootarRequest,
    parentId: string
): Array<CollectionFolder | KabootarRequest> {
    return items.map((item) => {
        if (isFolder(item) && item.id === parentId) {
            return { ...item, items: [...item.items, newItem] };
        }
        if (isFolder(item)) {
            return {
                ...item,
                items: addItemRecursive(item.items, newItem, parentId),
            };
        }
        return item;
    });
}

/**
 * Remove an item by ID from anywhere in the tree.
 */
export function removeItem(
    collection: Collection,
    itemId: string
): Collection {
    return {
        ...collection,
        items: removeItemRecursive(collection.items, itemId),
        updatedAt: new Date().toISOString(),
    };
}

function removeItemRecursive(
    items: Array<CollectionFolder | KabootarRequest>,
    itemId: string
): Array<CollectionFolder | KabootarRequest> {
    return items
        .filter((item) => item.id !== itemId)
        .map((item) => {
            if (isFolder(item)) {
                return { ...item, items: removeItemRecursive(item.items, itemId) };
            }
            return item;
        });
}

/**
 * Count total requests in a collection/folder tree.
 */
export function countRequests(
    items: Array<CollectionFolder | KabootarRequest>
): number {
    let count = 0;
    for (const item of items) {
        if (isRequest(item)) {
            count++;
        } else if (isFolder(item)) {
            count += countRequests(item.items);
        }
    }
    return count;
}

/**
 * Get all requests in a flat array (for collection runner).
 */
export function getAllRequests(
    items: Array<CollectionFolder | KabootarRequest>
): KabootarRequest[] {
    const requests: KabootarRequest[] = [];
    for (const item of items) {
        if (isRequest(item)) {
            requests.push(item);
        } else if (isFolder(item)) {
            requests.push(...getAllRequests(item.items));
        }
    }
    return requests;
}

/**
 * Validate a collection object has required fields.
 */
export function validateCollection(
    data: unknown
): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data || typeof data !== "object") {
        return { valid: false, errors: ["Collection must be an object"] };
    }

    const col = data as Record<string, unknown>;
    if (!col.id || typeof col.id !== "string") errors.push("Missing or invalid 'id'");
    if (!col.name || typeof col.name !== "string") errors.push("Missing or invalid 'name'");
    if (!col.version || typeof col.version !== "string") errors.push("Missing or invalid 'version'");
    if (!Array.isArray(col.items)) errors.push("'items' must be an array");

    return { valid: errors.length === 0, errors };
}

/**
 * Export collection to a portable JSON format (Kabootar schema).
 */
export function exportCollection(collection: Collection): string {
    return JSON.stringify(
        {
            _type: "kabootar_collection",
            _version: "1.0.0",
            ...collection,
        },
        null,
        2
    );
}

/**
 * Import a collection from Kabootar JSON format.
 */
export function importCollection(json: string): Collection {
    const data = JSON.parse(json);
    if (data._type !== "kabootar_collection") {
        throw new Error("Invalid Kabootar collection format");
    }
    const { _type, _version, ...collection } = data;
    return collection as Collection;
}
