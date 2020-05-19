import { DtoProject } from '@ipc';

export class ProjectTreeItem {

  // <editor-fold desc='Public properties'>
  public id: number;
  public description: string;
  public identifier: string;
  public name: string;
  public readonly children: Array<ProjectTreeItem>;
  public readonly level: number;
  // </editor-fold>

  // <editor-fold desc='public getter methods'>
  public get hasChildren(): boolean {
    return this.children.length > 0;
  }
  // </editor-fold>

  // <editor-fold desc='Constructor'>
  public constructor(dtoProject: DtoProject, level: number) {
    this.id = dtoProject.id;
    this.description = dtoProject.description.raw;
    this.identifier = dtoProject.identifier;
    this.level = level;
    this.name = dtoProject.name;
    this.children = new Array<ProjectTreeItem>();
  }
  // </editor-fold>
}
