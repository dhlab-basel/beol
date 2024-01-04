import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ApiResponseData, ApiResponseError, KnoraApiConnection, ProjectsResponse, ReadProject } from '@dasch-swiss/dsp-js';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { DspApiConnectionToken } from '../../../core/core.module';
import { SortingService } from '../../services/sorting.service';

@Component({
    selector: 'dsp-select-project',
    templateUrl: './select-project.component.html',
    styleUrls: ['./select-project.component.scss']
})
export class SelectProjectComponent implements OnInit {

    // user IRI so we could show only projects that belongs to this user
    @Input() userIri?: string;

    // selected project
    @Output() selectedProject: EventEmitter<ReadProject> = new EventEmitter<ReadProject>();

    // in case of an (api) error
    error: any;

    // filter projects while typing (autocomplete)
    filteredProjects: Observable<ReadProject[]>;

    // list of projects
    projects: ReadProject[];

    // form group
    selectProjectForm: UntypedFormGroup;
    projectNameFormControl: UntypedFormControl;

    constructor(
        @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection,
        private _sortingService: SortingService,
        private _formBuilder: UntypedFormBuilder
    ) {}

    ngOnInit(): void {

        // clean autocomplete list
        this.projects = [];

        // initialize form control element
        this.projectNameFormControl = new UntypedFormControl(null);

        // get list of all projects
        this.getAllProjects();

        this.selectProjectForm = this._formBuilder.group({
            projectName: this.projectNameFormControl
        });

        this.filteredProjects = this.projectNameFormControl.valueChanges
            .pipe(
                startWith(''),
                map(project => project ? this.filter(this.projects, project) : [])
            );
    }

    /**
     * Get all public projects from DSP-API
     */
    getAllProjects(): void {
        if (this.userIri) {
            this._dspApiConnection.admin.usersEndpoint.getUserProjectMemberships(this.userIri).subscribe(
                (response: ApiResponseData<ProjectsResponse>) => {
                    this.projects = this._sortingService.keySortByAlphabetical(response.body.projects, 'shortname');
                },
                (error: ApiResponseError) => {
                    console.error(error);
                    this.error = error;
                }
            );
        } else {
            this._dspApiConnection.admin.projectsEndpoint.getProjects().subscribe(
                (response: ApiResponseData<ProjectsResponse>) => {
                    this.projects = this._sortingService.keySortByAlphabetical(response.body.projects, 'shortname');
                },
                (error: ApiResponseError) => {
                    console.error(error);
                    this.error = error;
                }
            );
        }
    }

    resetInput(ev: Event) {
        ev.preventDefault();
        this.selectProjectForm.controls.projectName.reset('');
    }

    /**
     * filter a list while typing in auto complete input field
     * @param list List of options
     * @param name Value to filter by
     * @returns Filtered list of options
     */
    filter(list: ReadProject[], name: string) {
        return list.filter(project => {
                return (project.shortname.toLowerCase().includes(name.toLowerCase()) ||
                    project.longname.toLowerCase().includes(name.toLowerCase()) ||
                    project.shortcode.toLowerCase().includes(name.toLowerCase()));
            }
        );
    }

    /**
     * get information for selected project
     *
     * @param val project shortname
     */
    getProject(val: string) {
        // return readProject object
        let selected: ReadProject;
        for (const proj of this.projects) {
            if (proj.shortname === val) {
                selected = proj;
            }
        }
        this.selectedProject.emit(selected);
    }

}
