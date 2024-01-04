import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
    selector: 'ark-url-dialog',
    templateUrl: 'ark-url-dialog.component.html',
    styleUrls: ['ark-url-dialog.component.scss']
})
export class ArkUrlDialogComponent implements OnInit {
    arkURL: string;
    constructor(
        @Inject(MAT_DIALOG_DATA) public data,
        private _snackBar: MatSnackBar,
        private _clipboard: Clipboard,
        private _dialogRef: MatDialogRef<ArkUrlDialogComponent>
        ) {
    }

    ngOnInit() {
        this.arkURL = this.data.arkURL;
    }

    copyToClipBoard() {
        this._clipboard.copy(this.arkURL);
        this.openSnackBar();
        this._dialogRef.close();
    }

    /**
     * Display message to confirm the copy of the citation link (ARK URL)
     */
    openSnackBar() {
        this._snackBar.open(
            'Copied to clipboard!',
            'Citation Link',
            {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top'
            });
    }
}
