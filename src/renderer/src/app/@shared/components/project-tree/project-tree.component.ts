import { Component, Input, OnChanges, OnInit, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

import { DtoProject } from '@ipc';
import { ProjectTreeItem } from './project-tree-item';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'project-tree-select',
  templateUrl: './project-tree.component.html',
  styleUrls: ['./project-tree.component.scss']
})
export class ProjectTreeComponent implements OnChanges, OnInit {

  // <editor-fold desc='@Input'>
  @Input() public control: FormControl;
  @Input() public multipleSelect: boolean;
  @Input() public projects: Array<DtoProject>;
  @Input() public text: string;
  // #1186 @Input() public selectRecursive: boolean; eventually replace multipleSelect by a selectMode enum (single, multiple, recursive)
  @Output() public selectionChanged: EventEmitter<Array<number>>;
  // </editor-fold>

  // <editor-fold desc='public getter/setter methods'>
  public get selectLabel(): string {
    if (!this.control) {
      return;
    }
    if (this.multipleSelect) {
      if (this.control.value)  {
        return this.control.value.length === 0 ? this.text : 'Projects';
      } else {
        return this.text;
      }
    } else if (this.control.value) {
      return 'Project'
    } else {
      return this.text;
    }
  }

  public get selectTrigger(): string {
    if (this.control.value) {
      if (Array.isArray(this.control.value)) {
        const selectedProjects = this.control.value.map(id => this.projects.find(project => project.id === id));
        switch (selectedProjects.length) {
          case 0: { // nothing will be displayed...
            return this.selectLabel;
          }
          case 1: {
            return selectedProjects[0].name;
          }
          case 2: {
            return `${selectedProjects[0].name} (+1 other)`;
          }
          default: {
            return `${selectedProjects[0].name} (+${selectedProjects.length - 1} others)'`;
          }
        }
      } else {
        return this.projects.find(project => project.id === this.control.value).name;
      }
    } else {
      // the label will be displayed...
      return this.selectLabel;
    }
  }
  // </editor-fold>

  // <editor-fold desc='Public readonly properties'>
  // this projectTree is a flat list, as mat-select only knows two levels
  // https://github.com/angular/components/issues/8703
  public readonly projectTree: Array<ProjectTreeItem>;
  // </editor-fold>

  // <editor-fold desc='Public properties'>
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor() {
    this.projectTree = new Array<ProjectTreeItem>();
    this.selectionChanged = new EventEmitter<Array<number>>();
  }
  // </editor-fold>

  // <editor-fold desc='Private methods'>
  // </editor-fold>

  // <editor-fold desc='Angular interface methods'>
  public ngOnInit(): void { }

  public ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'projects': {
            this.buildProjectTree(changes[propName].currentValue);
            break;
          }
        }
      }
    }
  }
  // </editor-fold>

  // <editor-fold desc='UI Triggered methods'>
  public itemPadding(item: ProjectTreeItem): Object {
    return {
      'padding': `0 0 0 ${36 + 20 * item.level}px`
    };
  }

  public selectionChange(event: MatSelectChange) {
    if (event.value) {
      if (Array.isArray(event.value)) {
        this.selectionChanged.emit(event.value.map( (selected: ProjectTreeItem) => selected.id));
      } else {
        this.selectionChanged.emit([event.value.id]);
      }
    } else {
      this.selectionChanged.emit(new Array<number>());
    }
  }
  // </editor-fold>

  // <editor-fold desc='Private methods'>
  private projectSortMethod(project1: DtoProject, project2: DtoProject): number {
    return project1.name.localeCompare(project2.name);
  }

  private buildProjectTree(projects: Array<DtoProject>): void {
    this.projectTree.splice(0, this.projectTree.length);
    const rootProjects = projects
      .filter(project => project.parentId === undefined)
      .sort(this.projectSortMethod);
    rootProjects.forEach(project => {
      const rootProject = new ProjectTreeItem(project, 0);
      this.projectTree.push(rootProject);
      this.addChildProjects(rootProject, projects);
    });

  }

  private addChildProjects(parent: ProjectTreeItem, allProjects: Array<DtoProject>) {
    const children = allProjects
      .filter(project => project.parentId && project.parentId === parent.id)
      .sort(this.projectSortMethod);
    children.forEach(child => {
      const newTreeItem = new ProjectTreeItem(child, parent.level + 1);
      this.projectTree.push(newTreeItem);
      this.addChildProjects(newTreeItem, allProjects);
    });
  }
  // </editor-fold>
}
