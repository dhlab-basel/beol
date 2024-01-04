import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MaterialModule } from '../material-module';
import { LandingPageComponent } from './landing-page.component';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppInitService } from '../dsp-ui-lib/core';
import { BeolService } from '../services/beol.service';

describe('LandingPageComponent', () => {
    let component: LandingPageComponent;
    let fixture: ComponentFixture<LandingPageComponent>;

    beforeEach(waitForAsync(() => {

        const appInitServiceMock = {
            config: {
                ontologyIRI: 'http://0.0.0.0:3333'
            }
        };

        const beolServiceSpy = jasmine.createSpyObj('BeolService', ['getEntriesForManuscript']); // see https://angular.io/guide/testing#angular-testbed

        TestBed.configureTestingModule({
            imports: [
                MaterialModule,
                RouterTestingModule,
                BrowserAnimationsModule
            ],
            declarations: [LandingPageComponent],
            providers: [
                { provide: BeolService, useValue: beolServiceSpy },
                { provide: AppInitService, useValue: appInitServiceMock }
            ]
        })
            .compileComponents();

    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LandingPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
