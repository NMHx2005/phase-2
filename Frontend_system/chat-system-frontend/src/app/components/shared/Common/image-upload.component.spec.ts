import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ImageUploadComponent } from './image-upload.component';

describe('ImageUploadComponent', () => {
    let component: ImageUploadComponent;
    let fixture: ComponentFixture<ImageUploadComponent>;
    let mockSnackBar: jasmine.SpyObj<MatSnackBar>;

    beforeEach(async () => {
        const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

        await TestBed.configureTestingModule({
            imports: [ImageUploadComponent],
            providers: [
                { provide: MatSnackBar, useValue: snackBarSpy }
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ImageUploadComponent);
        component = fixture.componentInstance;
        mockSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have default values', () => {
        expect(component.multiple).toBeFalse();
        expect(component.tooltip).toBe('');
        expect(component.icon).toBe('');
        expect(component.maxSize).toBe(5 * 1024 * 1024);
        expect(component.allowedTypes).toEqual(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
        expect(component.uploading).toBeFalse();
        expect(component.previewUrl).toBeNull();
    });

    it('should handle single file selection', () => {
        const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
        const event = {
            target: {
                files: [file]
            }
        } as any;

        spyOn(component.imageSelected, 'emit');

        component.onFileSelected(event);

        expect(component.imageSelected.emit).toHaveBeenCalledWith(file);
    });

    it('should handle multiple file selection', () => {
        component.multiple = true;
        const files = [
            new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
            new File(['test2'], 'test2.jpg', { type: 'image/jpeg' })
        ];
        const event = {
            target: {
                files: files
            }
        } as any;

        spyOn(component.imagesSelected, 'emit');

        component.onFileSelected(event);

        expect(component.imagesSelected.emit).toHaveBeenCalledWith(files);
    });

    it('should handle upload progress', () => {
        component.setUploading(true);
        expect(component.uploading).toBeTrue();

        component.setUploading(false);
        expect(component.uploading).toBeFalse();
    });

    it('should set preview URL', () => {
        const url = 'test-url';
        component.setPreviewUrl(url);
        expect(component.previewUrl).toBe(url);
    });

    it('should remove image', () => {
        component.previewUrl = 'test-url';
        spyOn(URL, 'revokeObjectURL');

        component.removeImage();

        expect(component.previewUrl).toBeNull();
        expect(URL.revokeObjectURL).toHaveBeenCalledWith('test-url');
    });

    it('should reset component', () => {
        component.previewUrl = 'test-url';
        component.uploading = true;

        spyOn(component, 'removeImage');
        component.reset();

        expect(component.removeImage).toHaveBeenCalled();
        expect(component.uploading).toBeFalse();
    });
});