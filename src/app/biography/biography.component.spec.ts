import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BiographyComponent } from './biography.component';
import { RouterTestingModule } from '@angular/router/testing';
import { BeolService } from '../services/beol.service';
import { AppInitService } from '../dsp-ui-lib/core';

describe('BibliographyComponent', () => {
    let component: BiographyComponent;
    let fixture: ComponentFixture<BiographyComponent>;

    beforeEach(waitForAsync(() => {

        const appInitServiceMock = {
            config: {
                ontologyIRI: 'http://0.0.0.0:3333'
            }
        };

        const beolServiceSpy = jasmine.createSpyObj('BeolService', ['getEntriesForManuscript']); // see https://angular.io/guide/testing#angular-testbed

        TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
            ],
            declarations: [BiographyComponent],
            providers: [
                { provide: BeolService, useValue: beolServiceSpy },
                { provide: AppInitService, useValue: appInitServiceMock }
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(BiographyComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
