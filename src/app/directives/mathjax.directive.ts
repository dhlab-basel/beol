import { Directive, ElementRef, HostListener, Input, OnChanges } from '@angular/core';
import { Constants, ReadGeomValue, ReadLinkValue, ReadResource, ReadStillImageFileValue, ReadTextValueAsHtml } from '@dasch-swiss/dsp-js';
import { BeolService } from '../services/beol.service';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { ReadResourceSequence } from '@dasch-swiss/dsp-js';

declare var MathJax: {
    Hub: {
        Queue: (param: () => void) => void;
        Typeset: (param: object) => void;
    }
};

/**
 * Represents resources referred to by standoff links.
 */
export class ReferredResources {
    [index: string]: ReadResource;
}

/**
 * This directive makes MathJax render the mathematical notation contained in the inserted HTML.
 */
// eslint-disable-next-line @angular-eslint/directive-selector
@Directive({selector: '[mathJax]'})
export class MathJaxDirective implements OnChanges {

    private _renderMath = false; // indicates if mathematical notation should be rendered by MathJax

    @Input()
    set renderMath(value) {
        this._renderMath = value;
    }

    get renderMath() {
        return this._renderMath;
    }

    private _html: string; // the HTML to be inserted (received from Knora)

    @Input()
    set mathJax(value: string) {
        this._html = value;
    }

    get mathJax() {
        return this._html;
    }

    private _valueObject: ReadTextValueAsHtml; // the value object with standoff information (standoff links in HTML)

    @Input()
    set valueObject(value: ReadTextValueAsHtml) {
        this._valueObject = value;
    }

    get valueObject() {
        return this._valueObject;
    }

    @Input()
    set resource(value: ReadResource) {
        this._resource = value;

        this._resource.outgoingReferences.forEach(
            (ref: ReadResource) => {
                this._referredResources[ref.id] = ref;
            }
        );
    }

    get resource() {
        return this._resource;
    }

    private _resource: ReadResource;

    private _referredResources: ReferredResources = {};

    private _bindEvents: boolean; // indicates if click and mouseover events have to be bound (HostListener)

    @Input()
    set bindEvents(value) {
        this._bindEvents = value;
    }

    get bindEvents() {
        return this._bindEvents;
    }

    @Input() renderFigureRegions = false;

    constructor(private el: ElementRef,
                private _beol: BeolService,
                private _snackBar: MatSnackBar) {
    }

    /**
     * Given a region resources that links to the related file value, creates a IIIF URL for the image region.
     * @param regionRes the region resource.
     */
    private createIIIFURLFromRegion(regionRes: ReadResource) {

        const hasGeometryProp = 'http://api.knora.org/ontology/knora-api/v2#hasGeometry';

        const geomValue = regionRes.properties[hasGeometryProp][0] as ReadGeomValue;

        const hasRegionValue = 'http://api.knora.org/ontology/knora-api/v2#isRegionOfValue';

        const hasFileValue = 'http://api.knora.org/ontology/knora-api/v2#hasStillImageFileValue';

        const fileValue = (regionRes.properties[hasRegionValue][0] as ReadLinkValue).linkedResource.properties[hasFileValue][0] as ReadStillImageFileValue;

        // build Sipi URL
        const x1 = Math.min(geomValue.geometry.points[0].x, geomValue.geometry.points[1].x);
        const x2 = Math.max(geomValue.geometry.points[0].x, geomValue.geometry.points[1].x);

        const y1 = Math.min(geomValue.geometry.points[0].y, geomValue.geometry.points[1].y);
        const y2 = Math.max(geomValue.geometry.points[0].y, geomValue.geometry.points[1].y);

        const regionWidth = (x2 - x1) * 100;
        const regionHeight = (y2 - y1) * 100;

        const pct = x1 * 100 + ',' + y1 * 100 + ',' + regionWidth + ',' + regionHeight;

        const sipiURL = fileValue.iiifBaseUrl + '/' + fileValue.filename + '/pct:' + pct + '/pct:20/0/default.jpg';

        return sipiURL;
    }

