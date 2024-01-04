import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from '../../material-module';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { LetterComponent } from './letter.component';
import { ReadTextValueAsHtmlComponent } from '../../properties/read-text-value-as-html/read-text-value-as-html.component';
import { ReadListValueComponent } from '../../properties/read-list-value/read-list-value.component';
import { MathJaxDirective } from '../../directives/mathjax.directive';
import { ReadTextValueComponent } from '../../properties/read-text-value/read-text-value.component';
import { HanCatalogueDirective } from '../../directives/han-catalogue.directive';
import { TeiLinkDirective } from '../../directives/tei-link.directive';
import { AppInitService, DspApiConnectionToken } from '../../dsp-ui-lib/core';
import { ReadResource, ReadResourceSequence, ResourcesEndpointV2, SearchEndpointV2 } from '@dasch-swiss/dsp-js';

describe('LetterComponent', () => {
    let component: LetterComponent;
    let fixture: ComponentFixture<LetterComponent>;

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
                ontologyIRI: 'http://0.0.0.0:3333',
                tei: {
                    'http://0.0.0.0:3333/ontology/0801/beol/v2#letter': {
                        'textProperty': 'http://0.0.0.0:3333/ontology/0801/beol/v2#hasText',
                        'mappingIRI': 'http://rdfh.ch/projects/yTerZGyxjZVqFMNNKXCDPF/mappings/BEOLTEIMapping',
                        'gravsearchTemplateIri': 'http://rdfh.ch/0801/templateIri',
                        'teiHeaderXSLTIri': 'http://rdfh.ch/0801/headerIri'
                    }
                }
            }
        };

        TestBed.configureTestingModule({
            imports: [
                MaterialModule,
                RouterTestingModule,
                HttpClientModule,
                HttpClientTestingModule
            ],
            declarations: [
                LetterComponent,
                MathJaxDirective,
                ReadTextValueAsHtmlComponent,
                ReadListValueComponent,
                ReadTextValueComponent,
                HanCatalogueDirective,
                TeiLinkDirective
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

        (dspServiceSpy.v2.res as jasmine.SpyObj<ResourcesEndpointV2>).getResource.and.returnValue(of(new ReadResource()));
        (dspServiceSpy.v2.search as jasmine.SpyObj<SearchEndpointV2>).doExtendedSearch.and.returnValue(of(new ReadResourceSequence([])));

        fixture = TestBed.createComponent(LetterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
