import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CalendarDate, CalendarPeriod, GregorianCalendarDate } from 'jdnconvertiblecalendar';
import { DspViewerModule } from '../../../../../../viewer/viewer.module';
import { ValueLiteral } from '../operator';
import { SearchDateValueComponent } from './search-date-value.component';

/**
 * Test host component to simulate parent component.
 */
@Component({
    template: `
        <dsp-search-date-value #dateVal [formGroup]="form"></dsp-search-date-value>`
})
class TestHostComponent implements OnInit {

    form;

    @ViewChild('dateVal', { static: false }) dateValue: SearchDateValueComponent;

    constructor(@Inject(UntypedFormBuilder) private _fb: UntypedFormBuilder) {
    }

    ngOnInit() {
        this.form = this._fb.group({});
    }
}

describe('SearchDateValueComponent', () => {
    let testHostComponent: TestHostComponent;
    let testHostFixture: ComponentFixture<TestHostComponent>;

    let loader: HarnessLoader;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                BrowserAnimationsModule,
                ReactiveFormsModule,
                MatInputModule,
                MatDatepickerModule,
                DspViewerModule // needed because of DatePicker directive and calendar header
            ],
            declarations: [
                SearchDateValueComponent,
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
        expect(testHostComponent.dateValue).toBeTruthy();
    });

    it('should get a date', () => {

        const calDate = new CalendarDate(2018, 10, 30);
        testHostComponent.dateValue.form.controls['dateValue'].setValue(new GregorianCalendarDate(new CalendarPeriod(calDate, calDate)));

        const gregorianDate = new ValueLiteral('GREGORIAN:2018-10-30:2018-10-30', 'http://api.knora.org/ontology/knora-api/simple/v2#Date');

        const dateVal = testHostComponent.dateValue.getValue();

        expect(dateVal).toEqual(gregorianDate);

    });
});
