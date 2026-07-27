import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, Check, X, Upload, AlertCircle, Sparkles } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const startCamera = useCallback(async () => {
    setIsInitializing(true);
    setCameraError(null);
    setCapturedImage(null);

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported on this browser or environment.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 640 },
          height: { ideal: 640 }
        },
        audio: false
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      let message = err?.message || 'Unable to access device camera.';
      if (err?.name === 'NotAllowedError' || message.toLowerCase().includes('permission') || message.toLowerCase().includes('dismissed') || message.toLowerCase().includes('denied')) {
        message = 'Camera permission was dismissed or blocked. You can retry camera access or upload a photo directly from your device.';
      }
      setCameraError(message);
    } finally {
      setIsInitializing(false);
    }
  }, [facingMode]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      setCapturedImage(null);
      setCameraError(null);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const size = Math.min(video.videoWidth || 640, video.videoHeight || 640);
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Mirror if user facing
      if (facingMode === 'user') {
        ctx.translate(size, 0);
        ctx.scale(-1, 1);
      }
      const startX = ((video.videoWidth || size) - size) / 2;
      const startY = ((video.videoHeight || size) - size) / 2;
      ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setCapturedImage(dataUrl);

      // Stop camera stream to save battery
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCapturedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  const toggleFacingMode = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] max-w-md w-full p-6 md:p-8 shadow-2xl border border-gray-100 flex flex-col gap-6 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg">Update Profile Photo</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Capture with Device Camera</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-2xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Preview Canvas Container */}
        <div className="relative aspect-square w-full bg-slate-950 rounded-[2rem] overflow-hidden flex items-center justify-center border-4 border-gray-100 shadow-inner group">
          <canvas ref={canvasRef} className="hidden" />

          {capturedImage ? (
            <img 
              src={capturedImage} 
              alt="Captured avatar" 
              className="w-full h-full object-cover"
            />
          ) : cameraError ? (
            <div className="p-6 text-center text-white flex flex-col items-center justify-center gap-3 h-full">
              <AlertCircle className="w-10 h-10 text-amber-400 shrink-0" />
              <p className="text-xs font-semibold text-gray-300 leading-relaxed max-w-xs">{cameraError}</p>
              <div className="flex flex-wrap items-center justify-center gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 border border-slate-700 shadow-md"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400" /> Retry Camera
                </button>
                <label className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer shadow-lg shadow-emerald-900/50 transition-all flex items-center gap-2">
                  <Upload className="w-3.5 h-3.5" /> Select Photo
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>
          ) : (
            <>
              <video 
                ref={videoRef} 
                playsInline 
                muted 
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />
              {/* Circular framing guidelines */}
              <div className="absolute inset-0 border-2 border-emerald-400/40 rounded-full m-8 pointer-events-none border-dashed animate-spin-slow" />
              <div className="absolute top-4 left-4 px-3 py-1 bg-black/40 backdrop-blur-sm rounded-full text-[9px] font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Live Camera
              </div>

              {/* Switch Facing Camera Button */}
              <button 
                type="button"
                onClick={toggleFacingMode}
                className="absolute top-4 right-4 p-2.5 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-all"
                title="Switch Front/Back Camera"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="space-y-3">
          {capturedImage ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={startCamera}
                className="py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Retake
              </button>
              <button
                type="button"
                onClick={confirmPhoto}
                className="py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" /> Save Photo
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {cameraError ? (
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-2xl text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4 text-emerald-600" /> Retry Camera
                  </button>
                  <label className="py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-200">
                    <Upload className="w-4 h-4" /> Upload Photo
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isInitializing}
                  onClick={takeSnapshot}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-xs font-black uppercase tracking-[0.15em] shadow-xl shadow-emerald-200 transition-all flex items-center justify-center gap-2.5 active:scale-95 disabled:opacity-50"
                >
                  <Camera className="w-5 h-5" /> Take Snap
                </button>
              )}

              {!cameraError && (
                <div className="flex items-center justify-center pt-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-emerald-600 cursor-pointer flex items-center gap-1.5 transition-all">
                    <Upload className="w-3.5 h-3.5" /> Upload from Device Gallery
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
