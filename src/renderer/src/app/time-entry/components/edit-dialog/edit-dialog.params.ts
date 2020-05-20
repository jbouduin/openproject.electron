import { DtoProject, DtoTimeEntry } from '@ipc';

export interface EditDialogParams {
  timeEntry?: DtoTimeEntry;
  projects: Array<DtoProject>;
}
