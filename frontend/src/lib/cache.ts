interface CacheItem<T> {
    data: T;
    timestamp: number;
}

class Cache {
    
    private static instance: Cache;
    private cache: Map<string, CacheItem<any>>;
    private pendingRequests: Map<string, Promise<any>>;
    private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    private constructor() {
        this.cache = new Map();
        this.pendingRequests = new Map();
    }

    public static getInstance(): Cache {
        if (!Cache.instance) {
            Cache.instance = new Cache();
        }
        return Cache.instance;
    }

    public set<T>(key: string, data: T): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
        this.pendingRequests.delete(key);
    }

    public get<T>(key: string): T | null {
        const item = this.cache.get(key);
        if (!item) return null;

        const isExpired = Date.now() - item.timestamp > this.CACHE_DURATION;
        if (isExpired) {
            this.cache.delete(key);
            return null;
        }

        return item.data as T;
    }

    public getPendingRequest<T>(key: string): Promise<T> | null {
        return this.pendingRequests.get(key) as Promise<T> | null;
    }

    public setPendingRequest<T>(key: string, promise: Promise<T>): void {
        this.pendingRequests.set(key, promise);
    }

    public clear(): void {
        this.cache.clear();
        this.pendingRequests.clear();
    }
}

export const cache = Cache.getInstance(); 