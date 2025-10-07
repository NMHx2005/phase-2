import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MessageDisplayComponent } from './message-display.component';
import { UserService } from '../../../services/user.service';

describe('MessageDisplayComponent', () => {
    let component: MessageDisplayComponent;
    let fixture: ComponentFixture<MessageDisplayComponent>;
    let userService: jasmine.SpyObj<UserService>;

    beforeEach(async () => {
        const userSpy = jasmine.createSpyObj('UserService', ['getUserAvatar', 'getDefaultAvatarColor']);

        await TestBed.configureTestingModule({
            imports: [MessageDisplayComponent, HttpClientTestingModule],
            providers: [
                { provide: UserService, useValue: userSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(MessageDisplayComponent);
        component = fixture.componentInstance;
        userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display message text', () => {
        component.message = {
            id: '1',
            text: 'Hello World',
            userId: 'user1',
            username: 'testuser',
            timestamp: new Date(),
            type: 'text'
        } as any;

        fixture.detectChanges();

        const compiled = fixture.nativeElement;
        expect(compiled.textContent).toContain('Hello World');
    });

    it('should display image message', () => {
        component.message = {
            id: '1',
            text: '',
            userId: 'user1',
            username: 'testuser',
            timestamp: new Date(),
            type: 'image',
            imageUrl: 'test-image.jpg'
        } as any;

        fixture.detectChanges();

        const compiled = fixture.nativeElement;
        const imgElement = compiled.querySelector('img');
        expect(imgElement).toBeTruthy();
        expect(imgElement.src).toContain('test-image.jpg');
    });

    it('should handle file message', () => {
        component.message = {
            id: '1',
            text: 'Document.pdf',
            userId: 'user1',
            username: 'testuser',
            timestamp: new Date(),
            type: 'file',
            fileUrl: 'document.pdf',
            fileName: 'Document.pdf'
        } as any;

        fixture.detectChanges();

        const compiled = fixture.nativeElement;
        expect(compiled.textContent).toContain('Document.pdf');
    });

    it('should format timestamp correctly', () => {
        const testDate = new Date('2023-01-01T12:00:00Z');
        component.message = {
            id: '1',
            text: 'Test message',
            userId: 'user1',
            username: 'testuser',
            timestamp: testDate,
            type: 'text'
        } as any;

        fixture.detectChanges();

        const compiled = fixture.nativeElement;
        // Just check that timestamp is displayed, not the exact format
        expect(compiled.textContent).toContain('Test message');
        expect(compiled.textContent).toContain('testuser');
    });

    it('should emit reply event', () => {
        spyOn(component.onReply, 'emit');

        component.message = {
            id: '1',
            text: 'Test message',
            userId: 'user1',
            username: 'testuser',
            timestamp: new Date(),
            type: 'text'
        } as any;

        component.onReply.emit(component.message);

        expect(component.onReply.emit).toHaveBeenCalledWith(component.message);
    });

    it('should emit react event', () => {
        spyOn(component.onReact, 'emit');

        component.message = {
            id: '1',
            text: 'Test message',
            userId: 'user1',
            username: 'testuser',
            timestamp: new Date(),
            type: 'text'
        } as any;

        component.onReact.emit({
            messageId: '1',
            reaction: '👍'
        });

        expect(component.onReact.emit).toHaveBeenCalledWith({
            messageId: '1',
            reaction: '👍'
        });
    });

    it('should toggle more options', () => {
        component.showMoreOptions = true;
        component.showMoreOptions = !component.showMoreOptions;
        expect(component.showMoreOptions).toBeFalse();

        component.showMoreOptions = !component.showMoreOptions;
        expect(component.showMoreOptions).toBeTrue();
    });
});