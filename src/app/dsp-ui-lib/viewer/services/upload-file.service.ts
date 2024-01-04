import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppInitService } from '../../core/app-init.service';
import { SessionService } from '../../core/session.service';

interface UploadedFile {
    fileType: string;
    internalFilename: string;
    originalFilename: string;
    temporaryUrl: string;
}

export interface UploadedFileResponse {
    uploadedFiles: UploadedFile[];
}

@Injectable({
    providedIn: 'root'
})
export class UploadFileService {

    sipiHost: string = this._is.config[`sipiUrl`];

    constructor(
        private readonly _is: AppInitService,
        private readonly _http: HttpClient,
        private readonly _ss: SessionService
    ) { }

    /**
     * Uploads files to SIPI
     * @param (file)
     */
    upload(file: FormData): Observable<UploadedFileResponse> {
        const baseUrl = `${this.sipiHost}upload`;

        // checks if user is logged in
        const jwt = this._ss.getSession()?.user.jwt;
        const params = new HttpParams().set('token', jwt);

        // TODO in order to track the progress change below to true and 'events'
        const options = { params, reportProgress: false, observe: 'body' as 'body' };
        return this._http.post<UploadedFileResponse>(baseUrl, file, options);
    }
}
