import { Component, forwardRef, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { ProjectService } from '@core';
import { DtoProject, DtoProjectReportSelection } from '@common';
import { map, Observable, startWith, Subscription } from 'rxjs';
import { ProjectReportSelection } from './project-report.selection';

@Component({
  selector: 'app-project',
  templateUrl: './project-report.component.html',
  styleUrls: ['./project-report.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ProjectReportComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ProjectReportComponent),
      multi: true
    }
  ]
})
export class ProjectReportComponent implements OnInit, OnDestroy {

  //#region Public properties -------------------------------------------------
  public projects: Array<DtoProject>;
  public projectInput: FormControl;
  public filteredProjects: Observable<Array<DtoProject>>;
  //#endregion

  //#region public getters/setters --------------------------------------------
  public get value(): DtoProjectReportSelection {
    return new ProjectReportSelection(this.projectInput.value?.id);
  }

  public set value(value: DtoProjectReportSelection) {
    const project = this.projects ?
      this.projects.find((project: DtoProject) => project.id == value.projectId):
      undefined;
    this.projectInput.setValue(project);
  }
  //#endregion

  //#region private properties ------------------------------------------------
  private onChange: any = () => { };
  private onTouched: any = () => { };
  private projectService: ProjectService;
  private subscriptions: Array<Subscription>;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  constructor(projectService: ProjectService) {
    this.projectService = projectService;
    this.projectInput = new FormControl(undefined, [Validators.required]);
    this.subscriptions = new Array<Subscription>(
      this.projectInput.valueChanges.subscribe(value => {
        if (typeof value === 'object') {
          this.onChange((value as Object).hasOwnProperty('id') ? value['id'] : undefined);
        } else {
          this.onChange(undefined);
        }
        this.onTouched();
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  public ngOnInit(): void {
    this.projectService.getProjects()
      .then((response: Map<number, DtoProject>) => {
        this.projects = Array.from(response.values()).sort((a: DtoProject, b: DtoProject) => a.name.localeCompare(b.name));
        this.filteredProjects = this.projectInput.valueChanges.pipe(
          startWith(''),
          map(value => {
            return (typeof value === 'string' ? value : null)
          }),
          map((name: string) => (name ? this.filterProjects(name) : this.projects.slice()))
        )}
      );
  }
  //#endregion

  //#region public methods ----------------------------------------------------
  public displayProject(project: DtoProject): string {
    return project && project.name ? project.name : '';
  }
  //#endregion

  //#region forms API related methods -----------------------------------------
  public registerOnChange(fn: (_: any) => void): void {
    this.onChange = fn;
  }

  public writeValue(value: DtoProjectReportSelection): void {
    if (value) {
      this.value = value;
    }

    if (value === null) {
      this.projectInput.reset();
    }
  }

  public registerOnTouched(fn: (_: any) => void): void {
    this.onTouched = fn;
  }

  public validate(_: FormControl): unknown {
    return this.projectInput.valid ? null : { projectSelection: { valid: false } };
  }
  //#endregion

  //#region private methods ---------------------------------------------------
  private filterProjects(name: string): Array<DtoProject> {
    const filterValue = name.toLowerCase();

    return this.projects.filter((project: DtoProject) => project.name.toLowerCase().includes(filterValue));
  }
  //#endregion
}
