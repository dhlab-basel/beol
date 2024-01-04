import {
    Component,
    Inject,
    Input,
    OnChanges,
    OnInit,
    QueryList,
    SimpleChanges,
    ViewChild,
    ViewChildren
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import {
    KnoraApiConnection,
    ReadOntology, ResourceClassAndPropertyDefinitions,
    ResourceClassDefinition,
    ResourcePropertyDefinition
} from '@dasch-swiss/dsp-js';
import { SelectResourceClassComponent } from './select-resource-class/select-resource-class.component';
import { SelectPropertyComponent } from './select-property/select-property.component';
import { DspApiConnectionToken } from '../../../core/core.module';


@Component({
  selector: 'dsp-resource-and-property-selection',
  templateUrl: './resource-and-property-selection.component.html',
  styleUrls: ['./resource-and-property-selection.component.scss']
})
export class ResourceAndPropertySelectionComponent implements OnInit, OnChanges {

    @Input() formGroup: UntypedFormGroup;

    @Input() activeOntology: string;

    @Input() resourceClassRestriction?: string;

    @Input() topLevel;

    form: UntypedFormGroup;

    activeResourceClass: ResourceClassDefinition;

    activeProperties: boolean[] = [];

    resourceClasses: ResourceClassDefinition[];

    properties: ResourcePropertyDefinition[];

    // reference to the component that controls the resource class selection
    @ViewChild('resourceClass') resourceClassComponent: SelectResourceClassComponent;

    // reference to the component controlling the property selection
    @ViewChildren('property') propertyComponents: QueryList<SelectPropertyComponent>;

    constructor(
        @Inject(UntypedFormBuilder) private _fb: UntypedFormBuilder,
        @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection) {
    }

    ngOnInit(): void {

        this.form = this._fb.group({});

        // add form to the parent form group
        this.formGroup.addControl('resourceAndPropertySelection', this.form);
    }

    ngOnChanges(changes: SimpleChanges) {
        this.getResourceClassesAndPropertiesForOntology(this.activeOntology);
    }

    getResourceClassesAndPropertiesForOntology(ontologyIri: string) {

        // reset active resource class definition
        this.activeResourceClass = undefined;

        // reset specified properties
        this.activeProperties = [];

        this._dspApiConnection.v2.ontologyCache.getOntology(ontologyIri).subscribe(
            (onto: Map<string, ReadOntology>) => {

                const resClasses = onto.get(ontologyIri).getClassDefinitionsByType(ResourceClassDefinition);

                if (this.resourceClassRestriction !== undefined) {
                    this.resourceClasses = resClasses.filter(
                        (resClassDef: ResourceClassDefinition) => resClassDef.id === this.resourceClassRestriction
                    );
                } else {
                    this.resourceClasses = resClasses;
                }

                this.properties = onto.get(ontologyIri).getPropertyDefinitionsByType(ResourcePropertyDefinition);
            },
            error => {
                console.error(error);
            }
        );
    }

    getPropertiesForResourceClass(resourceClassIri: string | null) {

        // reset specified properties
        this.activeProperties = [];

        // if the client undoes the selection of a resource class, use the active ontology as a fallback
        if (resourceClassIri === null) {
            this.getResourceClassesAndPropertiesForOntology(this.activeOntology);
        } else {

            this._dspApiConnection.v2.ontologyCache.getResourceClassDefinition(resourceClassIri).subscribe(
                (onto: ResourceClassAndPropertyDefinitions) => {

                    this.activeResourceClass = onto.classes[resourceClassIri];

                    this.properties = onto.getPropertyDefinitionsByType(ResourcePropertyDefinition);

                }
            );
        }
    }

    /**
     * @ignore
     * Add a property to the search form.
     * @returns void
     */
    addProperty(): void {
        this.activeProperties.push(true);
    }

    /**
     * @ignore
     * Remove the last property from the search form.
     * @returns void
     */
    removeProperty(): void {
        this.activeProperties.splice(-1, 1);
    }

    /**
     * @ignore
     * Resets the form (selected resource class and specified properties) preserving the active ontology.
     */
    resetForm() {
        if (this.activeOntology !== undefined) {
            this.getResourceClassesAndPropertiesForOntology(this.activeOntology);
        }
    }

}
