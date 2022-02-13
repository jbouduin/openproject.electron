export interface DtoCacheEntry {
  cacheKey: string;
}

export interface DtoClientCacheEntry extends DtoCacheEntry{
  baseUri: string;
}

export interface DtoResourceCacheEntry extends DtoCacheEntry {
  isLoaded: boolean;
}