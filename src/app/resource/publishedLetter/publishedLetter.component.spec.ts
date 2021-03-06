import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Location } from '@angular/common';
import { MaterialModule } from '../../material-module';
import { ActivatedRoute } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { PublishedLetterComponent } from './publishedLetter.component';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { ReadTextValueAsHtmlComponent } from '../../properties/read-text-value-as-html/read-text-value-as-html.component';
import { MathJaxDirective } from '../../directives/mathjax.directive';
import { ReadTextValueComponent } from '../../properties/read-text-value/read-text-value.component';
import { AppInitService, DspApiConnectionToken } from '@dasch-swiss/dsp-ui';
import { ReadResource, ReadResourceSequence, ResourcesEndpointV2, SearchEndpointV2 } from '@dasch-swiss/dsp-js';

describe('PublishedLetterComponent', () => {
    let component: PublishedLetterComponent;
    let fixture: ComponentFixture<PublishedLetterComponent>;

    const id = 'http://rdfh.ch/0802/o2zZYlxUTnqPSx3pW0h7nQ'; // Olms Hildesheim id

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

        TestBed.configureTestingModule({
            imports: [
                MaterialModule,
                HttpClientModule,
                HttpClientTestingModule,
                RouterTestingModule
            ],
            declarations: [
                PublishedLetterComponent,
                ReadTextValueAsHtmlComponent,
                ReadTextValueComponent,
                MathJaxDirective
            ],
            providers: [
                { provide: Location },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        paramMap: of({
                            get: () => {
                                return id;
                            }
                        })
                    }
                },
                { provide: AppInitService, useValue: appInitServiceMock },
                { provide: DspApiConnectionToken, useValue: dspConnectionSpy }
            ]
        })
            .compileComponents();

    }));

    beforeEach(() => {
        const dspServiceSpy = TestBed.inject(DspApiConnectionToken);

        (dspServiceSpy.v2.res as jasmine.SpyObj<ResourcesEndpointV2>).getResource.and.returnValue(of(new ReadResource()));
        (dspServiceSpy.v2.search as jasmine.SpyObj<SearchEndpointV2>).doExtendedSearch.and.returnValue(of(new ReadResourceSequence([])));

        fixture = TestBed.createComponent(PublishedLetterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();

    });
});
