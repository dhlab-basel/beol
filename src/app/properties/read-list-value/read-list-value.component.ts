import { Component, Inject, Input, OnChanges } from '@angular/core';
import { ApiResponseError, KnoraApiConnection, ListNodeV2, ReadListValue } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '../../dsp-ui-lib/core';
import { Observable } from 'rxjs';

@Component({
    selector: 'read-list-value',
    templateUrl: './read-list-value.component.html',
    styleUrls: ['./read-list-value.component.scss']
})
export class ReadListValueComponent implements OnChanges {

    @Input() valueObject: ReadListValue;

    private _renderMath = true;

    @Input()
    set renderMath(value: boolean) {
        this._renderMath = value;
    }

    get renderMath() {
        return this._renderMath;
    }

    node: Observable<ListNodeV2>;

    constructor(
        @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection
    ) { }

    ngOnChanges() {
        // given the node's Iri, ask the list cache service
        // TODO: handle error case
        this.node = this._dspApiConnection.v2.listNodeCache.getNode(this.valueObject.listNode) as Observable<ListNodeV2>;
    }

}
