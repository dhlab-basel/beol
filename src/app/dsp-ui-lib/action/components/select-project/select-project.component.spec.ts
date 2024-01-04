import { OverlayModule } from '@angular/cdk/overlay';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, ViewChild } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatAutocompleteHarness as MatAutocompleteHarness } from '@angular/material/autocomplete/testing';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MockProjects, ReadProject, UsersEndpointAdmin } from '@dasch-swiss/dsp-js';
import { of } from 'rxjs/internal/observable/of';
import { DspApiConnectionToken } from '../../../core/core.module';

import { SelectProjectComponent } from './select-project.component';

/**
 * Test host component to simulate parent component.
 */
@Component({
    selector: `dsp-select-project-host-component`,
    template: `
        <dsp-select-project #selectProject [userIri]="userIri" (selectedProject)="getSelectedProject($event)">
        </dsp-select-project>`
})
class TestHostSelectProjectComponent {

    @ViewChild('selectProject') selectProject: SelectProjectComponent;

    // userIRI filter for select-project component
    userIri = 'http://rdfh.ch/users/9XBCrDV3SRa7kS1WwynB4Q';

    getSelectedProject(selectedProject: ReadProject) {
        console.log(selectedProject);
    }

}

describe('SelectProjectComponent', () => {
    let testHostComponent: TestHostSelectProjectComponent;
    let testHostFixture: ComponentFixture<TestHostSelectProjectComponent>;
    let dspConnSpy;
    let loader: HarnessLoader;

    beforeEach(waitForAsync(() => {

        dspConnSpy = {
            admin: {
                usersEndpoint: jasmine.createSpyObj('usersEndpoint', ['getUserProjectMemberships'])
            }
        };

        TestBed.configureTestingModule({
            declarations: [
                SelectProjectComponent,
                TestHostSelectProjectComponent
            ],
            imports: [
                OverlayModule,
                FormsModule,
                ReactiveFormsModule,
                MatInputModule,
                MatIconModule,
                MatAutocompleteModule,
                MatSelectModule,
                MatOptionModule,
                BrowserAnimationsModule
            ],
            providers: [
                {
                    provide: DspApiConnectionToken,
                    useValue: dspConnSpy
                }
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {

        // mock getProjects response
        const valuesSpy = TestBed.inject(DspApiConnectionToken);

        (valuesSpy.admin.usersEndpoint as jasmine.SpyObj<UsersEndpointAdmin>).getUserProjectMemberships.and.callFake(
            (userIri) => {
                const projects = MockProjects.mockProjects();
                return of(projects);
            }
        );

        testHostFixture = TestBed.createComponent(TestHostSelectProjectComponent);
        testHostComponent = testHostFixture.componentInstance;
        loader = TestbedHarnessEnvironment.loader(testHostFixture);
        testHostFixture.detectChanges();
    });

    it('should create', () => {
        expect(testHostComponent.selectProject).toBeTruthy();
    });

    it('should get projects for given user on init', () => {
        const projSpy = TestBed.inject(DspApiConnectionToken);
        expect(projSpy.admin.usersEndpoint.getUserProjectMemberships).toHaveBeenCalledTimes(1);

        expect(testHostComponent.selectProject.projects).toBeDefined();
        expect(testHostComponent.selectProject.projects.length).toEqual(8);
    });

    it('should get filtered list of projects based on input', async () => {
        const autoCompleteHarness = await loader.getHarness(MatAutocompleteHarness);
        await autoCompleteHarness.enterText('knora');
        const options = await autoCompleteHarness.getOptions();

        expect(options.length).toEqual(2);
        expect(await options[0].getText()).withContext('DefaultSharedOntologiesProject');
    });
});