    /**
     * Collects Iris of regions representing a figure from the given standoff links.
     *
     * @return array of Iris.
     */
    private collectReferredFigureRegionIris(): string[] {
        const figureRegionIris = [];

        if (this.valueObject instanceof ReadTextValueAsHtml) {

            // collect figure region IRIs
            for (const resIri in this._referredResources) {
                if (this._referredResources.hasOwnProperty(resIri)) {
                    const refRes = this._referredResources[resIri];
                    // Meditationes Figure regions contain "-F"
                    if (refRes.type === Constants.Region && refRes.label.trim().includes('-F')) {
                        figureRegionIris.push(refRes.id);
                    }
                }
            }

        }

        return figureRegionIris;
    }

    /**
     * Requests figure regions from Knora and renders them in the HTML.
     *
     * @param figureRegionIris Iris of figure regions.
     */
    private getAndRenderFigureRegions(figureRegionIris: string[]) {

        const observables = [];

        figureRegionIris.forEach((figRegIri: string) => {
            observables.push(this._beol.getRegionDimsAndFile(figRegIri));
        });

        forkJoin(observables).subscribe((result => {
            const parser = new DOMParser();
            const parsedHtml = parser.parseFromString(this._html, 'text/html');

            const html: HTMLCollection = parsedHtml.getElementsByTagName('a');

            result.forEach(
                (figReg: ReadResourceSequence) => {

                    // check that figReg contains one resource
                    if (figReg.resources.length === 1) {
                        for (let i = 0; i < html.length; i++) {
                            if (html[i].getAttribute('href') === figReg.resources[0].id) {
                                const iiifUrl = this.createIIIFURLFromRegion(figReg.resources[0]);

                                const img = document.createElement('img');
                                img.src = iiifUrl;

                                html[i].appendChild(img);

                                // clix tags have two elements, only process first
                                break;
                            }
                        }
                    }
                }
            );

            const body = parsedHtml.getElementsByTagName('body');

            this.injectAndRenderHTML(body.item(0).innerHTML, this._renderMath);

        }));
    }

    /**
     * Gets information about a resource pointed to by a standoff link.
     *
     * @param referredResIri Iri of the referred resource.
     * @private
     */
    private getReferredResourceInfo(referredResIri: string) {

        // check if information is available
        if (this._referredResources[referredResIri] !== undefined) {
            return this._referredResources[referredResIri].label + ` (${this._referredResources[referredResIri].resourceClassLabel})`;
        } else {
            return referredResIri;
        }

    }

    /**
     * Injects HTML into the DOM and renders math, if necessary.
     *
     * @param html HTML to be injected into the DOM.
     * @param renderMath if true, math is rendered.
     */
    private injectAndRenderHTML(html: string, renderMath: boolean): void {
        this.el.nativeElement.innerHTML = html;

        // only render the math if the flag is set to true (onChanges is triggered when status of _renderMath changes)
        if (renderMath) {

            // http://docs.mathjax.org/en/latest/advanced/typeset.html#typeset-math
            MathJax.Hub.Queue(() => {
                MathJax.Hub.Typeset(this.el.nativeElement);
            });
        }
    }

