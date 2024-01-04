import { ClipboardModule } from '@angular/cdk/clipboard';
import { Component, OnInit, ViewChild } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import {
    ApiResponseError,
    MockProjects,
    MockResource,
    MockUsers,
    ProjectsEndpointAdmin,
    ReadResource
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '../../../../core';
import { UserService } from '../../../services/user.service';
import { PropertyToolbarComponent } from './property-toolbar.component';
import { of } from 'rxjs';

/**
 * Test host component to simulate parent component
 */
@Component({
    template: `
      <dsp-property-toolbar #propToolbar
        [resource]="parentResource"
        [showAllProps]="showAllProps"
        (toggleProps)="toggleProps($event)">
      </dsp-property-toolbar>`
})
class TestPropertyParentComponent implements OnInit {

    @ViewChild('propToolbar') propertyToolbarComponent: PropertyToolbarComponent;

    parentResource: ReadResource;

    showAllProps = true;

    constructor() { }

    ngOnInit() {

        MockResource.getTestThing().subscribe(
            response => {
                this.parentResource = response;
            },
            (error: ApiResponseError) => {
                console.error('Error to get the mock resource', error);
            }
        );
    }

    toggleProps(show: boolean) {
        this.showAllProps = show;
    }
}

describe('PropertyToolbarComponent', () => {
    let testHostComponent: TestPropertyParentComponent;
    let testHostFixture: ComponentFixture<TestPropertyParentComponent>;

    beforeEach(waitForAsync(() => {

        const adminSpyObj = {
            admin: {
                projectsEndpoint: jasmine.createSpyObj('projectsEndpoint', ['getProjectByIri'])
            }
        };

        const userServiceSpy = jasmine.createSpyObj('UserService', ['getUser']);

        TestBed.configureTestingModule({
            declarations: [
                PropertyToolbarComponent,
                TestPropertyParentComponent
            ],
            imports: [
                ClipboardModule,
                MatIconModule,
                MatMenuModule,
                MatSnackBarModule,
                MatTooltipModule,
                FormsModule
            ],
            providers: [
                {
                    provide: DspApiConnectionToken,
                    useValue: adminSpyObj
                },
                {
                    provide: UserService,
                    useValue: userServiceSpy
                },
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {

        const adminSpy = TestBed.inject(DspApiConnectionToken);

        // mock getProjectByIri response
        (adminSpy.admin.projectsEndpoint as jasmine.SpyObj<ProjectsEndpointAdmin>).getProjectByIri.and.callFake(
            () => {
                const project = MockProjects.mockProject();
                return of(project);
            }
        );

        // mock getUserByIri response
        const userSpy = TestBed.inject(UserService);

        // mock getUserByIri response
        (userSpy as jasmine.SpyObj<UserService>).getUser.and.callFake(
            () => {
                const user = MockUsers.mockUser();

                return of(user.body);
            }
        );

        testHostFixture = TestBed.createComponent(TestPropertyParentComponent);
        testHostComponent = testHostFixture.componentInstance;
        testHostFixture.detectChanges();

        expect(testHostComponent).toBeTruthy();
    });

    it('should get the resource testding', () => {

        expect(testHostComponent.parentResource).toBeTruthy();
        expect(testHostComponent.parentResource.id).toEqual('http://rdfh.ch/0001/H6gBWUuJSuuO-CilHV8kQw');
        expect(testHostComponent.parentResource.label).toEqual('testding');

    });

    describe('Toolbar', () => {
        let hostCompDe;
        let propertyToolbarComponentDe;

        beforeEach(() => {
            expect(testHostComponent.propertyToolbarComponent).toBeTruthy();

            hostCompDe = testHostFixture.debugElement;

            propertyToolbarComponentDe = hostCompDe.query(By.directive(PropertyToolbarComponent));

            expect(testHostComponent).toBeTruthy();

            testHostFixture.detectChanges();
        });

        it('should have the label "testding"', () => {
            const resLabelDebugElement = propertyToolbarComponentDe.query(By.css('h3.label'));
            const resLabelNativeElement = resLabelDebugElement.nativeElement;

            expect(resLabelNativeElement.textContent.trim()).toBe('testding');
        });

        it('should toggle list of properties', () => {
            const resLabelDebugElement = propertyToolbarComponentDe.query(By.css('button.toggle-props'));
            const resLabelNativeElement = resLabelDebugElement.nativeElement;
            // the button contains an icon "unfold_less" and the text "Decrease properties"
            expect(resLabelNativeElement.textContent.trim()).toBe('unfold_lessHide empty properties');

            resLabelNativeElement.click();

            testHostFixture.detectChanges();

            // the button contains an icon "unfold_more" and the text "Increase properties"
            expect(resLabelNativeElement.textContent.trim()).toBe('unfold_moreShow all properties');

        });
    });


    // TODO: currently not possible to test copy to clipboard from Material Angular
    // https://stackoverflow.com/questions/60337742/test-copy-to-clipboard-function
});
