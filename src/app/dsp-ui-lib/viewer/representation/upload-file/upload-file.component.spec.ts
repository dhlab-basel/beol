import { Component, OnInit, ViewChild } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormBuilder, UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Constants, CreateStillImageFileValue } from '@dasch-swiss/dsp-js';
import { of } from 'rxjs';
import { UploadFileService } from '../../services/upload-file.service';
import { UploadFileComponent } from './upload-file.component';

/**
 * Test host component to simulate parent component.
 */
@Component({
    template: `
    <dsp-upload-file #upload [representation]="representation" [parentForm]="form"></dsp-upload-file>`
})
class TestHostComponent implements OnInit {

    @ViewChild('upload') uploadFileComp: UploadFileComponent;

    representation = Constants.StillImageFileValue;

    form: UntypedFormGroup;

    constructor(private _fb: UntypedFormBuilder) {
    }

    ngOnInit() {
        this.form = this._fb.group({});
    }

}


describe('UploadFileComponent', () => {
    const mockFile = new File(['1'], 'testfile', { type: 'image/jpeg' });

    const fb = new UntypedFormBuilder();

    let testHostComponent: TestHostComponent;
    let testHostFixture: ComponentFixture<TestHostComponent>;

    beforeEach(waitForAsync(() => {

        const uploadServiceSpy = jasmine.createSpyObj('UploadFileService', ['upload']);

        TestBed.configureTestingModule({
            declarations: [UploadFileComponent, TestHostComponent],
            imports: [
                MatInputModule,
                MatSnackBarModule,
                ReactiveFormsModule,
                MatIconModule
            ],
            providers: [
                { provide: UploadFileService, useValue: uploadServiceSpy }
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        testHostFixture = TestBed.createComponent(TestHostComponent);
        testHostComponent = testHostFixture.componentInstance;
        testHostFixture.detectChanges();
    });

    it('should create', () => {
        expect(testHostComponent).toBeTruthy();
        expect(testHostComponent.uploadFileComp).toBeTruthy();
    });

    it('should display resource type', () => {
        expect(testHostComponent.uploadFileComp.representation).toBeDefined();
    });

    it('should be created without a file', () => {
        expect(testHostComponent.uploadFileComp.file).toBeFalsy();
    });

    it('should delete attachment', () => {
        testHostComponent.uploadFileComp.file = mockFile;
        testHostComponent.uploadFileComp.fileControl.setValue(mockFile);
        testHostComponent.uploadFileComp.thumbnailUrl = 'test';
        testHostComponent.uploadFileComp.deleteAttachment();
        expect(testHostComponent.uploadFileComp.file).toBeNull();
        expect(testHostComponent.uploadFileComp.fileControl.value).toBeNull();
        expect(testHostComponent.uploadFileComp.thumbnailUrl).toBeNull();
    });

    describe('form', () => {
        it('should create form group and file control and add it to the parent form', waitForAsync(() => {

            testHostFixture.whenStable().then(() => {

                expect(testHostComponent.uploadFileComp.form).toBeDefined();
                expect(testHostComponent.uploadFileComp.fileControl).toBeTruthy();

                // check that the form control has been added to the parent form
                expect(testHostComponent.form.contains('file')).toBe(true);

            });
        }));

        it('should reset the form', () => {
            testHostComponent.uploadFileComp.form = fb.group({ test: '' });
            testHostComponent.uploadFileComp.resetForm();
            expect(testHostComponent.uploadFileComp.form.get('test').value).toBeNull();
        });
    });

    describe('isFileTypeSupported', () => {
        it('should return true for the supported image files', () => {
            const fileTypes = ['image/jpeg', 'image/jp2', 'image/tiff', 'image/tiff-fx', 'image/png'];

            for (const type of fileTypes) {
                expect(testHostComponent.uploadFileComp['_isFileTypeSupported'](type)).toBeTruthy();
            }
        });

        it('should return false for unsupported image files', () => {
            // TODO: add real unsupported filetypes?
            const fileTypes = ['image/a', 'image/b', 'image/c', 'image/d', 'image/e'];
            for (const type of fileTypes) {
                expect(testHostComponent.uploadFileComp['_isFileTypeSupported'](type)).toBeFalsy();
            }
        });
    });

    describe('isMoreThanOneFile', () => {
        it('should return false for one file array', () => {
            const filesArray: File[] = [];
            filesArray.push(mockFile);
            expect(testHostComponent.uploadFileComp['_isMoreThanOneFile'](filesArray)).toBeFalsy();
        });

        it('should return false for more than one file', () => {
            const filesArray: File[] = [];
            filesArray.push(mockFile, mockFile, mockFile);
            expect(testHostComponent.uploadFileComp['_isMoreThanOneFile'](filesArray)).toBeTruthy();
        });
    });

    describe('addFile', () => {

        it('should make a request to Sipi when a file is added', () => {

            expect(testHostComponent.uploadFileComp.form.valid).toBe(false);

            const uploadService = TestBed.inject(UploadFileService) as jasmine.SpyObj<UploadFileService>;

            uploadService.upload.and.returnValue(of({
                uploadedFiles: [
                    {
                        fileType: 'image',
                        temporaryUrl: 'http://localhost:1024/tmp/8oDdefPSkaz-EG187srxBFZ.jp2',
                        originalFilename: 'beaver.jpg',
                        internalFilename: '8oDdefPSkaz-EG187srxBFZ.jp2'
                    }
                ]
            }));

            // https://stackoverflow.com/questions/57080760/fake-file-drop-event-for-unit-testing
            const drop = {
                preventDefault: () => {},
                stopPropagation: () => {},
                target: { files: [mockFile] }
            };

            testHostComponent.uploadFileComp.addFile(drop);

            expect(testHostComponent.uploadFileComp.form.valid).toBe(true);

            const createFileVal = testHostComponent.uploadFileComp.getNewValue();

            expect(createFileVal instanceof CreateStillImageFileValue).toBe(true);
            expect((createFileVal as CreateStillImageFileValue).filename).toEqual('8oDdefPSkaz-EG187srxBFZ.jp2');

            const expectedFormData = new FormData();
            expectedFormData.append(mockFile.name, mockFile);

            expect(uploadService.upload).toHaveBeenCalledTimes(1);
            expect(uploadService.upload).toHaveBeenCalledWith(expectedFormData);

        });

    });
});
