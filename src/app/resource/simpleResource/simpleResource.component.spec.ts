import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { MaterialModule } from '../../material-module';
import { SimpleResourceComponent } from './simpleResource.component';
import { ReadTextValueAsHtmlComponent } from '../../properties/read-text-value-as-html/read-text-value-as-html.component';
import { ReadListValueComponent } from '../../properties/read-list-value/read-list-value.component';
import { MathJaxDirective } from '../../directives/mathjax.directive';
import { DspApiConnectionToken } from '../../dsp-ui-lib/core';
import { ReadResource, ReadResourceSequence, ResourcesEndpointV2, SearchEndpointV2 } from '@dasch-swiss/dsp-js';

describe('SimpleResourceComponent', () => {
    let component: SimpleResourceComponent;
    let fixture: ComponentFixture<SimpleResourceComponent>;

    const id = 'http://rdfh.ch/0801/qEy1S5u4Tsurt2wU58J6zw'; // letter nr. 001

    beforeEach(waitForAsync(() => {
        const dspConnectionSpy = {
            v2: {
                res: jasmine.createSpyObj('res', ['getResource']),
                search: jasmine.createSpyObj('search', ['doExtendedSearch'])
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
                SimpleResourceComponent,
                MathJaxDirective,
                ReadTextValueAsHtmlComponent,
                ReadListValueComponent,
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
                { provide: DspApiConnectionToken, useValue: dspConnectionSpy }
            ]
        })
            .compileComponents();

    }));

    beforeEach(() => {
        const dspServiceSpy = TestBed.inject(DspApiConnectionToken);

        (dspServiceSpy.v2.res as jasmine.SpyObj<ResourcesEndpointV2>).getResource.and.returnValue(of(new ReadResource()));
        (dspServiceSpy.v2.search as jasmine.SpyObj<SearchEndpointV2>).doExtendedSearch.and.returnValue(of(new ReadResourceSequence([])));

        fixture = TestBed.createComponent(SimpleResourceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
