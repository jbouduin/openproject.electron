import { DtoCacheEntry } from "./dto-cache-entry";

export interface DtoCacheEntryList<T extends DtoCacheEntry> {
  list: Array<T>;
}