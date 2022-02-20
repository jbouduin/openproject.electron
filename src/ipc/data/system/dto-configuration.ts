import { DtoApiConfiguration } from "./dto-api-configuration";
import { DtoLogConfiguration } from "./dto-log-configuration";

export interface DtoConfiguration {
  api: DtoApiConfiguration,
  log: DtoLogConfiguration,
}