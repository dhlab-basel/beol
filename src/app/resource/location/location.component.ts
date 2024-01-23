import {Component, Inject} from '@angular/core';
import {BeolCompoundResource, BeolResource} from '../beol-resource';
import {Constants, KnoraApiConnection, ResourceClassAndPropertyDefinitions} from '@dasch-swiss/dsp-js';
import {Subscription} from 'rxjs';
import {AppInitService, DspApiConnectionToken} from '../../dsp-ui-lib/core';
import {ActivatedRoute} from '@angular/router';
import {IncomingService} from '../../services/incoming.service';
import {BeolService} from '../../services/beol.service';
import {Location} from '@angular/common';
import {MatDialog} from '@angular/material/dialog';
import {ArkUrlDialogComponent} from '../../dialog/ark-url-dialog.component';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss']
})
export class LocationComponent extends BeolResource {

    iri: string;
    resource: BeolCompoundResource;
    ontologyInfo: ResourceClassAndPropertyDefinitions;
    incomingStillImageRepresentationCurrentOffset: number; // last offset requested for `this.resource.incomingStillImageRepresentations`
    isLoading = true;
    errorMessage: any;
    dspConstants = Constants;
    navigationSubscription: Subscription;

    propIris;

    constructor(
        @Inject(DspApiConnectionToken) protected _dspApiConnection: KnoraApiConnection,
        private _appInitService: AppInitService,
        protected _route: ActivatedRoute,
        protected _incomingService: IncomingService,
        protected _beolService: BeolService,
        public location: Location,
        public dialog: MatDialog
    ) {
        super(_dspApiConnection, _route, _incomingService, _beolService);
    }

    initProps() {
    }

    /**
     * Display incoming links as clickable links
     *
     * @param resIri
     * @param resType
     * @param res
     */
    showIncomingRes(resIri, resType, res) {
        this._beolService.routeByResourceType(resType, resIri, res);
    }

    openDialog(arkURL: string) {
        this.dialog.open(ArkUrlDialogComponent, {
            hasBackdrop: true,
            width: '600px',
            data: {
                arkURL: arkURL
            }
        });
    }
}
