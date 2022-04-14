import { BaseEntityAdapter, IBaseEntityAdapter } from "@adapters/base-entity.adapter";
import { WorkPackageEntityModel } from "@core/hal-models";
import { DtoFormattableText, DtoInvoice, DtoProject } from "@common";
import SERVICETYPES from "@core/service.types";
import ADAPTERTYPES from "@adapters/adapter.types";
import { IProjectEntityAdapter } from "./project-entity.adapter";
import { ILogService } from "@core";
import { injectable, inject } from "inversify";
import { Base } from "@adapters/base";

export type IInvoiceEntityAdapter = IBaseEntityAdapter<WorkPackageEntityModel, DtoInvoice>;

//#region Helper class --------------------------------------------------------
class Invoice extends Base implements DtoInvoice {
  public subject: string;
  public description: DtoFormattableText;
  public invoiceDate: Date;
  public dueDate: Date;
  public project: DtoProject;
  public netAmount: number;
}
//#endregion

@injectable()
export class InvoiceEntityAdapter
  extends BaseEntityAdapter<WorkPackageEntityModel, DtoInvoice>
  implements IInvoiceEntityAdapter {

  //#region Private properties ------------------------------------------------
  private projectEntityAdapter: IProjectEntityAdapter;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    @inject(SERVICETYPES.LogService) logService: ILogService,
    @inject(ADAPTERTYPES.ProjectEntityAdapter) projectEntityAdapter: IProjectEntityAdapter) {
    super(logService);
    this.projectEntityAdapter = projectEntityAdapter;
  }
  //#endregion

  //#region EntityAdapter abstract methods -------------------------------------
  public createDto(): DtoInvoice {
    return new Invoice();
  }
  //#endregion

  //#region EntityAdapter interfce methods -------------------------------------
  public async resourceToDto(entityModel: WorkPackageEntityModel): Promise<DtoInvoice> {
    const result = await super.resourceToDto(entityModel);
    result.subject = entityModel.subject;
    result.description = this.resourceToFormattable(entityModel.description);
    result.dueDate = entityModel.dueDate;
    result.invoiceDate = entityModel.startDate;
    result.netAmount = entityModel.netAmount;
    if (entityModel.project) {
      if (!entityModel.project.isLoaded) {
        await entityModel.project.fetch();
      }
      if (entityModel.project.isLoaded) {
        result.project = await this.projectEntityAdapter.resourceToDto(entityModel.project);
      }
    }
    return result;
  }
  //#endregion
}
