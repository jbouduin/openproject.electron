import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

import { DtoProject } from '@ipc';
import { ProjectTreeItem } from './project-tree-item';

@Component({
  selector: 'project-tree-select',
  templateUrl: './project-tree.component.html',
  styleUrls: ['./project-tree.component.scss']
})
export class ProjectTreeComponent implements OnChanges, OnInit {

  // <editor-fold desc='@Input'>
  @Input() public projects: Array<DtoProject>;
  @Input()
  public get selection(): Array<number> {
    if (this.formControl.value) {
      return this.formControl.value.map(selected => selected.id);
    } else {
      return new Array<number>();
    }
  }

  public set selection(value: Array<number>) {
    // not required
  }
  // </editor-fold>

  // <editor-fold desc='public getter methods'>
  public get selectTrigger(): string {
    if (this.formControl.value) {
      switch (this.formControl.value.length) {
        case 0: { // nothing will be displayed...
          return '';
          break;
        }
        case 1: {
          return this.formControl.value[0].name;
          break;
        }
        case 2: {
          return `${this.formControl.value[0].name} (+1 other)`;
          break;
        }
        default: {
          return `${this.formControl.value[0].name} (+${this.formControl.value.length + 1} others)'`;
          break;
        }
      }
    }
    else {
      // nothing will be displayed...
      return '';
    }
  }
  // </editor-fold>

  // <editor-fold desc='Public properties'>
  public formControl: FormControl;
  // </editor-fold>

  // <editor-fold desc='Public properties'>
  // this projectTree is a flat list, as mat-select only knows two levels
  // https://github.com/angular/components/issues/8703
  public readonly projectTree: Array<ProjectTreeItem>;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor() {
    this.projectTree = new Array<ProjectTreeItem>();
    this.formControl = new FormControl();
    this.selection = new Array<number>();
  }
  // </editor-fold>

  // <editor-fold desc='Angular interface methods'>
  ngOnInit(): void { }

  ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'projects': {
            this.buildProjectTree(changes[propName].currentValue)
          }
        }
      }
    }
  }
  // </editor-fold>

  // <editor-fold desc='Private methods'>
  private buildProjectTree(projects: Array<DtoProject>): void {
    this.projectTree.splice(0, this.projectTree.length);
    const rootProjects = projects.filter(project => project.parentId === undefined);
    rootProjects.forEach(project => {
      const rootProject = new ProjectTreeItem(project, 0);
      this.projectTree.push(rootProject);
      this.addChildProjects(rootProject, projects);
    });

  }

  private addChildProjects(parent: ProjectTreeItem, allProjects: Array<DtoProject>) {
    const children = allProjects.filter(project => project.parentId && project.parentId === parent.id);
    children.forEach(child => {
      const newTreeItem = new ProjectTreeItem(child, parent.level + 1);
      this.projectTree.push(newTreeItem);
      this.addChildProjects(newTreeItem, allProjects);
    });
  }
  // </editor-fold>
}
