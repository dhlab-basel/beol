import { Component, OnInit } from '@angular/core';
import { BeolService } from '../services/beol.service';
import { ActivatedRoute, Router } from '@angular/router';

class ThirdPartyProject {
    constructor(
        readonly description: string = '',
    ) { }
}

@Component({
    selector: 'app-landing-page',
    templateUrl: './landing-page.component.html',
    styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
    newton: ThirdPartyProject;
    leibniz: ThirdPartyProject;

    constructor(
        private _router: Router,
        private _route: ActivatedRoute,
        private _beol: BeolService
    ) {
    }

    ngOnInit() {
        this.newton = new ThirdPartyProject('The Newton Project');
        this.leibniz = new ThirdPartyProject('Briefportal Leibniz');
    }

    openBiography(name: string) {
        this._router.navigate(['/biography/', name], { relativeTo: this._route })
    }

    /**
     * Generate Gravsearch query to search for The Newton project Correspondence.
     */
    searchForNewtonCorrespondence() {
        const gravsearch: string = this._beol.searchForNewtonCorrespondence(0);
        this.submitQuery(gravsearch);
    }

    /**
     * * Generate Gravsearch query to search for Leibniz Correspondence.
     */
    searchForLeibnizCorrespondence() {
        const gravsearch: string = this._beol.searchForLeibnizCorrespondence(0);
        this.submitQuery(gravsearch);
    }

    /**
     * Show a correspondence between two persons.
     *
     * @param gravsearch the Gravsearch query to be executed.
     */
    private submitQuery(gravsearch: string) {
        this._router.navigate(['/search/gravsearch/', gravsearch], { relativeTo: this._route });
    }
}
