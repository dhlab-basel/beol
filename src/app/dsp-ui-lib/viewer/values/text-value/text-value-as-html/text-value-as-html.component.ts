import {Component, OnInit, Inject, Input, ElementRef} from '@angular/core';
import {BaseValueComponent} from '../../base-value.component';
import {ReadTextValueAsHtml} from '@dasch-swiss/dsp-js';
import {UntypedFormControl, UntypedFormGroup, FormBuilder} from '@angular/forms';
import {Subscription} from 'rxjs';

@Component({
  selector: 'dsp-text-value-as-html',
  templateUrl: './text-value-as-html.component.html',
  styleUrls: ['./text-value-as-html.component.scss']
})
export class TextValueAsHtmlComponent extends BaseValueComponent implements OnInit {

  @Input() displayValue?: ReadTextValueAsHtml;

  valueFormControl: UntypedFormControl;
  commentFormControl: UntypedFormControl;

  form: UntypedFormGroup;

  valueChangesSubscription: Subscription;

  customValidators = [];

  commentLabel = 'Comment';
  htmlFromKnora: string;
  comment: string;

  constructor() {
    super();
  }

  ngOnInit() {
    this.htmlFromKnora = this.getInitValue();
    this.comment = this.getInitComment();
  }

  getInitValue() {
    if (this.displayValue !== undefined) {
      return this.displayValue.html;
    } else {
      return null;
    }
  }

  // readonly
  getNewValue(): false {
    return false;
  }

  // readonly
  getUpdatedValue(): false {
    return false;
  }

}
