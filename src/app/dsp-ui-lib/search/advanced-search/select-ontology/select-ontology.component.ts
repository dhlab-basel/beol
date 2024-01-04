import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { OntologiesMetadata } from '@dasch-swiss/dsp-js';
import { Subscription } from 'rxjs';

@Component({
    selector: 'dsp-select-ontology',
    templateUrl: './select-ontology.component.html',
    styleUrls: ['./select-ontology.component.scss']
})
export class SelectOntologyComponent implements OnInit, OnDestroy {

    @Input() formGroup: UntypedFormGroup;

    @Input() ontologiesMetadata: OntologiesMetadata;

    @Output() ontologySelected = new EventEmitter<string>();

    form: UntypedFormGroup;

    ontologyChangesSubscription: Subscription;

    constructor(@Inject(UntypedFormBuilder) private _fb: UntypedFormBuilder) {
    }

    ngOnInit() {

        // build a form for the named graph selection
        this.form = this._fb.group({
            ontologies: [null, Validators.required]
        });

        // emit Iri of the ontology when selected
        this.ontologyChangesSubscription = this.form.valueChanges.subscribe((data) => {
            this.ontologySelected.emit(data.ontologies);
        });

        // add form to the parent form group
        this.formGroup.addControl('ontologies', this.form);

    }

    ngOnDestroy() {
        if (this.ontologyChangesSubscription !== undefined) {
            this.ontologyChangesSubscription.unsubscribe();
        }
    }

}
