import {
    Component, EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import {
    CardinalityUtil,
    PermissionUtil,
    ReadLinkValue,
    ReadResource,
    ResourcePropertyDefinition,
    SystemPropertyDefinition
} from '@dasch-swiss/dsp-js';
import { Subscription } from 'rxjs';
import { AddValueComponent } from '../../operations/add-value/add-value.component';
import { DisplayEditComponent } from '../../operations/display-edit/display-edit.component';
import { Events, ValueOperationEventService } from '../../services/value-operation-event.service';
import { PropertyInfoValues } from '../resource-view/resource-view.component';

@Component({
  selector: 'dsp-property-view',
  templateUrl: './property-view.component.html',
  styleUrls: ['./property-view.component.scss']
})
export class PropertyViewComponent implements OnInit, OnDestroy {

    @ViewChild('displayEdit') displayEditComponent: DisplayEditComponent;
    @ViewChild('addValue') addValueComponent: AddValueComponent;
    /**
     * Parent resource
     *
     * @param (parentResource)
     */
    @Input() parentResource: ReadResource;

    /**
     * Array of property object with ontology class prop def, list of properties and corresponding values
     *
     * @param (propArray)
     */
    @Input() propArray: PropertyInfoValues[];

    /**
     * Array of system property object with list of system properties
     *
     * @param (systemPropArray)
     */
    @Input() systemPropArray: SystemPropertyDefinition[];

    /**
     * Show all properties, even if they don't have a value.
     *
     * @param  (showAllProps)
     */
    @Input() showAllProps = false;

    @Output() referredResourceClicked: EventEmitter<ReadLinkValue> = new EventEmitter<ReadLinkValue>();

    @Output() referredResourceHovered: EventEmitter<ReadLinkValue> = new EventEmitter<ReadLinkValue>();

    addButtonIsVisible: boolean; // used to toggle add value button
    addValueFormIsVisible: boolean; // used to toggle add value form field
    propID: string; // used in template to show only the add value form of the corresponding value

    valueOperationEventSubscription: Subscription;

    constructor(private _valueOperationEventService: ValueOperationEventService) { }

    ngOnInit() {
        if (this.parentResource) {
            // get user permissions
            const allPermissions = PermissionUtil.allUserPermissions(
                this.parentResource.userHasPermission as 'RV' | 'V' | 'M' | 'D' | 'CR'
            );

            // if user has modify permissions, set addButtonIsVisible to true so the user see's the add button
            this.addButtonIsVisible = allPermissions.indexOf(PermissionUtil.Permissions.M) !== -1;
        }

        // listen for the AddValue event to be emitted and call hideAddValueForm()
        this.valueOperationEventSubscription = this._valueOperationEventService.on(Events.ValueAdded, () => this.hideAddValueForm());

    }

    ngOnDestroy() {
        // unsubscribe from the event bus when component is destroyed
        if (this.valueOperationEventSubscription !== undefined) {
            this.valueOperationEventSubscription.unsubscribe();
        }
    }

    /**
     * Called from the template when the user clicks on the add button
     */
    showAddValueForm(prop: PropertyInfoValues) {
        this.propID = prop.propDef.id;
        this.addValueFormIsVisible = true;
    }

    /**
     * Called from the template when the user clicks on the cancel button
     */
    hideAddValueForm() {
        this.addValueFormIsVisible = false;
        this.addButtonIsVisible = true;
        this.propID = undefined;
    }

    /**
     * Given a resource property, check if an add button should be displayed under the property values
     *
     * @param prop the resource property
     */
    addValueIsAllowed(prop: PropertyInfoValues): boolean {

        // if the ontology flags this as a read-only property,
        // don't ever allow to add a value
        if (prop.propDef instanceof ResourcePropertyDefinition && !prop.propDef.isEditable) {
           return false;
        }

        const isAllowed = CardinalityUtil.createValueForPropertyAllowed(
            prop.propDef.id, prop.values.length, this.parentResource.entityInfo.classes[this.parentResource.type]);

        // check if:
        // cardinality allows for a value to be added
        // value component does not already have an add value form open
        // user has write permissions
        return isAllowed && this.propID !== prop.propDef.id && this.addButtonIsVisible;
    }

    /**
     * Given a resource property, check if its cardinality allows a value to be deleted
     *
     * @param prop the resource property
     */
    deleteValueIsAllowed(prop: PropertyInfoValues): boolean {
        const isAllowed = CardinalityUtil.deleteValueForPropertyAllowed(
            prop.propDef.id, prop.values.length, this.parentResource.entityInfo.classes[this.parentResource.type]);

        return isAllowed;
    }
}
