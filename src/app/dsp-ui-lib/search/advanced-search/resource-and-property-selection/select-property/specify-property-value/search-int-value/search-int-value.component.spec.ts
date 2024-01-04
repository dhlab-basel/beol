import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchIntValueComponent } from './search-int-value.component';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatInputModule } from '@angular/material/input';
import { ValueLiteral } from '../operator';
import { MatLegacyInputHarness as MatInputHarness } from '@angular/material/legacy-input/testing';

/**
 * Test host component to simulate parent component.
 */
@Component({
    template: `
        <dsp-search-int-value #intVal [formGroup]="form"></dsp-search-int-value>`
})
class TestHostComponent implements OnInit {

    form;

    @ViewChild('intVal', { static: false }) integerValue: SearchIntValueComponent;

    constructor(@Inject(UntypedFormBuilder) private _fb: UntypedFormBuilder) {
    }

    ngOnInit() {
        this.form = this._fb.group({});
    }
}

describe('SearchIntValueComponent', () => {
    let testHostComponent: TestHostComponent;
    let testHostFixture: ComponentFixture<TestHostComponent>;

    let loader: HarnessLoader;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                BrowserAnimationsModule,
                ReactiveFormsModule,
                MatInputModule
            ],
            declarations: [
                SearchIntValueComponent,
                TestHostComponent
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        testHostFixture = TestBed.createComponent(TestHostComponent);
        testHostComponent = testHostFixture.componentInstance;
        loader = TestbedHarnessEnvironment.loader(testHostFixture);

        testHostFixture.detectChanges();
    });

    it('should create', () => {
        expect(testHostComponent).toBeTruthy();
        expect(testHostComponent.integerValue).toBeTruthy();
    });

    it('should get an integer literal of 1', async () => {

        const matInput = await loader.getHarness(MatInputHarness);

        await matInput.setValue('1');

        const expectedIntLiteralVal = new ValueLiteral('1', 'http://www.w3.org/2001/XMLSchema#integer');

        expect(testHostComponent.integerValue.getValue()).toEqual(expectedIntLiteralVal);

    });

});
