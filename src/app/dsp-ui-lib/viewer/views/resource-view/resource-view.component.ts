import {
    Component,
    EventEmitter, Inject,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output
} from '@angular/core';
import {
    ApiResponseError,
    Constants,
    DeleteValue,
    IHasPropertyWithPropertyDefinition,
    KnoraApiConnection,
    PropertyDefinition,
    ReadLinkValue,
    ReadProject,
    ReadResource,
    ReadResourceSequence,
    ReadStillImageFileValue,
    ReadTextValueAsXml,
    ReadValue,
    SystemPropertyDefinition
} from '@dasch-swiss/dsp-js';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../../action/services/notification.service';
import { DspApiConnectionToken } from '../../../core/core.module';
import { StillImageRepresentation } from '../../representation/still-image/still-image.component';
import {
    AddedEventValue,
    DeletedEventValue,
    Events,
    UpdatedEventValues,
    ValueOperationEventService
} from '../../services/value-operation-event.service';
import { ValueService } from '../../services/value.service';

// object of property information from ontology class, properties and property values
export interface PropertyInfoValues {
    guiDef: IHasPropertyWithPropertyDefinition;
    propDef: PropertyDefinition;
    values: ReadValue[];
}

@Component({
    selector: 'dsp-resource-view',
    templateUrl: './resource-view.component.html',
    styleUrls: ['./resource-view.component.scss'],
    providers: [ValueOperationEventService] // provide service on the component level so that each implementation of this component has its own instance.
})
export class ResourceViewComponent implements OnInit, OnChanges, OnDestroy {

    /**
     * Resource iri
     *
     * @param [iri] Resource iri
     */
    @Input() iri: string;

    /**
     * Show all properties, even they don't have a value.
     *
     * @param  (showAllProps)
     */
    @Input() showAllProps = false;

    /**
     * Show toolbar with project info and some action tools on top of properties if true.
     *
     * @param  (showToolbar)
     */
    @Input() showToolbar = true;

    /**
     * @deprecated Use `referredProjectClicked` instead
     * @param  openProject EventEmitter which sends project information to parent component
     */
    @Output() openProject: EventEmitter<ReadProject> = new EventEmitter<ReadProject>();

    /**
     * Output `referredProjectClicked` of resource view component:
     * Can be used to go to project page
     */
    @Output() referredProjectClicked: EventEmitter<ReadProject> = new EventEmitter<ReadProject>();

    /**
     * Output `referredProjectHovered` of resource view component:
     * Can be used for preview when hovering on project
     */
    @Output() referredProjectHovered: EventEmitter<ReadProject> = new EventEmitter<ReadProject>();

    /**
     * Output `referredResourceClicked` of resource view component:
     * Can be used to open resource
     */
    @Output() referredResourceClicked: EventEmitter<ReadLinkValue> = new EventEmitter<ReadLinkValue>();

    /**
     * Output `referredResourceHovered` of resource view component:
     * Can be used for preview of resource on hover
     */
    @Output() referredResourceHovered: EventEmitter<ReadLinkValue> = new EventEmitter<ReadLinkValue>();

    resource: ReadResource;

    resPropInfoVals: PropertyInfoValues[] = []; // array of resource properties

    systemPropDefs: SystemPropertyDefinition[] = []; // array of system properties

    valueOperationEventSubscriptions: Subscription[] = []; // array of ValueOperationEvent subscriptions

    stillImageRepresentations: StillImageRepresentation[];

    constructor(
        @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection,
        private _notification: NotificationService,
        private _valueOperationEventService: ValueOperationEventService,
        private _valueService: ValueService) { }

    ngOnInit() {
        // subscribe to the ValueOperationEventService and listen for an event to be emitted
        this.valueOperationEventSubscriptions.push(this._valueOperationEventService.on(
            Events.ValueAdded, (newValue: AddedEventValue) =>
                this.addValueToResource(newValue.addedValue)));

        this.valueOperationEventSubscriptions.push(this._valueOperationEventService.on(
            Events.ValueUpdated, (updatedValue: UpdatedEventValues) =>
                this.updateValueInResource(updatedValue.currentValue, updatedValue.updatedValue)));

        this.valueOperationEventSubscriptions.push(this._valueOperationEventService.on(
            Events.ValueDeleted, (deletedValue: DeletedEventValue) =>
                this.deleteValueFromResource(deletedValue.deletedValue)));

    }

    ngOnChanges() {
        if (this.iri) {
            this.getResource(this.iri);
        }
    }

    ngOnDestroy() {
        // unsubscribe from the ValueOperationEventService when component is destroyed
        if (this.valueOperationEventSubscriptions !== undefined) {
            this.valueOperationEventSubscriptions.forEach(sub => sub.unsubscribe());
        }
    }

