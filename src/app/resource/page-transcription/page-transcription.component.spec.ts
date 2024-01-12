import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PageTranscriptionComponent } from './page-transcription.component';
import { RouterTestingModule } from '@angular/router/testing';
import { BeolService } from '../../services/beol.service';
import { AppInitService, DspApiConnectionToken } from '../../dsp-ui-lib/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';

describe('PageTranscriptionComponent', () => {
    let component: PageTranscriptionComponent;
    let fixture: ComponentFixture<PageTranscriptionComponent>;

    beforeEach(waitForAsync(() => {
        const dspConnectionSpy = {
            v2: {
                res: jasmine.createSpyObj('res', ['getResource']),
                search: jasmine.createSpyObj('search', ['doExtendedSearch'])
            }
        };

        const appInitServiceMock = {
            config: {
                ontologyIRI: 'http://0.0.0.0:3333'
            }
        };

        const beolServiceSpy = jasmine.createSpyObj('BeolService', ['getEntriesForManuscript']); // see https://angular.io/guide/testing#angular-testbed

        TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
                MatSnackBarModule,
                MatDialogModule
            ],
            declarations: [PageTranscriptionComponent],
            providers: [
                { provide: BeolService, useValue: beolServiceSpy },
                { provide: AppInitService, useValue: appInitServiceMock },
                { provide: DspApiConnectionToken, useValue: dspConnectionSpy }
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(PageTranscriptionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    fit('should create', () => {
        expect(component).toBeTruthy();
    });
});
