import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from '../../material-module';
import { of } from 'rxjs';
import { LeibnizLetterComponent } from './leibniz-letter.component';
import { ReadTextValueAsHtmlComponent } from '../../properties/read-text-value-as-html/read-text-value-as-html.component';
import { ReadListValueComponent } from '../../properties/read-list-value/read-list-value.component';
import { MathJaxDirective } from '../../directives/mathjax.directive';
import { ReadTextValueComponent } from '../../properties/read-text-value/read-text-value.component';
import { LeibnizPortalDirective } from '../../directives/leibniz-portal.directive';
import { SanitizeHtmlPipe } from '../../pipes/sanitize-html.pipe';
import { AppInitService, DspApiConnectionToken } from '../../dsp-ui-lib/core';
import { DspActionModule } from '../../dsp-ui-lib/action';
import { ReadResource, ReadResourceSequence, ReadTextValueAsString, ResourcesEndpointV2, SearchEndpointV2 } from '@dasch-swiss/dsp-js';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClientModule } from '@angular/common/http';
import * as BeolConstants from '../../beol-constants';

describe('LeibnizLetterComponent', () => {
    let component: LeibnizLetterComponent;
    let fixture: ComponentFixture<LeibnizLetterComponent>;

    const id = 'http://rdfh.ch/0801/7ZvL2A5PQ9C4eAmr-n26gw';
    const leibnizApiBasePath = BeolConstants.LEIBNIZ_SOLR_API_BASE_PATH;

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
                DspActionModule,
                HttpClientTestingModule,
                HttpClientModule
            ],
            declarations: [
                LeibnizLetterComponent,
                MathJaxDirective,
                ReadTextValueAsHtmlComponent,
                ReadListValueComponent,
                ReadTextValueComponent,
                LeibnizPortalDirective,
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
        letterIdVal.property = 'http://0.0.0.0:3333/ontology/0801/leibniz/v2#letterID';

        res.properties = {
            'http://0.0.0.0:3333/ontology/0801/leibniz/v2#letterID': [letterIdVal]
        };

        (dspServiceSpy.v2.res as jasmine.SpyObj<ResourcesEndpointV2>).getResource.and.returnValue(of(res));
        (dspServiceSpy.v2.search as jasmine.SpyObj<SearchEndpointV2>).doExtendedSearch.and.returnValue(of(new ReadResourceSequence([])));

        fixture = TestBed.createComponent(LeibnizLetterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        const httpTestingController = TestBed.inject(HttpTestingController);

        expect(component).toBeTruthy();

        httpTestingController
            .expectOne(leibnizApiBasePath + 'select?sort=type+asc&q=id%3A1+OR+(doc_id%3A1+AND+type%3Avariante)&rows=9999&wt=json')
            .flush({
                response: {
                docs: [{
                    volltext: 'text'
                }]
            }});
    });

    afterEach(() => {
        const httpTestingController = TestBed.inject(HttpTestingController);
        httpTestingController.verify();
    });
});
