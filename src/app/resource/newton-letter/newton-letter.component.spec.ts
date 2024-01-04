import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from '../../material-module';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { NewtonLetterComponent } from './newton-letter.component';
import { ReadTextValueAsHtmlComponent } from '../../properties/read-text-value-as-html/read-text-value-as-html.component';
import { ReadListValueComponent } from '../../properties/read-list-value/read-list-value.component';
import { MathJaxDirective } from '../../directives/mathjax.directive';
import { ReadTextValueComponent } from '../../properties/read-text-value/read-text-value.component';
import { NewtonProjectDirective } from '../../directives/newton-project.directive';
import { SanitizeHtmlPipe } from '../../pipes/sanitize-html.pipe';
import { AppInitService, DspApiConnectionToken } from '../../dsp-ui-lib/core';
import { DspActionModule } from '../../dsp-ui-lib/action';
import { ReadResource, ReadResourceSequence, ReadTextValueAsString, ResourcesEndpointV2, SearchEndpointV2 } from '@dasch-swiss/dsp-js';

describe('NewtonLetterComponent', () => {
    let component: NewtonLetterComponent;
    let fixture: ComponentFixture<NewtonLetterComponent>;

    const id = 'http://rdfh.ch/0801/7ZvL2A5PQ9C4eAmr-n26gw';

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
                RouterTestingModule,
                HttpClientModule,
                HttpClientTestingModule,
                DspActionModule
            ],
            declarations: [
                NewtonLetterComponent,
                MathJaxDirective,
                ReadTextValueAsHtmlComponent,
                ReadListValueComponent,
                ReadTextValueComponent,
                NewtonProjectDirective,
                SanitizeHtmlPipe
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
                { provide: AppInitService, useValue: appInitServiceMock },
                { provide: DspApiConnectionToken, useValue: dspConnectionSpy }
            ]
        })
            .compileComponents();



    }));

    beforeEach(() => {
        const dspServiceSpy = TestBed.inject(DspApiConnectionToken);

        const res = new ReadResource();
        const letterIdVal = new ReadTextValueAsString();
        letterIdVal.strval = '1';
        letterIdVal.property = 'http://0.0.0.0:3333/ontology/0801/newton/v2#newtonProjectID';

        res.properties = {
            'http://0.0.0.0:3333/ontology/0801/leibniz/v2#letterID': [letterIdVal]
        };

        (dspServiceSpy.v2.res as jasmine.SpyObj<ResourcesEndpointV2>).getResource.and.returnValue(of(res));

        (dspServiceSpy.v2.search as jasmine.SpyObj<SearchEndpointV2>).doExtendedSearch.and.returnValue(of(new ReadResourceSequence([])));

        fixture = TestBed.createComponent(NewtonLetterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    afterEach(() => {
        const httpTestingController = TestBed.inject(HttpTestingController);
        httpTestingController.verify();
    });
});
