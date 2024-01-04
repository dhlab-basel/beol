import { TeiLinkDirective } from './tei-link.directive';
import { Component, DebugElement, OnInit } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AppInitService } from '../dsp-ui-lib/core';

describe('TeiLinkDirective', () => {
    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;

    beforeEach(() => {
        const appInitServiceSpy = {
            config: {
                ontologyIRI: 'http://0.0.0.0:3333'
            }
        };

        TestBed.configureTestingModule({
            imports: [],
            declarations: [
                TestComponent,
                TeiLinkDirective
            ],
            providers: [
                { provide: AppInitService, useValue: appInitServiceSpy }
            ]
        })
            .compileComponents();

    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create an instance', () => {
        expect(component).toBeTruthy();
    });

    // it('should create a TEI link for letter', () => {
    //
    //     const compDe = fixture.debugElement;
    //
    //     const spanDe: DebugElement = compDe.query(By.css('span'));
    //
    //     expect(spanDe.nativeElement.innerHTML)
    //         .toEqual('<a href="http://0.0.0.0:3333/v2/tei/http%3A%2F%2Frdfh.ch%2F0801%2FmqHSOB0xR-mzdUleQiwZ5Q?textProperty=http%3A%2F%2F0.0.0.0%3A3333%2Fontology%2F0801%2Fbeol%2Fv2%23hasText&amp;mappingIri=http%3A%2F%2Frdfh.ch%2Fprojects%2FyTerZGyxjZVqFMNNKXCDPF%2Fmappings%2FBEOLTEIMapping&amp;gravsearchTemplateIri=http%3A%2F%2Frdfh.ch%2F0801%2FtemplateIri&amp;teiHeaderXSLTIri=http%3A%2F%2Frdfh.ch%2F0801%2FheaderIri" target="_blank">TEI/XML</a>');
    // });

    it('should not create a TEI link for a resource type without a configuration', () => {

        component.resType = 'http://0.0.0.0:3333/ontology/0801/beol/v2#person';

        fixture.detectChanges();

        const compDe = fixture.debugElement;

        const spanDe: DebugElement = compDe.query(By.css('span'));

        expect(spanDe.nativeElement.innerHTML).toEqual('');

    });
});

@Component({
    template: `
        <span appTeiLink
              [resourceType]="resType"
              [resourceIri]="resIri"></span>
    `
})
class TestComponent implements OnInit {

    resIri: string;
    resType: string;

    ngOnInit() {
        this.resIri = 'http://rdfh.ch/0801/mqHSOB0xR-mzdUleQiwZ5Q';
        this.resType = 'http://0.0.0.0:3333/ontology/0801/beol/v2#letter';
    }
}
