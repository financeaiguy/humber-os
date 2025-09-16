// Biometric Authentication Service using WebAuthn and Web APIs
// Open source implementation for fingerprint, face recognition, and device verification

export interface BiometricCapabilities {
  webAuthn: boolean;
  fingerprint: boolean;
  faceId: boolean;
  voice: boolean;
  camera: boolean;
  microphone: boolean;
}

export interface BiometricResult {
  success: boolean;
  type: string;
  confidence: number;
  data?: any;
  error?: string;
}

export class BiometricAuthService {
  private static instance: BiometricAuthService;
  
  static getInstance(): BiometricAuthService {
    if (!BiometricAuthService.instance) {
      BiometricAuthService.instance = new BiometricAuthService();
    }
    return BiometricAuthService.instance;
  }

  // Check device biometric capabilities
  async checkCapabilities(): Promise<BiometricCapabilities> {
    const capabilities: BiometricCapabilities = {
      webAuthn: false,
      fingerprint: false,
      faceId: false,
      voice: false,
      camera: false,
      microphone: false
    };

    // Check WebAuthn support
    if (typeof window !== 'undefined' && 'credentials' in navigator && 'create' in navigator.credentials) {
      capabilities.webAuthn = true;
      
      // Check for platform authenticator (TouchID, FaceID, Windows Hello)
      try {
        const available = await (navigator.credentials as any).get({
          publicKey: {
            challenge: new Uint8Array(32),
            timeout: 60000,
            userVerification: 'required'
          }
        });
        capabilities.fingerprint = true;
        capabilities.faceId = true;
      } catch (error) {
        // Platform authenticator not available
      }
    }

    // Check camera access for face recognition
    if (typeof navigator !== 'undefined' && 'mediaDevices' in navigator) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        capabilities.camera = devices.some(device => device.kind === 'videoinput');
        capabilities.microphone = devices.some(device => device.kind === 'audioinput');
      } catch (error) {
        console.warn('Could not enumerate media devices:', error);
      }
    }

    return capabilities;
  }

  // WebAuthn Registration (for new devices)
  async registerBiometric(userId: string, username: string): Promise<BiometricResult> {
    try {
      if (!navigator.credentials) {
        throw new Error('WebAuthn not supported');
      }

      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const userIdBytes = new TextEncoder().encode(userId);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: 'Humber Operations',
            id: window.location.hostname
          },
          user: {
            id: userIdBytes,
            name: username,
            displayName: username
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' }, // ES256
            { alg: -257, type: 'public-key' } // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            requireResidentKey: false
          },
          timeout: 60000,
          attestation: 'direct'
        }
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('Failed to create credential');
      }

      const response = credential.response as AuthenticatorAttestationResponse;
      
      return {
        success: true,
        type: 'WEBAUTHN',
        confidence: 95,
        data: {
          credentialId: credential.id,
          publicKey: Array.from(new Uint8Array(response.getPublicKey()!)),
          attestationObject: Array.from(new Uint8Array(response.attestationObject)),
          clientDataJSON: Array.from(new Uint8Array(response.clientDataJSON))
        }
      };

    } catch (error) {
      return {
        success: false,
        type: 'WEBAUTHN',
        confidence: 0,
        error: error instanceof Error ? error.message : 'Registration failed'
      };
    }
  }

  // WebAuthn Authentication
  async authenticateBiometric(credentialId: string): Promise<BiometricResult> {
    try {
      if (!navigator.credentials) {
        throw new Error('WebAuthn not supported');
      }

      const challenge = crypto.getRandomValues(new Uint8Array(32));

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials: [{
            id: new TextEncoder().encode(credentialId),
            type: 'public-key'
          }],
          userVerification: 'required',
          timeout: 60000
        }
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('Authentication failed');
      }

      const response = credential.response as AuthenticatorAssertionResponse;

      return {
        success: true,
        type: 'WEBAUTHN',
        confidence: 95,
        data: {
          credentialId: credential.id,
          signature: Array.from(new Uint8Array(response.signature)),
          authenticatorData: Array.from(new Uint8Array(response.authenticatorData)),
          clientDataJSON: Array.from(new Uint8Array(response.clientDataJSON)),
          userHandle: response.userHandle ? Array.from(new Uint8Array(response.userHandle)) : null
        }
      };

    } catch (error) {
      return {
        success: false,
        type: 'WEBAUTHN',
        confidence: 0,
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  }

  // Face Recognition using Camera (basic implementation)
  async authenticateFace(): Promise<BiometricResult> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      });

      // Create video element for face capture
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Wait for video to load
      await new Promise(resolve => {
        video.onloadedmetadata = resolve;
      });

      // Capture frame for face analysis
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(video, 0, 0);

      // Stop camera
      stream.getTracks().forEach(track => track.stop());

      // Basic face detection (would integrate with face-api.js or similar)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Mock face recognition result (integrate with actual face recognition library)
      const faceDetected = this.detectFace(imageData);
      
      return {
        success: faceDetected,
        type: 'FACE_ID',
        confidence: faceDetected ? 85 : 0,
        data: {
          imageHash: await this.hashImageData(imageData),
          timestamp: Date.now(),
          dimensions: { width: canvas.width, height: canvas.height }
        }
      };

    } catch (error) {
      return {
        success: false,
        type: 'FACE_ID',
        confidence: 0,
        error: error instanceof Error ? error.message : 'Face recognition failed'
      };
    }
  }

  // Voice Recognition (basic implementation)
  async authenticateVoice(): Promise<BiometricResult> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create audio recorder
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      // Record for 3 seconds
      mediaRecorder.start();
      await new Promise(resolve => setTimeout(resolve, 3000));
      mediaRecorder.stop();

      // Stop microphone
      stream.getTracks().forEach(track => track.stop());

      // Process audio (would integrate with voice recognition library)
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      const voiceprint = await this.analyzeVoice(audioBlob);

      return {
        success: voiceprint.confidence > 70,
        type: 'VOICE',
        confidence: voiceprint.confidence,
        data: {
          voiceprintHash: voiceprint.hash,
          duration: 3000,
          sampleRate: 44100
        }
      };

    } catch (error) {
      return {
        success: false,
        type: 'VOICE',
        confidence: 0,
        error: error instanceof Error ? error.message : 'Voice recognition failed'
      };
    }
  }

  // Device Fingerprinting
  async getDeviceFingerprint(): Promise<string> {
    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth,
        pixelDepth: screen.pixelDepth
      },
      canvas: await this.getCanvasFingerprint(),
      webgl: await this.getWebGLFingerprint(),
      audio: await this.getAudioFingerprint()
    };

    // Create hash of fingerprint data
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(fingerprint));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Private helper methods
  private detectFace(imageData: ImageData): boolean {
    // Basic face detection - would integrate with face-api.js or TensorFlow.js
    // This is a simplified implementation
    const { data, width, height } = imageData;
    
    // Simple skin tone detection as proxy for face presence
    let skinPixels = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Basic skin tone detection
      if (r > 95 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 15) {
        skinPixels++;
      }
    }
    
    const skinRatio = skinPixels / (width * height);
    return skinRatio > 0.1; // If more than 10% skin-like pixels, assume face present
  }

  private async hashImageData(imageData: ImageData): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(Array.from(imageData.data)));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async analyzeVoice(audioBlob: Blob): Promise<{ confidence: number; hash: string }> {
    // Mock voice analysis - would integrate with voice recognition library
    const arrayBuffer = await audioBlob.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return {
      confidence: 75 + Math.random() * 20, // Mock confidence score
      hash
    };
  }

  private async getCanvasFingerprint(): Promise<string> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    // Draw test pattern
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint test 🔒', 2, 2);
    
    return canvas.toDataURL();
  }

  private async getWebGLFingerprint(): Promise<string> {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) return 'webgl-not-supported';
      
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'unknown';
      const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown';
      
      return `${vendor}-${renderer}`;
    } catch (error) {
      return 'webgl-error';
    }
  }

  private async getAudioFingerprint(): Promise<string> {
    try {
      // Create audio context for fingerprinting
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const analyser = audioContext.createAnalyser();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(analyser);
      analyser.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      gainNode.gain.value = 0; // Silent
      oscillator.frequency.value = 1000;
      oscillator.start();
      
      // Get frequency data
      const frequencyData = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(frequencyData);
      
      oscillator.stop();
      audioContext.close();
      
      return Array.from(frequencyData.slice(0, 10)).join(',');
    } catch (error) {
      return 'audio-not-available';
    }
  }
}

