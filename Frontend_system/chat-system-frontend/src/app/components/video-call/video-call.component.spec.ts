import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VideoCallService } from '../../services/video-call.service';
import { AuthService } from '../auth/auth.service';
import { VideoCallComponent } from './video-call.component';
import { WebRTCService } from '../../services/webrtc.service';
import { SocketService } from '../../services/socket.service';
import { PeerJSService } from '../../services/peerjs.service';
import { of } from 'rxjs';

describe('VideoCallComponent', () => {
    let component: VideoCallComponent;
    let fixture: ComponentFixture<VideoCallComponent>;
    let mockVideoCallService: jasmine.SpyObj<VideoCallService>;
    let mockAuthService: jasmine.SpyObj<AuthService>;
    let mockSnackBar: jasmine.SpyObj<MatSnackBar>;
    let mockDialogRef: jasmine.SpyObj<MatDialogRef<VideoCallComponent>>;
    let mockWebRTCService: jasmine.SpyObj<WebRTCService>;
    let mockSocketService: jasmine.SpyObj<SocketService>;
    let mockPeerJSService: jasmine.SpyObj<PeerJSService>;

    beforeEach(async () => {
        const videoCallServiceSpy = jasmine.createSpyObj('VideoCallService', [
            'getCallHistory', 'answerCall', 'rejectCall', 'endCall', 'startRecording', 'stopRecording', 'updateCallQuality'
        ]);
        const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
        const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
        const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
        const webRTCServiceSpy = jasmine.createSpyObj('WebRTCService', [
            'createPeerConnection', 'getUserMedia', 'startQualityMonitoring', 'onEvent', 'cleanup', 'switchToScreenShare', 'switchToCamera', 'startRecording', 'stopRecording'
        ]);
        const socketServiceSpy = jasmine.createSpyObj('SocketService', ['getSocket']);
        const peerJSServiceSpy = jasmine.createSpyObj('PeerJSService', [
            'getPeerId', 'startGroupVideoCall', 'getLocalStream', 'endCall', 'callEvents$'
        ]);

        await TestBed.configureTestingModule({
            imports: [VideoCallComponent, HttpClientTestingModule],
            providers: [
                { provide: VideoCallService, useValue: videoCallServiceSpy },
                { provide: AuthService, useValue: authServiceSpy },
                { provide: MatSnackBar, useValue: snackBarSpy },
                { provide: MatDialogRef, useValue: dialogRefSpy },
                { provide: WebRTCService, useValue: webRTCServiceSpy },
                { provide: SocketService, useValue: socketServiceSpy },
                { provide: PeerJSService, useValue: peerJSServiceSpy }
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(VideoCallComponent);
        component = fixture.componentInstance;
        mockVideoCallService = TestBed.inject(VideoCallService) as jasmine.SpyObj<VideoCallService>;
        mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
        mockSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
        mockDialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<VideoCallComponent>>;
        mockWebRTCService = TestBed.inject(WebRTCService) as jasmine.SpyObj<WebRTCService>;
        mockSocketService = TestBed.inject(SocketService) as jasmine.SpyObj<SocketService>;
        mockPeerJSService = TestBed.inject(PeerJSService) as jasmine.SpyObj<PeerJSService>;

        // Mock methods to return observables
        mockVideoCallService.getCallHistory.and.returnValue({ pipe: () => ({ subscribe: (callback: any) => callback.next({ success: true, data: [] }) }) } as any);
        mockVideoCallService.answerCall.and.returnValue({ pipe: () => ({ subscribe: (callback: any) => callback.next({ success: true }) }) } as any);
        mockVideoCallService.rejectCall.and.returnValue({ pipe: () => ({ subscribe: (callback: any) => callback.next({ success: true }) }) } as any);
        mockVideoCallService.endCall.and.returnValue({ pipe: () => ({ subscribe: (callback: any) => callback.next({ success: true }) }) } as any);

        // Mock PeerJSService callEvents$
        mockPeerJSService.callEvents$ = { pipe: () => ({ subscribe: () => { } }) } as any;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have initial values', () => {
        expect(component.isInCall).toBeFalse();
        expect(component.incomingCall).toBeNull();
        expect(component.currentCall).toBeNull();
        expect(component.isMuted).toBeFalse();
        expect(component.isCameraOn).toBeTrue();
        expect(component.isScreenSharing).toBeFalse();
        expect(component.isRecording).toBeFalse();
    });

    it('should load call history on init', () => {
        const mockResponse = { success: true, data: [] };
        mockVideoCallService.getCallHistory.and.returnValue({ pipe: () => ({ subscribe: (callback: any) => callback.next(mockResponse) }) } as any);

        component.ngOnInit();

        expect(mockVideoCallService.getCallHistory).toHaveBeenCalledWith({ limit: 20 });
    });

    it('should answer call', () => {
        const mockCall = { _id: 'call1', callerName: 'Test User' };
        component.incomingCall = mockCall as any;
        const mockResponse = { success: true, data: mockCall };
        mockVideoCallService.answerCall.and.returnValue({ pipe: () => ({ subscribe: (callback: any) => callback.next(mockResponse) }) } as any);

        component.answerCall();

        expect(mockVideoCallService.answerCall).toHaveBeenCalledWith('call1');
    });

    it('should reject call', () => {
        const mockCall = {
            _id: 'call1',
            callerName: 'Test User',
            callerId: 'user1',
            receiverId: 'user2',
            receiverName: 'Receiver',
            channelId: 'channel1',
            status: 'initiated' as any,
            startTime: '2023-01-01T12:00:00Z',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        component.incomingCall = mockCall as any;
        const mockResponse = { success: true, data: mockCall };
        mockVideoCallService.rejectCall.and.returnValue(of(mockResponse));
        spyOn(component['snackBar'], 'open').and.callThrough();

        component.rejectCall();

        expect(mockVideoCallService.rejectCall).toHaveBeenCalledWith('call1');
        expect(component['snackBar'].open).toHaveBeenCalledWith('Call rejected', 'Close', { duration: 2000 });
    });

    it('should end call', () => {
        const mockCall = { _id: 'call1' };
        component.currentCall = mockCall as any;
        const mockResponse = { success: true };
        mockVideoCallService.endCall.and.returnValue({ pipe: () => ({ subscribe: (callback: any) => callback.next(mockResponse) }) } as any);

        component.endCall();

        expect(mockVideoCallService.endCall).toHaveBeenCalledWith('call1');
    });

    it('should toggle mute', () => {
        const initialMuted = component.isMuted;
        component.toggleMute();
        expect(component.isMuted).toBe(!initialMuted);
    });

    it('should toggle camera', () => {
        const initialCameraOn = component.isCameraOn;
        component.toggleCamera();
        expect(component.isCameraOn).toBe(!initialCameraOn);
    });

    it('should toggle screen share', async () => {
        mockWebRTCService.switchToScreenShare.and.returnValue(Promise.resolve());

        await component.toggleScreenShare();

        expect(mockWebRTCService.switchToScreenShare).toHaveBeenCalled();
    });

    it('should format call duration', () => {
        component.callDuration = 125; // 2 minutes 5 seconds
        expect(component.formatCallDuration()).toBe('02:05');
    });

    it('should format duration', () => {
        expect(component.formatDuration(125)).toBe('2:05');
    });

    it('should get status label', () => {
        expect(component.getStatusLabel('initiated')).toBe('Initiated');
        expect(component.getStatusLabel('answered')).toBe('Answered');
        expect(component.getStatusLabel('rejected')).toBe('Rejected');
        expect(component.getStatusLabel('ended')).toBe('Ended');
        expect(component.getStatusLabel('failed')).toBe('Failed');
    });

    it('should refresh call history', () => {
        const mockResponse = { success: true, data: [] };
        mockVideoCallService.getCallHistory.and.returnValue(of(mockResponse));
        spyOn(component['snackBar'], 'open').and.callThrough();

        component.refreshCallHistory();

        expect(mockVideoCallService.getCallHistory).toHaveBeenCalledWith({ limit: 20 });
        expect(component['snackBar'].open).toHaveBeenCalledWith('Call history refreshed', 'Close', { duration: 2000 });
    });
});
