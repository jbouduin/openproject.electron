import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { IpcService, DataRequestFactory } from '@core';
import { DataVerb, DtoClientCacheEntry, DtoDataResponse, DtoResourceCacheEntry } from '@ipc';

@Component({
  selector: 'app-cache-dialog',
  templateUrl: './cache-dialog.component.html',
  styleUrls: ['./cache-dialog.component.scss']
})
export class CacheDialogComponent implements OnInit {

  //#region private properties ------------------------------------------------
  private readonly dialogRef: MatDialogRef<CacheDialogComponent>;
  private readonly ipcService: IpcService;
  private readonly dataRequestFactory: DataRequestFactory;
  //#endregion

  //#region public properties -------------------------------------------------
  public cachedClients: Array<DtoClientCacheEntry>;
  public cachedResources: Array<DtoResourceCacheEntry>;
  public displayedClientColumns: Array<string>;
  public displayedResourceColumns: Array<string>;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  constructor(

    dialogRef: MatDialogRef<CacheDialogComponent>,
    ipcService: IpcService,
    dataRequestFactory: DataRequestFactory) {
      this.dialogRef = dialogRef;
      this.dataRequestFactory = dataRequestFactory;
      this.ipcService = ipcService;
    this.cachedClients = new Array<DtoClientCacheEntry>();
    this.cachedResources = new Array<DtoResourceCacheEntry>();
    this.displayedClientColumns = new Array<string>('cacheKey');
    this.displayedResourceColumns = new Array<string>('cacheKey', 'isLoaded');
  }

  ngOnInit(): void {
    this.refresh()
  }
  //#endregion

  //#region UI triggers -------------------------------------------------------
  public close(): void {
    this.dialogRef.close();
  }

  public refresh(): void {
    const requestClients = this.dataRequestFactory.createUntypedDataRequest(DataVerb.GET, '/cache/contents/clients');
    const requestResources = this.dataRequestFactory.createUntypedDataRequest(DataVerb.GET, '/cache/contents/resources');
    this.ipcService
      .untypedDataRequest<Array<DtoClientCacheEntry>>(requestClients)
      .then(
        (clients: DtoDataResponse<Array<DtoClientCacheEntry>>) =>
          this.cachedClients = clients.data.sort((a: DtoClientCacheEntry, b:DtoClientCacheEntry) => a.cacheKey.localeCompare(b.cacheKey)),
        (reason: any) => console.error(reason)
      );
    this.ipcService
      .untypedDataRequest<Array<DtoResourceCacheEntry>>(requestResources)
      .then((clients: DtoDataResponse<Array<DtoResourceCacheEntry>>) =>
        this.cachedResources = clients.data.sort((a: DtoResourceCacheEntry, b: DtoResourceCacheEntry) => a.cacheKey.localeCompare(b.cacheKey)),
        (reason: any) => console.error(reason)
      );
  }
  //#endregion
}
