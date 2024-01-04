import { Directive, ElementRef, Input, OnChanges } from '@angular/core';
import { AppInitService } from '../dsp-ui-lib/core';
import * as BeolConstants from '../beol-constants';

@Directive({
    selector: '[appTeiLink]'
})
export class TeiLinkDirective implements OnChanges {

    private readonly textProperty = 'textProperty';

    private readonly mappingIri = 'mappingIri';

    private readonly gravsearchTemplateIri = 'gravsearchTemplateIri';

    private readonly teiHeaderXSLTIri = 'teiHeaderXSLTIri';

    private _resourceType: string; // the type of the resource to be converted to TEI

    @Input()
    set resourceType(value: string) {
        this._resourceType = value;
    }

    get resourceType(): string {
        return this._resourceType;
    }

    private _resourceIri: string; // the Iri of the resource to be converted to TEI

    @Input()
    set resourceIri(value: string) {
        this._resourceIri = value;
    }

    get resourceIri(): string {
        return this._resourceIri;
    }

    constructor (private el: ElementRef,
                 private _appInitService: AppInitService) {
    }

    private generateTeiLink() {

        const settings = this._appInitService.config;
        const teiInitConfig = BeolConstants.TEI_INIT_CONFIG;
        const teiConfig = teiInitConfig[this._resourceType];

        if (teiConfig !== undefined) {

            const teiLink = settings['ontologyIRI'] + '/v2/tei/' + encodeURIComponent(this._resourceIri)
                + `?${this.textProperty}=` + encodeURIComponent(teiConfig.textProperty)
                + `&${this.mappingIri}=` + encodeURIComponent(teiConfig.mappingIRI)
                + `&${this.gravsearchTemplateIri}=` + encodeURIComponent(teiConfig.gravsearchTemplateIri)
                + `&${this.teiHeaderXSLTIri}=` + encodeURIComponent(teiConfig.teiHeaderXSLTIri);

            return teiLink;
        } else {
            return false;
        }
    }

    ngOnChanges() {

        // create link to the TEI representation of the given resource
        const teiLink = this.generateTeiLink();

        if (teiLink !== false) {
            this.el.nativeElement.innerHTML = `<a href="${teiLink}" target="_blank">TEI/XML</a>`;
        } else {
            // no link could be generated
            this.el.nativeElement.innerHTML = '';
        }

    }
}
