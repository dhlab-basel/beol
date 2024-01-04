import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { LeceLeooComponent } from './lece-leoo.component';
import { RouterTestingModule } from '@angular/router/testing';
import { BeolService } from '../services/beol.service';
import { AppInitService } from '../dsp-ui-lib/core';

describe('LeceLeooComponent', () => {
    let component: LeceLeooComponent;
    let fixture: ComponentFixture<LeceLeooComponent>;

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
            declarations: [LeceLeooComponent],
            providers: [
                { provide: BeolService, useValue: beolServiceSpy },
                { provide: AppInitService, useValue: appInitServiceMock }
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(LeceLeooComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
