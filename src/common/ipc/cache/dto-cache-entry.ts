export interface DtoCacheEntry {
  cacheKey: string;
}

export type DtoClientCacheEntry = DtoCacheEntry;

export interface DtoResourceCacheEntry extends DtoCacheEntry {
  isLoaded: boolean;
}