    /**
     * Get a read resource sequence with ontology information and incoming resources.
     *
     * @param iri resourceIri
     */
    getResource(iri: string): void {

        // reset still image representations
        this.stillImageRepresentations = [];

        this._dspApiConnection.v2.res.getResource(iri).subscribe(
            (response: ReadResource) => {
                this.resource = response;

                // gather resource property information
                this.resPropInfoVals = this.resource.entityInfo.classes[this.resource.type].getResourcePropertiesList().map(
                    (prop: IHasPropertyWithPropertyDefinition) => {
                        let propInfoAndValues: PropertyInfoValues;

                        switch (prop.propertyDefinition.objectType) {
                            case Constants.StillImageFileValue:
                                propInfoAndValues = {
                                    propDef: prop.propertyDefinition,
                                    guiDef: prop,
                                    values: this.resource.getValuesAs(prop.propertyIndex, ReadStillImageFileValue)
                                };
                                this.stillImageRepresentations = [new StillImageRepresentation(
                                    this.resource.getValuesAs(Constants.HasStillImageFileValue, ReadStillImageFileValue)[0], [])
                                ];

                                break;

                            default:
                                propInfoAndValues = {
                                    propDef: prop.propertyDefinition,
                                    guiDef: prop,
                                    values: this.resource.getValues(prop.propertyIndex)
                                };
                        }

                        return propInfoAndValues;
                    }
                );

                // sort properties by guiOrder
                this.resPropInfoVals =
                    this.resPropInfoVals
                        .filter(prop => prop.propDef.objectType !== Constants.GeomValue)
                        .sort((a, b) => (a.guiDef.guiOrder > b.guiDef.guiOrder) ? 1 : -1);

                // get system property information
                this.systemPropDefs = this.resource.entityInfo.getPropertyDefinitionsByType(SystemPropertyDefinition);

            },
            (error: ApiResponseError) => {
                this._notification.openSnackBar(error);
            });
    }

    /**
     * Updates the UI in the event of a new value being added to show the new value
     *
     * @param valueToAdd the value to add to the end of the values array of the filtered property
     */
    addValueToResource(valueToAdd: ReadValue): void {
        if (this.resPropInfoVals) {
            this.resPropInfoVals
                .filter(propInfoValueArray =>
                    propInfoValueArray.propDef.id === valueToAdd.property) // filter to the correct property
                .forEach(propInfoValue =>
                    propInfoValue.values.push(valueToAdd)); // push new value to array
            if (valueToAdd instanceof ReadTextValueAsXml) {
                this._updateStandoffLinkValue();
            }
        } else {
            console.error('No properties exist for this resource');
        }
    }

    /**
     * Updates the UI in the event of an existing value being updated to show the updated value
     *
     * @param valueToReplace the value to be replaced within the values array of the filtered property
     * @param updatedValue the value to replace valueToReplace with
     */
    updateValueInResource(valueToReplace: ReadValue, updatedValue: ReadValue): void {
        if (this.resPropInfoVals && updatedValue !== null) {
            this.resPropInfoVals
                .filter(propInfoValueArray =>
                    propInfoValueArray.propDef.id === valueToReplace.property) // filter to the correct property
                .forEach(filteredpropInfoValueArray => {
                    filteredpropInfoValueArray.values.forEach((val, index) => { // loop through each value of the current property
                        if (val.id === valueToReplace.id) { // find the value that should be updated using the id of valueToReplace
                            filteredpropInfoValueArray.values[index] = updatedValue; // replace value with the updated value
                        }
                    });
                });
            if (updatedValue instanceof ReadTextValueAsXml) {
                this._updateStandoffLinkValue();
            }
        } else {
            console.error('No properties exist for this resource');
        }
    }

    /**
     * Updates the UI in the event of an existing value being deleted
     *
     * @param valueToDelete the value to remove from the values array of the filtered property
     */
    deleteValueFromResource(valueToDelete: DeleteValue): void {
        if (this.resPropInfoVals) {
            this.resPropInfoVals
                .filter(propInfoValueArray =>  // filter to the correct type
                    this._valueService.compareObjectTypeWithValueType(propInfoValueArray.propDef.objectType, valueToDelete.type))
                .forEach(filteredpropInfoValueArray => {
                    filteredpropInfoValueArray.values.forEach((val, index) => { // loop through each value of the current property
                        if (val.id === valueToDelete.id) { // find the value that was deleted using the id
                            filteredpropInfoValueArray.values.splice(index, 1); // remove the value from the values array
                            if (val instanceof ReadTextValueAsXml) {
                                this._updateStandoffLinkValue();
                            }
                        }
                    });
                }
            );
        } else {
            console.error('No properties exist for this resource');
        }
    }

    /**
     * Updates the standoff link value for the resource being displayed.
     *
     */
    private _updateStandoffLinkValue(): void {

        if (this.resource === undefined) {
            // this should never happen:
            // if the user was able to click on a standoff link,
            // then the resource must have been initialised before.
            return;
        }

        const gravsearchQuery = `
 PREFIX knora-api: <http://api.knora.org/ontology/knora-api/simple/v2#>
 CONSTRUCT {
     ?res knora-api:isMainResource true .
     ?res knora-api:hasStandoffLinkTo ?target .
 } WHERE {
     BIND(<${this.resource.id}> as ?res) .
     OPTIONAL {
         ?res knora-api:hasStandoffLinkTo ?target .
     }
 }
 OFFSET 0
 `;

        this._dspApiConnection.v2.search.doExtendedSearch(gravsearchQuery).subscribe(
            (res: ReadResourceSequence) => {

                // one resource is expected
                if (res.resources.length !== 1) {
                    return;
                }

                const newStandoffLinkVals = res.resources[0].getValuesAs(Constants.HasStandoffLinkToValue, ReadLinkValue);

                this.resPropInfoVals.filter(
                    resPropInfoVal => {
                        return resPropInfoVal.propDef.id === Constants.HasStandoffLinkToValue;
                    }
                ).forEach(
                    standoffLinkResPropInfoVal => {
                        // delete all the existing standoff link values
                        standoffLinkResPropInfoVal.values = [];
                        // push standoff link values retrieved for the resource
                        newStandoffLinkVals.forEach(
                            standoffLinkVal => {
                                standoffLinkResPropInfoVal.values.push(standoffLinkVal);
                            }
                        );
                    });

            },
            err => {
                console.error(err);
            }
        );

    }

    /**
     * Event receiver: Show all props or not
     *
     * @param  show
     */
    toggleProps(show: boolean) {
        this.showAllProps = show;
    }

}
