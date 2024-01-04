import { Component, Input, OnChanges } from '@angular/core';
import { ShortResInfo } from '../list-view/list-view.component';

@Component({
    selector: 'dsp-multiple-resources-view',
    templateUrl: './multiple-resources-view.component.html',
    styleUrls: ['./multiple-resources-view.component.scss']
})
export class MultipleResourcesViewComponent implements OnChanges {

    /**
     * number of resources
     */
    @Input() noOfResources?: number;

    /**
     * resource ids
     */
    @Input() resourceIds?: string[];

    /**
     * list of resources with id and label
     */
    @Input() resources?: ShortResInfo[];

    // if number of selected resources > 3, divide them into 2 rows
    topRow = [];
    bottomRow = [];

    constructor() { }

    ngOnChanges(): void {

        if (this.resources && this.resources.length) {
            this.resourceIds = [];
            this.resources.forEach(res => {
                this.resourceIds.push(res.id);
            });
        }

        if (!this.noOfResources) {
            this.noOfResources = ((this.resourceIds && this.resourceIds.length) ? this.resourceIds.length : this.resources.length);
        }

        // if number of resources are more than 3, divide it into 2 rows
        // otherwise display then in 1 row only
        if (this.noOfResources < 4) {
            this.topRow = this.resourceIds;
        }
        else {
            this.topRow = this.resourceIds.slice(0, this.noOfResources / 2);
            this.bottomRow = this.resourceIds.slice(this.noOfResources / 2);
        }
    }

}
