import { DtoCacheEntry } from ".";

export interface DtoCacheEntryList<T extends DtoCacheEntry> {
  list: Array<T>;
}