// Liveness Detection Service (anti-spoofing)
export class LivenessDetectionService {
  
  // Simple liveness detection using camera
  async detectLiveness(): Promise<{ isLive: boolean; confidence: number; challenges: string[] }> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      await new Promise(resolve => {
        video.onloadedmetadata = resolve;
      });

      // Perform liveness challenges
      const challenges = ['blink', 'smile', 'turn_head'];
      const results = [];

      for (const challenge of challenges) {
        const result = await this.performLivenessChallenge(video, challenge);
        results.push(result);
      }

      // Stop camera
      stream.getTracks().forEach(track => track.stop());

      const averageConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
      const isLive = averageConfidence > 70;

      return {
        isLive,
        confidence: averageConfidence,
        challenges: results.map(r => r.challenge)
      };

    } catch (error) {
      return {
        isLive: false,
        confidence: 0,
        challenges: []
      };
    }
  }

  private async performLivenessChallenge(video: HTMLVideoElement, challenge: string): Promise<{ challenge: string; confidence: number }> {
    // Mock liveness challenge - would integrate with actual computer vision library
    // In production, this would use TensorFlow.js or similar for real face analysis
    
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate analysis time
    
    return {
      challenge,
      confidence: 75 + Math.random() * 20 // Mock confidence score
    };
  }
}

