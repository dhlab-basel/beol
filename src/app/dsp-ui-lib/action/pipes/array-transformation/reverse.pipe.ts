import { Pipe, PipeTransform } from '@angular/core';
import { SortingService } from '../../services/sorting.service';

/**
 * @deprecated
 * Please make use of the sorting service and sort arrays in the class instead of in the template.
 */

@Pipe({
    name: 'dspReverse'
})
export class ReversePipe implements PipeTransform {

    constructor(private _sortingService: SortingService) { }

    /**
     * uses sorting service to reverse the array
     */

    transform(value: any): any {
        return this._sortingService.reverseArray(value);
    }

}
