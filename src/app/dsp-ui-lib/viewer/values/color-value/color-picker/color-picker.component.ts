import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Component, DoCheck, ElementRef, HostBinding, Input, OnDestroy, Optional, Self } from '@angular/core';
import { ControlValueAccessor, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, FormGroupDirective, NgControl, NgForm, Validators } from '@angular/forms';
import { CanUpdateErrorState, ErrorStateMatcher, mixinErrorState } from '@angular/material/core';
import { MatFormFieldControl } from '@angular/material/form-field';
import { Subject } from 'rxjs';

/** Error when invalid control is dirty, touched, or submitted. */
export class ColorPickerErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: UntypedFormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        const isSubmitted = form && form.submitted;
        return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
    }
}

class MatInputBase {
    readonly stateChanges = new Subject<void>();
    constructor(
        public _defaultErrorStateMatcher: ErrorStateMatcher,
        public _parentForm: NgForm,
        public _parentFormGroup: FormGroupDirective,
        public ngControl: NgControl) { }
}
const _MatInputMixinBase =
    mixinErrorState(MatInputBase);


@Component({
    selector: 'dsp-color-picker',
    templateUrl: './color-picker.component.html',
    styleUrls: ['./color-picker.component.scss'],
    providers: [
        { provide: MatFormFieldControl, useExisting: ColorPickerComponent }
    ]
})
export class ColorPickerComponent extends _MatInputMixinBase implements ControlValueAccessor, MatFormFieldControl<string>, DoCheck, CanUpdateErrorState, OnDestroy {

    static nextId = 0;

    private _required = false;
    private _disabled = false;
    private _placeholder: string;

    @Input() errorStateMatcher: ErrorStateMatcher;

    @HostBinding() id = `dsp-color-picker-${ColorPickerComponent.nextId++}`;

    @HostBinding('attr.aria-describedby') describedBy = '';

    colorForm: UntypedFormGroup;
    stateChanges = new Subject<void>();
    focused = false;
    errorState = false;
    controlType = 'dsp-color-picker';
    matcher = new ColorPickerErrorStateMatcher();

    onChange = (_: any) => { };
    onTouched = () => { };

    get empty() {
        const colorInput = this.colorForm.value;
        return !colorInput.color;
    }

    @HostBinding('class.floating')
    get shouldLabelFloat() {
        return this.focused || !this.empty;
    }

    @Input()
    get required() {
        return this._required;
    }

    set required(req) {
        this._required = coerceBooleanProperty(req);
        this.stateChanges.next();
    }

    @Input()
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        this._disabled = coerceBooleanProperty(value);
        this._disabled ? this.colorForm.disable() : this.colorForm.enable();
        this.stateChanges.next();
    }

    @Input()
    get placeholder() {
        return this._placeholder;
    }

    set placeholder(plh) {
        this._placeholder = plh;
        this.stateChanges.next();
    }

    setDescribedByIds(ids: string[]) {
        this.describedBy = ids.join(' ');
    }

    @Input()
    get value(): string | null {
        const colorValue = this.colorForm.value;
        if (colorValue !== null) {
            return colorValue.color;
        }
        return null;
    }

    set value(colorValue: string | null) {
        if (colorValue !== null) {
            this.colorForm.setValue({ color: colorValue });
        } else {
            this.colorForm.setValue({ color: null });
        }
        this.stateChanges.next();
    }

    constructor(
        fb: UntypedFormBuilder,
        @Optional() @Self() public ngControl: NgControl,
        private _fm: FocusMonitor,
        private _elRef: ElementRef<HTMLElement>,
        @Optional() _parentForm: NgForm,
        @Optional() _parentFormGroup: FormGroupDirective,
        _defaultErrorStateMatcher: ErrorStateMatcher) {

        super(_defaultErrorStateMatcher, _parentForm, _parentFormGroup, ngControl);

        this.colorForm = fb.group({
            color: [null, Validators.required]
        });

        _fm.monitor(_elRef.nativeElement, true).subscribe(origin => {
            this.focused = !!origin;
            this.stateChanges.next();
        });

        if (this.ngControl != null) {
            this.ngControl.valueAccessor = this;
        }

        this.placeholder = 'Click to select a color';
    }

    ngDoCheck() {
        if (this.ngControl) {
            this.updateErrorState();
        }
    }

    ngOnDestroy() {
        this.stateChanges.complete();
    }

    onContainerClick(event: MouseEvent) {
        if ((event.target as Element).tagName.toLowerCase() !== 'input') {
            this._elRef.nativeElement.querySelector('input').focus();
        }
    }

    writeValue(colorValue: string | null): void {
        this.value = colorValue;
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    _handleInput() {
        this.onChange(this.value);
    }

}
