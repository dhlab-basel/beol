import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReadListValueComponent } from './read-list-value.component';
import { MathJaxDirective } from '../../directives/mathjax.directive';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Component, DebugElement, OnInit, ViewChild } from '@angular/core';
import { By } from '@angular/platform-browser';
import { AsyncSubject } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { AppInitService, DspApiConnectionToken } from '../../dsp-ui-lib/core';
import { ListNodeV2Cache } from '@dasch-swiss/dsp-js/src/cache/ListNodeV2Cache';
import { ListNodeV2, ReadListValue } from '@dasch-swiss/dsp-js';

describe('ReadListValueComponent', () => {
    let testHostComponent: TestHostComponent;
    let testHostFixture: ComponentFixture<TestHostComponent>;

    beforeEach(waitForAsync(() => {

        const dspConnectionSpy = {
            v2: {
                listNodeCache: jasmine.createSpyObj('listNodeCache', ['getNode'])
            }
        };

        const appInitServiceMock = {
            config: {
                ontologyIRI: 'http://0.0.0.0:3333'
            }
        };

        TestBed.configureTestingModule({
            declarations: [
                ReadListValueComponent,
                TestHostComponent,
                TestHostComponent2,
                MathJaxDirective // idea for mock: https://stackoverflow.com/questions/44495114/is-it-possible-to-mock-an-attribute-directive-in-angular
            ],
            imports: [
                RouterTestingModule,
                MatSnackBarModule,
                HttpClientModule
            ],
            providers: [
                { provide: AppInitService, useValue: appInitServiceMock },
                { provide: DspApiConnectionToken, useValue: dspConnectionSpy }
            ]
        })
            .compileComponents();

    }));

    beforeEach(() => {

        const listCacheServiceSpy = TestBed.inject(DspApiConnectionToken);

        (listCacheServiceSpy.v2.listNodeCache as jasmine.SpyObj<ListNodeV2Cache>).getNode.and.callFake((nodeIri) => {
            const subj = new AsyncSubject<ListNodeV2>();

            const node = new ListNodeV2();
            node.id = 'nodeIri';
            node.label = 'test' + nodeIri;

            subj.next(node);
            subj.complete();
            return subj;
        });

        testHostFixture = TestBed.createComponent(TestHostComponent);
        testHostComponent = testHostFixture.componentInstance;
        testHostFixture.detectChanges();

        expect(testHostComponent).toBeTruthy();
    });

    it('should create', () => {
        expect(testHostComponent.listValueComponent).toBeTruthy();
    });

    it('should have render math option set to "true" by default', () => {
        expect(testHostComponent.listValueComponent.renderMath).toBeTruthy();
    });

    it('should be equal to the list node label value "ListNodeLabel1"', () => {

        const listCacheServiceSpy = TestBed.inject(DspApiConnectionToken);

        expect(testHostComponent.listValueComponent.valueObject.listNode).toEqual('http://rdfh.ch/8be1b7cf7103');

        const hostCompDe = testHostFixture.debugElement;

        const listVal = hostCompDe.query(By.directive(ReadListValueComponent));

        const spanDebugElement: DebugElement = listVal.query(By.css('span'));

        const spanNativeElement: HTMLElement = spanDebugElement.nativeElement;

        expect(spanNativeElement.innerText).toEqual('testhttp://rdfh.ch/8be1b7cf7103');

        expect(listCacheServiceSpy.v2.listNodeCache.getNode).toHaveBeenCalledTimes(1);
        expect(listCacheServiceSpy.v2.listNodeCache.getNode).toHaveBeenCalledWith('http://rdfh.ch/8be1b7cf7103');

        const mathJaxDirDe: DebugElement = hostCompDe.query(By.directive(MathJaxDirective));

        expect(mathJaxDirDe).toBeTruthy();

    });

    it('should be equal to the list node label value "ListNodeLabel2"', () => {
        const listCacheServiceSpy = TestBed.inject(DspApiConnectionToken);

        const node = new ReadListValue();
        node.id = 'id';
        node.listNode = 'http://rdfh.ch/9sdf8sfd2jf9';
        testHostComponent.listValue = node;

        testHostFixture.detectChanges();

        const hostCompDe = testHostFixture.debugElement;

        const listVal = hostCompDe.query(By.directive(ReadListValueComponent));

        const spanDebugElement: DebugElement = listVal.query(By.css('span'));

        const spanNativeElement: HTMLElement = spanDebugElement.nativeElement;

        expect(spanNativeElement.innerText).toEqual('testhttp://rdfh.ch/9sdf8sfd2jf9');

        expect(listCacheServiceSpy.v2.listNodeCache.getNode).toHaveBeenCalledTimes(2);
        expect(listCacheServiceSpy.v2.listNodeCache.getNode).toHaveBeenCalledWith('http://rdfh.ch/8be1b7cf7103');
        expect(listCacheServiceSpy.v2.listNodeCache.getNode).toHaveBeenCalledWith('http://rdfh.ch/9sdf8sfd2jf9');

        const mathJaxDirDe: DebugElement = hostCompDe.query(By.directive(MathJaxDirective));

        expect(mathJaxDirDe).toBeTruthy();

    });

    it('should have render math option set to "false" through input by the parent component', () => {

        const testHostFixture2 = TestBed.createComponent(TestHostComponent2);
        const testHostComponent2 = testHostFixture2.componentInstance;
        testHostFixture2.detectChanges();

        expect(testHostComponent2).toBeTruthy();

        expect(testHostComponent2.listValueComponent.renderMath).toBeFalsy();

    });

});


/**
 * Test host component to simulate parent component.
 */
@Component({
    template: `
        <read-list-value #listVal [valueObject]="listValue"></read-list-value>`
})
class TestHostComponent implements OnInit {

    @ViewChild('listVal') listValueComponent: ReadListValueComponent;

    listValue;

    constructor() {
    }

    ngOnInit() {
        const listVal = new ReadListValue();
        listVal.id = 'id';
        listVal.property = 'propIri';
        listVal.listNode =  'http://rdfh.ch/8be1b7cf7103';
        this.listValue = listVal;
    }
}

/**
 * Test host component to simulate parent component.
 */
@Component({
    template: `
        <read-list-value #listVal [valueObject]="listValue" [renderMath]="renderMathInput"></read-list-value>`
})
class TestHostComponent2 implements OnInit {

    @ViewChild('listVal') listValueComponent: ReadListValueComponent;

    listValue;

    renderMathInput = false;

    constructor() {
    }

    ngOnInit() {
        const listVal = new ReadListValue();
        listVal.id = 'id';
        listVal.property = 'propIri';
        listVal.listNode =  'http://rdfh.ch/8be1b7cf7103';
        this.listValue = listVal;
    }
}