    /**
     * Binds a click event to standoff links that showing the referred resource using the apt template (route).
     *
     * Events only fire if bindEvents is set to true.
     *
     * @param targetElement the element that received the event.
     * @returns a Boolean indicating if event propagation should be stopped.
     */
    @HostListener('click', ['$event.target'])
    onClick(targetElement) {

        if (this._bindEvents && targetElement.nodeName.toLowerCase() === 'a'
            && targetElement.className.toLowerCase().indexOf(Constants.SalsahLink) >= 0) {

            // salsah-link to a Knora resource

            const referredResourceIri = targetElement.href;

            // TODO: the value object should handle this and check for the existence of the given referred resource
            const referredRes = this._referredResources[referredResourceIri];

            this._beol.routeByResourceType(referredRes.type, referredResourceIri, referredRes);

            // preventDefault (propagation)
            return false;

        } else if (this._bindEvents && targetElement.parentElement.nodeName.toLowerCase() === 'a'
            && targetElement.parentElement.className.toLowerCase().indexOf(Constants.SalsahLink) >= 0) {

            // salsah-link to a BEOL resource, activated from a parent element, e.g., a footnote (salsah-link containing a <sup>)

            const referredResourceIri = targetElement.parentElement.href;

            // TODO: the value object should handle this and check for the existence of the given referred resource
            const referredResourceType = this._referredResources[referredResourceIri].type;

            this._beol.routeByResourceType(referredResourceType, referredResourceIri, this._referredResources[referredResourceIri]);

            // preventDefault (propagation)
            return false;

        } else if (this._bindEvents && targetElement.parentElement.nodeName.toLowerCase() === 'a'
            && targetElement.parentElement.className.toLowerCase().indexOf(Constants.RefMarker) >= 0) {

            // internal reference in a BEBB letter: scroll to footnote on page

            const indexOfHashtag = targetElement.parentElement.href.indexOf('#', '');

            if (indexOfHashtag !== -1) {

                const targetId = targetElement.parentElement.href.substr(indexOfHashtag + 1);

                const targetEle = document.getElementById(targetId);

                if (targetEle) {
                    targetEle.scrollIntoView();
                }

            }

            // preventDefault (propagation)
            return false;

        } else if (this._bindEvents && targetElement.nodeName.toLowerCase() === 'a') {
            // external link

            // open link in a new window
            window.open(targetElement.href, '_blank');

            // preventDefault (propagation)
            return false;
        } else if (this._bindEvents && targetElement.parentElement.nodeName.toLowerCase() === 'a') {
            // external link in parent element

            // open link in a new window
            window.open(targetElement.parentElement.href, '_blank');

            // preventDefault (propagation)
            return false;
        } else {
            // preventDefault (propagation)
            return false;
        }

    }

    /**
     * Binds a mouseover event to standoff links showing information about the referred resource.
     *
     * Events only fire if bindEvents is set to true.
     *
     * @param targetElement the element that received the event.
     * @returns a Boolean indicating if event propagation should be stopped.
     */
    @HostListener('mouseover', ['$event.target'])
    onMouseEnter(targetElement) {

        if (this._bindEvents && targetElement.nodeName.toLowerCase() === 'a'
            && targetElement.className.toLowerCase().indexOf(Constants.SalsahLink) >= 0) {

            // salsah-link to a Knora resource

            const referredResourceIri = targetElement.href;

            // TODO: the value object should handle this and check for the existence of the given referred resource
            // const referred_res = this._valueObject.referredResources[referredResourceIri];

            const config = new MatSnackBarConfig();
            config.duration = 2500;

            this._snackBar.open(this.getReferredResourceInfo(referredResourceIri), undefined, config);

            // preventDefault (propagation)
            return false;
        } else if (this._bindEvents && targetElement.parentElement.nodeName.toLowerCase() === 'a'
            && targetElement.parentElement.className.toLowerCase().indexOf(Constants.SalsahLink) >= 0) {

            // salsah-link to a BEOL resource, activated from a parent element, e.g., a footnote (<sup> containing a salsah-link)

            const referredResourceIri = targetElement.parentElement.href;

            const config = new MatSnackBarConfig();
            config.duration = 2500;

            this._snackBar.open(this.getReferredResourceInfo(referredResourceIri), undefined, config);

            // preventDefault (propagation)
            return false;
        } else {
            // prevent propagation
            return false;
        }

    }

    ngOnChanges() {
        // is triggered when input setter methods are called

        if (this.renderFigureRegions) {

            const figRegIris = this.collectReferredFigureRegionIris();

            if (figRegIris.length > 0) {

                this.getAndRenderFigureRegions(figRegIris);

            } else {
                this.injectAndRenderHTML(this._html, this._renderMath);
            }

        } else {
            this.injectAndRenderHTML(this._html, this._renderMath);
        }

    }

}
