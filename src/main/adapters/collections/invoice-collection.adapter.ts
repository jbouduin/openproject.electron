import { BaseCollectionAdapter, IBaseCollectionAdapter } from "@adapters/base-collection.adapter";
import { BaseList } from "@adapters/base-list";
import { IInvoiceEntityAdapter } from "@adapters/entities/invoice-entity-adapter";
import { DtoInvoice, DtoInvoiceList } from "@common";
import { ILogService } from "@core";
import { WorkPackageCollectionModel, WorkPackageEntityModel } from "@core/hal-models";
import SERVICETYPES from "@core/service.types";
import { injectable, inject } from "inversify";

// <editor-fold desc='Helper class'>
class InvoiceList extends BaseList<DtoInvoice> implements DtoInvoiceList { }
// </editor-fold>

export type IInvoiceCollectionAdapter = IBaseCollectionAdapter<WorkPackageEntityModel, DtoInvoiceList, DtoInvoice>;

@injectable()
export class InvoiceCollectionAdapter
  extends BaseCollectionAdapter<WorkPackageEntityModel, DtoInvoiceList, DtoInvoice>
  implements IInvoiceCollectionAdapter {

  // <editor-fold desc='Constructor & C°'>
  public constructor(@inject(SERVICETYPES.LogService) logService: ILogService) {
    super(logService);
  }
  // </editor-fold>

  // <editor-fold desc='Abstract method implementation'>
  public createDtoList(): DtoInvoiceList {
    return new InvoiceList();
  }
  // </editor-fold>

  // <editor-fold desc='IProjectListAdapter interface methods'>
  public resourceToDto(entityAdapter: IInvoiceEntityAdapter, collection: WorkPackageCollectionModel): Promise<DtoInvoiceList> {
    return super.resourceToDto(entityAdapter, collection);
  }
  // </editor-fold>
}
