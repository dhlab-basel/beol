import { Location } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import {
    ApiResponseError,
    Constants,
    KnoraApiConnection,
    ReadResource,
    ReadResourceSequence, ReadTextValue
} from '@dasch-swiss/dsp-js';
import { AppInitService, DspApiConnectionToken } from '../dsp-ui-lib/core';
import { Subscription } from 'rxjs';
import { BeolService } from '../services/beol.service';
import {MatSnackBar} from '@angular/material/snack-bar';

declare let require: any;

export interface IntroProps {
    'title': ReadTextValue[];
    'text': ReadTextValue[];
}

export interface Introduction {

    name: string;

    label: string;

    children?: Introduction[];
}

@Component({
    selector: 'app-introduction',
    templateUrl: './introduction.component.html',
    styleUrls: ['./introduction.component.scss']
})
export class IntroductionComponent implements OnInit, OnDestroy {

    id: string;
    iri: string;
    project: string;
    resource: ReadResource;
    errorMessage;

    KnoraConstants = Constants;

    listLeoo: Introduction[];
    listLece: Introduction[];
    props: IntroProps;

    // current index of introduction
    curIndex: number;
    curChildIndex: number;

    isLoading = true;

    paramsSubscription: Subscription;

    propIris: any = {
        'title': this._appInitService.config['ontologyIRI'] + '/ontology/0801/beol/v2#sectionHasTitle',
        'text': this._appInitService.config['ontologyIRI'] + '/ontology/0801/beol/v2#hasText',
    };

    message: string; // message to show in the snackbar to confirm the copy of the ARK URL
    action: string; // label for the snackbar action

    constructor(
        @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection,
        private _route: ActivatedRoute,
        private _beol: BeolService,
        private _appInitService: AppInitService,
        public location: Location,
        protected _snackBar: MatSnackBar
    ) {
    }

    ngOnInit() {

        const introleoo = require('../../assets/data/introductionLeoo.json');
        const introLece = require('../../assets/data/introductionLece.json');
        this.listLeoo = <Introduction[]>introleoo.Introductions;
        this.listLece = <Introduction[]>introLece.Introductions;

        this.paramsSubscription = this._route.paramMap.subscribe((params: ParamMap) => {
            this.project = params.get('project');
            this.id = params.get('id');
            this.searchForIntro(this.id);
        });

    }

    ngOnDestroy() {
        if (this.paramsSubscription !== undefined) {
            this.paramsSubscription.unsubscribe();
        }
    }

    searchForIntro(id: string): void {
        const gravsearch: string = this._beol.searchForIntroductionById(id);

        this._dspApiConnection.v2.search.doExtendedSearch(gravsearch).subscribe(
            (result: ReadResourceSequence) => {

                if (result.resources.length === 1) {
                    // console.log('we got a resource sequence ', resourceSeq.resources);
                    this.requestResource(result.resources[0].id);
                }

            }, (error) => {
                this.errorMessage = <any>error;
                this.isLoading = false;
            });
    }

    /**
     * Requests a resource from Knora.
     *
     * @param iri the Iri of the resource to be requested.
     */
    private requestResource(iri: string): void {

        this._dspApiConnection.v2.res.getResource(iri)
            .subscribe(
                (result: ReadResource) => {

                    this.resource = result;

                    this.props = {
                        title: [],
                        text: []
                    };

                    for (const key in this.resource.properties) {
                        if (this.resource.properties.hasOwnProperty(key)) {
                            for (const val of this.resource.properties[key]) {
                                switch (val.property) {
                                    case this.propIris.title:
                                        this.props.title.push(val);
                                        break;

                                    case this.propIris.text:
                                        this.props.text.push(val);
                                        break;

                                    default:
                                    // do nothing
                                }
                            }
                        }
                    }
                    this.isLoading = false;
                },
                (error: ApiResponseError) => {
                    this.errorMessage = <any>error;
                    this.isLoading = false;
                }
            );
    }

    toggleChildren(index: number) {
        this.curIndex = (index === this.curIndex ? undefined : index);
        // reset grand children
        this.curChildIndex = undefined;
    }

    toggleGrandChildren(index: number) {
        this.curChildIndex = (index === this.curChildIndex ? undefined : index);
    }
    /**
     * Display message to confirm the copy of the citation link (ARK URL)
     * @param message
     * @param action
     */
    openARKURLSnackBar() {
        this.message = 'Copied to clipboard!';
        this.action = 'Citation Link';
        this._snackBar.open(this.message, this.action, {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
        });
    }
}
