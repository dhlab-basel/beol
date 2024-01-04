import { Pipe, PipeTransform } from '@angular/core';
import { SortingService } from '../../services/sorting.service';

/**
 * @deprecated
 * Please make use of the sorting service and sort arrays in the class instead of in the template.
 */

@Pipe({
    name: 'dspSortBy'
})
export class SortByPipe implements PipeTransform {

    constructor(private _sortingService: SortingService) { }
    /**
     * uses sorting service to sort by key
     */
    transform(array: Array<any>, args: string): Array<any> {
        return this._sortingService.keySortByAlphabetical(array, args);
    }
}
