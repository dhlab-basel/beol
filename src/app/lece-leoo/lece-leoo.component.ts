import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-lece-leoo',
    templateUrl: './lece-leoo.component.html',
    styleUrls: ['./lece-leoo.component.scss']
})
export class LeceLeooComponent implements OnInit {
    isLoading = true;
    url: UrlSegment;
    navigationSubscription: Subscription;

    constructor(public location: Location, private _route: ActivatedRoute) {
        this.isLoading = false;
    }

    ngOnInit() {
        this.navigationSubscription = this._route.url.subscribe((url: UrlSegment[]) => {
            this.url = url[0];
        })
    }

    ngOnDestroy() {
        if (this.navigationSubscription !== undefined) {
            this.navigationSubscription.unsubscribe();
        }
    }
}
