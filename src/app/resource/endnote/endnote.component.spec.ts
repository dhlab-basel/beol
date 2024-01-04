import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MaterialModule } from '../../material-module';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of } from 'rxjs';

import { EndnoteComponent } from './endnote.component';
import { ReadTextValueAsHtmlComponent } from '../../properties/read-text-value-as-html/read-text-value-as-html.component';
import { MathJaxDirective } from '../../directives/mathjax.directive';
import { RouterTestingModule } from '@angular/router/testing';
import { ReadTextValueComponent } from '../../properties/read-text-value/read-text-value.component';
import { AppInitService, DspApiConnectionToken } from '../../dsp-ui-lib/core';
import { ReadResource, ReadResourceSequence, ResourcesEndpointV2, SearchEndpointV2 } from '@dasch-swiss/dsp-js';

describe('EndnoteComponent', () => {
    let component: EndnoteComponent;
    let fixture: ComponentFixture<EndnoteComponent>;

    const locationStub = {
        back: jasmine.createSpy('back')
    };

    const id = 'http://rdfh.ch/0801/-cPynqayQI2hJZ1K7aRWMA';

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
                RouterTestingModule
            ],
            declarations: [
                EndnoteComponent,
                ReadTextValueAsHtmlComponent,
                MathJaxDirective,
                ReadTextValueComponent
            ],
            providers: [
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
                { provide: Location, useValue: locationStub },
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

        fixture = TestBed.createComponent(EndnoteComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
