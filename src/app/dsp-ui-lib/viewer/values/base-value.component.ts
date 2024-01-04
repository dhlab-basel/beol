import { Input, Directive } from '@angular/core';
import { CreateValue, ReadValue, UpdateValue } from '@dasch-swiss/dsp-js';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Directive()
export abstract class BaseValueComponent {

    shouldShowComment = false;

    /**
     * Value to be displayed, if any.
     */
    @Input() abstract displayValue?: ReadValue;

    /**
     * Sets the mode of the component.
     */
    @Input() mode: 'read' | 'update' | 'create' | 'search';

    /**
     * Parent FormGroup that contains all child FormGroups
     */
    @Input() parentForm?: UntypedFormGroup;

    /**
     * name of the FormGroup, used to add to the parentForm because the name needs to be unique
     */
    @Input() formName = 'Untitled FormGroup';

    /**
     * Controls if the value should be required.
     */
    @Input() valueRequiredValidator = true;

    /**
     * FormControl element for the value.
     */
    abstract valueFormControl: UntypedFormControl;

    /**
     * FormControl element for the comment on the value.
     */
    abstract commentFormControl: UntypedFormControl;

    /**
     * FormGroup that contains FormControl elements.
     */
    abstract form: UntypedFormGroup;

    /**
     * Subscription used for when the value changes.
     */
    abstract valueChangesSubscription: Subscription;

    /**
     * Custom validators for a specific value type.
     * Can be initialized to an empty array if not needed.
     */
    abstract customValidators: ValidatorFn[];

    /**
     * Standard implementation for comparison of primitive values.
     * Returns true if two values are equal.
     *
     * @param initValue Initially given value.
     * @param curValue Current value.
     */
    standardValueComparisonFunc(initValue: any, curValue: any): boolean {
        return initValue === curValue;
    }

    /**
     * Standard implementation to determine if a value or comment have been changed.
     *
     * @param initValue Initially given value.
     * @param initComment Initially given comment.
     * @param commentFormControl FormControl of the current comment.
     */
    standardValidatorFunc: (val: any, comment: string, commentCtrl: UntypedFormControl)
        => ValidatorFn = (initValue: any, initComment: string, commentFormControl: UntypedFormControl): ValidatorFn => {
            return (control: AbstractControl): { [key: string]: any } | null => {

                const invalid = this.standardValueComparisonFunc(initValue, control.value)
                    && (initComment === commentFormControl.value || (initComment === null && commentFormControl.value === ''));

                return invalid ? { valueNotChanged: { value: control.value } } : null;
            };
        };

    /**
     * Returns the initially given value set via displayValue.
     * Returns null if no value was given.
     */
    abstract getInitValue(): any;

    /**
     * Returns the initially given value comment set via displayValue.
     * Returns null if no value comment was given.
     */
    getInitComment(): string | null {

        if (this.displayValue !== undefined && this.displayValue.valueHasComment !== undefined) {
            return this.displayValue.valueHasComment;
        } else {
            return null;
        }
    }

    /**
     * Resets the form control elements
     * with displayValue's value and value comment.
     * Depending on the mode, validators are reset.
     */
    resetFormControl(): void {
        if (this.valueFormControl !== undefined && this.commentFormControl !== undefined) {

            const initialValue = this.getInitValue();
            const initialComment = this.getInitComment();
            this.valueFormControl.reset();
            this.valueFormControl.setValue(initialValue);
            this.commentFormControl.setValue(initialComment);

            this.valueFormControl.clearValidators();

            // set validators depending on mode
            if (this.mode === 'update') {
                // console.log('reset update validators');
                this.valueFormControl.setValidators([Validators.required, this.standardValidatorFunc(initialValue, initialComment, this.commentFormControl)].concat(this.customValidators));
            } else {
                // console.log('reset read/create validators');
                if (this.valueRequiredValidator) {
                    this.valueFormControl.setValidators([Validators.required].concat(this.customValidators));
                } else {
                    this.valueFormControl.setValidators(this.customValidators);
                }
            }

            this.valueFormControl.updateValueAndValidity();
        }
    }

    /**
     * Unsubscribes from the valueChangesSubscription
     */
    unsubscribeFromValueChanges(): void {
        if (this.valueChangesSubscription !== undefined) {
            this.valueChangesSubscription.unsubscribe();
        }
    }

    /**
     * Hide comment field by default if in READ mode
     */
    updateCommentVisibility(): void {
        this.shouldShowComment = this.mode === 'read' ? true : false;
    }

    /**
     * Toggles visibility of the comment field regardless of the mode
     */
    toggleCommentVisibility(): void {
        this.shouldShowComment = !this.shouldShowComment;
    }

    /**
     * Returns a value that is to be created.
     * Returns false if invalid.
     */
    abstract getNewValue(): CreateValue | false;

    /**
     * Returns a value that is to be updated.
     * Returns false if invalid.
     */
    abstract getUpdatedValue(): UpdateValue | false;

    /**
     * Add the value components FormGroup to a parent FormGroup if one is defined
     */
    addToParentFormGroup(name: string, form: UntypedFormGroup) {
        if (this.parentForm) {
            this.parentForm.addControl(name, form);
        }
    }

    /**
     * Remove the value components FormGroup from a parent FormGroup if one is defined
     */
    removeFromParentFormGroup(name: string) {
        if (this.parentForm) {
            this.parentForm.removeControl(name);
        }
    }

    /**
     * Checks if the value is empty.
     */
    isEmptyVal(): boolean {
        return this.valueFormControl.value === null || this.valueFormControl.value === '';
    }
}
