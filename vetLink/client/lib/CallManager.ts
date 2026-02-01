/**
 * WebRTC Call Manager
 * Handles peer connections, media streams, and call signaling
 */

import { RingtoneManager } from './RingtoneManager';

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'call-rejected' | 'call-ended' | 'ping' | 'pong';
  fromUserId: number;
  toUserId: number;
  callId: number;
  sdp?: string;
  iceCandidate?: {
    candidate: string;
    sdpMLineIndex: string;
    sdpMid: string;
  };
  message?: string;
  videoEnabled?: boolean;
}

export class CallManager {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private signalingConnection: WebSocket | null = null;
  private userId: number;
  private callId: number | null = null;
  private remoteUserId: number | null = null;
  private videoEnabled: boolean = false;
  private audioEnabled: boolean = true;
  private onLocalStream?: (stream: MediaStream) => void;
  private onRemoteStream?: (stream: MediaStream) => void;
  private onCallEnded?: () => void;
  private onError?: (error: string) => void;
  private pingInterval: NodeJS.Timeout | null = null;
  private iceCandidateQueue: RTCIceCandidate[] = [];
  private isConnecting: boolean = false;
  private ringtoneManager: RingtoneManager;

  constructor(userId: number) {
    this.userId = userId;
    this.ringtoneManager = new RingtoneManager();
    this.setupSignalingConnection();
  }

