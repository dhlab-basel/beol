import { Component, Input, OnChanges } from '@angular/core';
import { ReadResource, ReadTextValue, Constants } from '@dasch-swiss/dsp-js';
import { ValueService } from '../../dsp-ui-lib/viewer';

@Component({
    selector: 'read-text-value',
    templateUrl: './read-text-value.component.html',
    styleUrls: ['./read-text-value.component.scss']
})
export class ReadTextValueComponent implements OnChanges {

    private _valueObject: ReadTextValue; // value object representing text without markup, XML or HTML
    private _resource: ReadResource; // needed if text has standoff links
    private _bindEvents: boolean; // indicates if click and mouseover events have to be bound

    valueType: string;

    constants = Constants;

    @Input()
    set valueObject(value: ReadTextValue) {
        this._valueObject = value;
    }

    get valueObject() {
        return this._valueObject;
    }

    @Input()
    set resource(value: ReadResource) {
        this._resource = value;
    }

    get resource() {
        return this._resource;
    }

    @Input()
    set bindEvents(value: boolean) {
        this._bindEvents = value;
    }

    get bindEvents() {
        return this._bindEvents;
    }

    @Input() renderFigureRegions = false;

    constructor(private _valueTypeService: ValueService) {
    }

    ngOnChanges() {

        this.valueType = this._valueTypeService.getValueTypeOrClass(this.valueObject);

    }

}
