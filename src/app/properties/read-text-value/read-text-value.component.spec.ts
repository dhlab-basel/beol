import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ReadTextValueComponent } from './read-text-value.component';
import { ReadTextValueAsHtmlComponent } from '../read-text-value-as-html/read-text-value-as-html.component';
import { MathJaxDirective } from '../../directives/mathjax.directive';
import { Component, DebugElement, OnInit, ViewChild } from '@angular/core';
import { DspViewerModule, TextValueAsStringComponent } from '../../dsp-ui-lib/viewer';
import { By } from '@angular/platform-browser';
import {
    Constants,
    ReadResource,
    ReadTextValue,
    ReadTextValueAsHtml,
    ReadTextValueAsString
} from '@dasch-swiss/dsp-js';
import { BeolService } from '../../services/beol.service';

describe('ReadTextValueComponent', () => {
    let testHostComponent: TestHostComponent;
    let testHostFixture: ComponentFixture<TestHostComponent>;

    beforeEach(waitForAsync(() => {
        const appInitServiceSpy = jasmine.createSpyObj('AppInitService', ['getSettings']);

        TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
                MatSnackBarModule,
                DspViewerModule
            ],
            declarations: [
                ReadTextValueComponent,
                ReadTextValueAsHtmlComponent,
                MathJaxDirective,
                TestHostComponent
            ],
            providers: [
                {
                    provide: BeolService, useValue: {} // mock BeolService because it has its own deps
                }
            ]
        })
            .compileComponents();

        appInitServiceSpy.getSettings.and.returnValue({ ontologyIRI: 'http://0.0.0.0:3333' });

    }));

    beforeEach(() => {
        testHostFixture = TestBed.createComponent(TestHostComponent);
        testHostComponent = testHostFixture.componentInstance;
        testHostFixture.detectChanges();

        expect(testHostComponent).toBeTruthy();
    });

    it('should create', () => {
        expect(testHostComponent.textValueComponent).toBeTruthy();

        expect(testHostComponent.textValueComponent.valueObject.id).toEqual('http://rdfh.ch/0802/V/values/Q');
        expect(testHostComponent.textValueComponent.valueObject.property).toEqual('http://0.0.0.0/ontology/0801/beol/v2#hasName');

        expect(testHostComponent.textValueComponent.bindEvents).toBeFalsy();


    });

    it('should have created a TextValueAsStringComponent with the correct value', () => {

        const hostCompDe = testHostFixture.debugElement;

        const textValDe: DebugElement = hostCompDe.query(By.directive(TextValueAsStringComponent));

        expect(textValDe).toBeTruthy();

        expect(textValDe.componentInstance).toBeTruthy();

        const textValComp: TextValueAsStringComponent = textValDe.componentInstance as TextValueAsStringComponent;

        expect(textValComp.displayValue.id).toEqual('http://rdfh.ch/0802/V/values/Q');

        expect(textValComp.displayValue.property).toEqual('http://0.0.0.0/ontology/0801/beol/v2#hasName');

        expect(textValComp.displayValue.text).toEqual('test string');

    });

    /*it('should have created a TextValueAsXmlComponent with the correct value', () => {

      testHostComponent.textVal =
          new ReadTextValueAsXml('http://rdfh.ch/0802/V/values/Y',
              'http://0.0.0.0/ontology/0801/beol/v2#hasXml',
              '<div>test</div>', 'http://rdfh.ch/0802/mappings/test');

      testHostFixture.detectChanges();

      const hostCompDe = testHostFixture.debugElement;

      const textValDe: DebugElement = hostCompDe.query(By.directive(TextValueAsXmlComponent));

      expect(textValDe).toBeTruthy();

      expect(textValDe.componentInstance).toBeTruthy();

      const textValComp: TextValueAsXmlComponent = textValDe.componentInstance as TextValueAsXmlComponent;

      expect(textValComp.valueObject.id).toEqual('http://rdfh.ch/0802/V/values/Y');

      expect(textValComp.valueObject.propIri).toEqual('http://0.0.0.0/ontology/0801/beol/v2#hasXml');

      expect(textValComp.valueObject.xml).toEqual('<div>test</div>');

    });*/

    it('should have created a ReadTextAsHtmlComponent with the correct value', () => {

        const htmlVal = new ReadTextValueAsHtml();
        htmlVal.id = 'http://rdfh.ch/0802/V/values/Z';
        htmlVal.property = 'http://0.0.0.0/ontology/0801/beol/v2#hasText';
        htmlVal.html = '<div>test</div>';
        htmlVal.strval = htmlVal.html;
        htmlVal.type = Constants.TextValue;

        testHostComponent.textVal = htmlVal;

        testHostComponent.bindEvents = true;

        testHostFixture.detectChanges();

        const hostCompDe = testHostFixture.debugElement;

        const textValDe: DebugElement = hostCompDe.query(By.directive(ReadTextValueAsHtmlComponent));

        expect(textValDe).toBeTruthy();

        expect(textValDe.componentInstance).toBeTruthy();

        const textValComp: ReadTextValueAsHtmlComponent = textValDe.componentInstance as ReadTextValueAsHtmlComponent;

        expect(textValComp.valueObject.id).toEqual('http://rdfh.ch/0802/V/values/Z');

        expect(textValComp.valueObject.property).toEqual('http://0.0.0.0/ontology/0801/beol/v2#hasText');

        expect(textValComp.valueObject.html).toEqual('<div>test</div>');

        expect(textValComp.bindEvents).toBeTruthy();

    });
});

/**
 * Test host component to simulate parent component.
 */
@Component({
    template: `
        <read-text-value #textValComp
                         [valueObject]="textVal"
                         [bindEvents]="bindEvents"
                         [resource]="res">
        </read-text-value>`
})
class TestHostComponent implements OnInit {

    @ViewChild('textValComp', { static: false }) textValueComponent: ReadTextValueComponent;

    textVal: ReadTextValue;
    bindEvents = false;
    res: ReadResource;

    constructor() {
    }

    ngOnInit() {
        const textVal = new ReadTextValueAsString();
        textVal.id = 'http://rdfh.ch/0802/V/values/Q';
        textVal.property = 'http://0.0.0.0/ontology/0801/beol/v2#hasName';
        textVal.text = 'test string';
        textVal.type = Constants.TextValue;

        this.textVal = textVal;

        this.res = new ReadResource();

    }
}