  /**
   * Setup WebSocket connection for signaling
   */
  private setupSignalingConnection() {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws/call`;

    console.log('🔌 Connecting to signaling server:', wsUrl);

    this.signalingConnection = new WebSocket(wsUrl);

    this.signalingConnection.onopen = () => {
      console.log('✅ WebSocket connected');
      this.startPingKeepalive();
    };

    this.signalingConnection.onmessage = (event) => {
      try {
        const message: SignalingMessage = JSON.parse(event.data);
        this.handleSignalingMessage(message);
      } catch (err) {
        console.error('❌ Error parsing signaling message:', err);
      }
    };

    this.signalingConnection.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      this.onError?.('Connection error');
    };

    this.signalingConnection.onclose = () => {
      console.log('❌ WebSocket disconnected');
      if (this.pingInterval) clearInterval(this.pingInterval);
    };
  }

  /**
   * Start ping keep-alive to maintain connection
   */
  private startPingKeepalive() {
    this.pingInterval = setInterval(() => {
      if (this.signalingConnection?.readyState === WebSocket.OPEN) {
        this.send({
          type: 'ping',
          fromUserId: this.userId,
          toUserId: 0,
          callId: 0,
        });
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Send signaling message
   */
  private send(message: SignalingMessage) {
    if (this.signalingConnection?.readyState === WebSocket.OPEN) {
      this.signalingConnection.send(JSON.stringify(message));
    } else {
      console.warn('⚠️ WebSocket not open, cannot send message');
    }
  }

  /**
   * Handle incoming signaling messages
   */
  private handleSignalingMessage(message: SignalingMessage) {
    console.log('📨 Received signaling message:', message.type);

    switch (message.type) {
      case 'offer':
        this.handleRemoteOffer(message);
        break;
      case 'answer':
        this.handleRemoteAnswer(message);
        break;
      case 'ice-candidate':
        this.handleRemoteIceCandidate(message);
        break;
      case 'call-rejected':
        this.handleCallRejection(message);
        break;
      case 'call-ended':
        this.handleRemoteCallEnd(message);
        break;
      case 'pong':
        console.log('💓 Pong received');
        break;
    }
  }

  /**
   * Initiate a call
   */
  async initiateCall(recipientId: number, callId: number, enableVideo: boolean = false): Promise<void> {
    try {
      this.remoteUserId = recipientId;
      this.callId = callId;
      this.videoEnabled = enableVideo;
      this.isConnecting = true;

      // Prepare and play outgoing ringtone
      await this.ringtoneManager.prepareAudio();
      await this.ringtoneManager.play('outgoing');

      // Get media stream
      await this.getLocalMediaStream(enableVideo);

      // Create peer connection
      this.createPeerConnection();

      // Add local stream tracks to peer connection
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => {
          this.peerConnection!.addTrack(track, this.localStream!);
        });
      }

      // Create and send offer
      const offer = await this.peerConnection!.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: enableVideo,
      });

      await this.peerConnection!.setLocalDescription(offer);

      this.send({
        type: 'offer',
        fromUserId: this.userId,
        toUserId: recipientId,
        callId: callId,
        sdp: offer.sdp,
        videoEnabled: enableVideo,
      });

      console.log('📞 Call initiated to user:', recipientId);
    } catch (error) {
      console.error('❌ Error initiating call:', error);
      this.ringtoneManager.stop();
      this.onError?.(error instanceof Error ? error.message : 'Failed to initiate call');
      this.cleanup();
    }
  }

  /**
   * Accept an incoming call
   */
  async acceptCall(callerId: number, callId: number, offer?: RTCSessionDescriptionInit, enableVideo: boolean = false): Promise<void> {
    try {
      // Stop incoming ringtone when accepting
      this.ringtoneManager.stop();

      this.remoteUserId = callerId;
      this.callId = callId;
      this.videoEnabled = enableVideo;
      this.isConnecting = true;

      // Get media stream
      await this.getLocalMediaStream(enableVideo);

      // Create peer connection if not exists
      if (!this.peerConnection) {
        this.createPeerConnection();
      }

      // Add local stream tracks to peer connection
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => {
          this.peerConnection!.addTrack(track, this.localStream!);
        });
      }

      // Set remote description if provided and valid, otherwise check if already set
      if (offer && offer.sdp) {
        await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(offer));
      } else if (!this.peerConnection!.remoteDescription) {
        console.warn('⚠️ No offer provided and no remote description set. Waiting for offer...');
        // We might want to throw here, but maybe we can wait for the offer to arrive via WebSocket
        // For now, let's not throw immediately to avoid crashing UI, but negotiation effectively stalls
        // untill offer arrives.
      }

      // Create and send answer
      // We can only create answer if we have a remote description
      if (this.peerConnection!.remoteDescription) {
        const answer = await this.peerConnection!.createAnswer();
        await this.peerConnection!.setLocalDescription(answer);

        this.send({
          type: 'answer',
          fromUserId: this.userId,
          toUserId: callerId,
          callId: callId,
          sdp: answer.sdp,
          videoEnabled: enableVideo,
        });

        console.log('✅ Call accepted');
      } else {
        console.warn("⚠️ Cannot send answer yet, waiting for remote description (Offer)");
      }

    } catch (error) {
      console.error('❌ Error accepting call:', error);
      this.ringtoneManager.stop();
      this.onError?.(error instanceof Error ? error.message : 'Failed to accept call');
      this.cleanup();
    }
  }

  /**
   * Reject a call
   */
  rejectCall(callerId: number, callId: number): void {
    // Stop ringtone when rejecting
    this.ringtoneManager.stop();

    this.send({
      type: 'call-rejected',
      fromUserId: this.userId,
      toUserId: callerId,
      callId: callId,
    });
    console.log('❌ Call rejected');
  }

  /**
   * End the current call
   */
  async endCall(): Promise<void> {
    // Stop ringtone when ending call
    this.ringtoneManager.stop();

    if (this.remoteUserId && this.callId) {
      this.send({
        type: 'call-ended',
        fromUserId: this.userId,
        toUserId: this.remoteUserId,
        callId: this.callId,
      });
    }
    this.cleanup();
    console.log('📵 Call ended');
  }

  /**
   * Get local media stream (audio and optional video)
   */
  private async getLocalMediaStream(enableVideo: boolean): Promise<void> {
    try {
      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: enableVideo ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        } : false,
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('🎤 Local media stream acquired');
      this.onLocalStream?.(this.localStream);
    } catch (error) {
      console.error('❌ Error getting media stream:', error);
      throw new Error('Cannot access microphone/camera');
    }
  }

  /**
   * Create RTCPeerConnection
   */
  private createPeerConnection(): void {
    const config: RTCConfiguration = {
      iceServers: [
        { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
      ],
    };

    this.peerConnection = new RTCPeerConnection(config);

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.remoteUserId && this.callId) {
        this.send({
          type: 'ice-candidate',
          fromUserId: this.userId,
          toUserId: this.remoteUserId,
          callId: this.callId,
          iceCandidate: {
            candidate: event.candidate.candidate,
            sdpMLineIndex: String(event.candidate.sdpMLineIndex || 0),
            sdpMid: event.candidate.sdpMid || '',
          },
        });
      }
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      console.log('📡 Connection state:', this.peerConnection?.connectionState);
      if (this.peerConnection?.connectionState === 'failed') {
        this.attemptReconnect();
      }
      if (this.peerConnection?.connectionState === 'disconnected') {
        console.warn('⚠️ Connection disconnected');
      }
    };

    // Handle ICE connection state
    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('🧊 ICE connection state:', this.peerConnection?.iceConnectionState);
    };

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      console.log('📹 Received remote track:', event.track.kind);
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream();
        this.onRemoteStream?.(this.remoteStream);
      }
      this.remoteStream.addTrack(event.track);
    };

    console.log('✅ Peer connection created');
  }

  /**
   * Handle remote offer
   */
  private async handleRemoteOffer(message: SignalingMessage): Promise<void> {
    try {
      if (!message.sdp) {
        throw new Error('No SDP in offer');
      }

      // Play incoming ringtone when receiving an offer
      await this.ringtoneManager.prepareAudio();
      await this.ringtoneManager.play('incoming');

      this.remoteUserId = message.fromUserId;
      this.callId = message.callId;
      this.videoEnabled = message.videoEnabled || false;

      if (!this.peerConnection) {
        this.createPeerConnection();
      }

      const offer = new RTCSessionDescription({ type: 'offer', sdp: message.sdp });
      await this.peerConnection.setRemoteDescription(offer);

      console.log('✅ Remote offer handled');
    } catch (error) {
      console.error('❌ Error handling remote offer:', error);
      this.ringtoneManager.stop();
      this.onError?.(error instanceof Error ? error.message : 'Failed to handle offer');
    }
  }

  /**
   * Handle remote answer
   */
  private async handleRemoteAnswer(message: SignalingMessage): Promise<void> {
    try {
      if (!message.sdp) {
        throw new Error('No SDP in answer');
      }

      // Stop outgoing ringtone when call is answered
      this.ringtoneManager.stop();

      const answer = new RTCSessionDescription({ type: 'answer', sdp: message.sdp });
      await this.peerConnection?.setRemoteDescription(answer);

      // Process any queued ICE candidates
      this.processIceCandidateQueue();

      console.log('✅ Remote answer handled');
    } catch (error) {
      console.error('❌ Error handling remote answer:', error);
      this.onError?.(error instanceof Error ? error.message : 'Failed to handle answer');
    }
  }

  /**
   * Handle remote ICE candidate
   */
  private async handleRemoteIceCandidate(message: SignalingMessage): Promise<void> {
    try {
      if (!message.iceCandidate) {
        return;
      }

      const candidate = new RTCIceCandidate({
        candidate: message.iceCandidate.candidate,
        sdpMLineIndex: parseInt(message.iceCandidate.sdpMLineIndex),
        sdpMid: message.iceCandidate.sdpMid,
      });

      if (this.peerConnection?.remoteDescription) {
        await this.peerConnection.addIceCandidate(candidate);
      } else {
        // Queue candidate if remote description not set yet
        this.iceCandidateQueue.push(candidate);
      }
    } catch (error) {
      console.error('❌ Error handling ICE candidate:', error);
    }
  }

  /**
   * Process queued ICE candidates
   */
  private async processIceCandidateQueue(): Promise<void> {
    while (this.iceCandidateQueue.length > 0) {
      const candidate = this.iceCandidateQueue.shift();
      try {
        await this.peerConnection?.addIceCandidate(candidate);
      } catch (error) {
        console.error('❌ Error adding queued ICE candidate:', error);
      }
    }
  }

  /**
   * Handle call rejection
   */
  private handleCallRejection(message: SignalingMessage): void {
    console.log('❌ Call rejected by remote peer');
    this.ringtoneManager.stop();
    this.cleanup();
    this.onCallEnded?.();
  }

  /**
   * Handle remote call end
   */
  private handleRemoteCallEnd(message: SignalingMessage): void {
    console.log('📵 Remote peer ended call');
    this.ringtoneManager.stop();
    this.cleanup();
    this.onCallEnded?.();
  }

  /**
   * Attempt to reconnect after connection failure
   */
  private attemptReconnect(): void {
    console.log('🔄 Attempting to reconnect...');
    // Could implement exponential backoff here
    // For now, just notify
    this.onError?.('Connection lost, attempting to reconnect...');
  }

  /**
   * Toggle audio (mute/unmute)
   */
  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
      this.audioEnabled = enabled;
      console.log('🔊 Audio', enabled ? 'enabled' : 'muted');
    }
  }

  /**
   * Toggle video
   */
  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
      });
      this.videoEnabled = enabled;
      console.log('📹 Video', enabled ? 'enabled' : 'disabled');
    }
  }

  /**
   * Get local stream
   */
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  /**
   * Get remote stream
   */
  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  /**
   * Check if call is connected
   */
  isCallConnected(): boolean {
    return this.peerConnection?.connectionState === 'connected';
  }

  /**
   * Set callbacks
   */
  setOnLocalStream(callback: (stream: MediaStream) => void): void {
    this.onLocalStream = callback;
  }

  setOnRemoteStream(callback: (stream: MediaStream) => void): void {
    this.onRemoteStream = callback;
  }

  setOnCallEnded(callback: () => void): void {
    this.onCallEnded = callback;
  }

  setOnError(callback: (error: string) => void): void {
    this.onError = callback;
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    // Stop any playing ringtones
    this.ringtoneManager.stop();

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    // Reset state
    this.remoteStream = null;
    this.callId = null;
    this.remoteUserId = null;
    this.isConnecting = false;
    this.iceCandidateQueue = [];

    console.log('🧹 Cleaned up call resources');
  }

  /**
   * Destroy the call manager
   */
  destroy(): void {
    this.cleanup();
    this.ringtoneManager.destroy();
    if (this.pingInterval) clearInterval(this.pingInterval);
    if (this.signalingConnection) {
      this.signalingConnection.close();
      this.signalingConnection = null;
    }
  }

  /**
   * Get ringtone manager (for manual control if needed)
   */
  getRingtoneManager(): RingtoneManager {
    return this.ringtoneManager;
  }
}
