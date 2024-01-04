import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PageComponent } from './page.component';
import { ReadTextValueAsHtmlComponent } from '../../properties/read-text-value-as-html/read-text-value-as-html.component';
import { MathJaxDirective } from '../../directives/mathjax.directive';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { ReadTextValueComponent } from '../../properties/read-text-value/read-text-value.component';
import { AppInitService, DspApiConnectionToken } from '../../dsp-ui-lib/core';
import { DspViewerModule } from '../../dsp-ui-lib/viewer';
import {
    ReadIntValue,
    ReadLinkValue,
    ReadResource,
    ReadResourceSequence,
    ResourcesEndpointV2,
    SearchEndpointV2
} from '@dasch-swiss/dsp-js';

describe('PageComponent', () => {
    let component: PageComponent;
    let fixture: ComponentFixture<PageComponent>;

    const id = 'http://rdfh.ch/0801/gggg';

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
            declarations: [
                PageComponent,
                ReadTextValueAsHtmlComponent,
                ReadTextValueComponent,
                MathJaxDirective
            ],
            imports: [
                RouterTestingModule,
                MatListModule,
                MatIconModule,
                MatMenuModule,
                DspViewerModule
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
        const partOfVal = new ReadLinkValue();
        partOfVal.strval = '1';
        partOfVal.property = 'http://0.0.0.0:3333/ontology/0801/beol/v2#partOfValue';
        partOfVal.linkedResourceIri = '';

        const seqnumVal = new ReadIntValue();
        seqnumVal.int = 2;
        seqnumVal.property = 'http://0.0.0.0:3333/ontology/0801/beol/v2#seqnum';

        res.properties = {
            'http://0.0.0.0:3333/ontology/0801/beol/v2#partOfValue': [partOfVal],
            'http://0.0.0.0:3333/ontology/0801/beol/v2#seqnum': [seqnumVal]
        };

        (dspServiceSpy.v2.res as jasmine.SpyObj<ResourcesEndpointV2>).getResource.and.returnValue(of(res));
        (dspServiceSpy.v2.search as jasmine.SpyObj<SearchEndpointV2>).doExtendedSearch.and.returnValue(of(new ReadResourceSequence([])));

        fixture = TestBed.createComponent(PageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