// Face Recognition Service using TensorFlow.js (open source)
export class FaceRecognitionService {
  private model: any = null;
  
  async loadModel(): Promise<void> {
    // In production, would load actual face recognition model
    // Example: @tensorflow-models/face-landmarks-detection
    console.log('Loading face recognition model...');
    
    // Mock model loading
    await new Promise(resolve => setTimeout(resolve, 2000));
    this.model = { loaded: true };
  }

  async recognizeFace(imageData: ImageData): Promise<BiometricResult> {
    if (!this.model) {
      await this.loadModel();
    }

    try {
      // Mock face recognition - would use actual TensorFlow.js model
      const faceDetected = Math.random() > 0.2; // 80% success rate for demo
      const confidence = faceDetected ? 80 + Math.random() * 15 : Math.random() * 30;

      return {
        success: faceDetected && confidence > 75,
        type: 'FACE_ID',
        confidence,
        data: {
          landmarks: faceDetected ? this.mockFaceLandmarks() : null,
          embedding: faceDetected ? this.mockFaceEmbedding() : null
        }
      };

    } catch (error) {
      return {
        success: false,
        type: 'FACE_ID',
        confidence: 0,
        error: error instanceof Error ? error.message : 'Face recognition failed'
      };
    }
  }

  private mockFaceLandmarks() {
    // Mock face landmarks - would be real coordinates from TensorFlow.js
    return {
      leftEye: { x: 120, y: 100 },
      rightEye: { x: 180, y: 100 },
      nose: { x: 150, y: 130 },
      mouth: { x: 150, y: 160 }
    };
  }

  private mockFaceEmbedding(): number[] {
    // Mock face embedding vector - would be real 128/512-dimensional vector
    return Array.from({ length: 128 }, () => Math.random() * 2 - 1);
  }
}

// Export singleton instances
export const biometricAuth = BiometricAuthService.getInstance();
export const livenessDetection = new LivenessDetectionService();
export const faceRecognition = new FaceRecognitionService();
