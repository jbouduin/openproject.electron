import { Injectable } from '@angular/core';
import { DataVerb, DtoInvoice, DtoInvoiceList, DtoWorkPackage } from '@common';
import { DataRequestFactory, IpcService } from './ipc';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  //#region Private properties ------------------------------------------------
  private dataRequestFactory: DataRequestFactory;
  private ipcService: IpcService;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(dataRequestFactory: DataRequestFactory, ipcService: IpcService) {
    this.dataRequestFactory = dataRequestFactory;
    this.ipcService = ipcService;
  }
  //#endregion

  //#region Public methods ----------------------------------------------------
  public async getOpenInvoices(): Promise<DtoInvoiceList> {
    const request = this.dataRequestFactory.createUntypedDataRequest(DataVerb.GET, '/invoices/open');
    const result = await this.ipcService.untypedDataRequest<DtoInvoiceList>(request);
    return result.data;
  }

  public async saveNewInvoice(data: DtoInvoice): Promise<DtoInvoice> {
    const request = this.dataRequestFactory.createDataRequest<DtoInvoice>(DataVerb.POST, '/invoices', data);
    const result = await this.ipcService.dataRequest<DtoInvoice, DtoInvoice>(request);
    return result.data;
  }

  public async payInvoice(data: DtoInvoice): Promise<DtoInvoice> {
    const request = this.dataRequestFactory.createDataRequest<DtoInvoice>(DataVerb.POST, '/invoices/pay', data);
    const result = await this.ipcService.dataRequest<DtoInvoice, DtoInvoice>(request);
    return result.data;
  }

  public async deleteInvoice(id: number): Promise<boolean> {
    const request = this.dataRequestFactory.createUntypedDataRequest(DataVerb.DELETE, `/invoices/${id}`);
    const result = await this.ipcService.untypedDataRequest<DtoInvoice>(request);
    return result.data ? true : false;
  }
  //#endregion
}
