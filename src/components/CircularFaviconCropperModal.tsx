import React, { useState, useCallback } from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Check,
  Sparkles,
  Move,
  Globe,
  Sliders
} from 'lucide-react';

interface CircularFaviconCropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropCompleteSave: (croppedDataUrl: string, originalSrc: string) => void;
  titleBarText?: string;
}

/**
 * Generates an image data URL with a transparent circular cut and crisp anti-aliasing.
 */
const getCroppedCircularImage = (
  imageSrc: string,
  pixelCrop: Area,
  isCircle: boolean = true,
  rotation: number = 0,
  outputSize: number = 256
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = outputSize;
        canvas.height = outputSize;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(imageSrc);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.clearRect(0, 0, outputSize, outputSize);

        // If circle is enabled, create round clipping mask with smooth edges
        if (isCircle) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2 - 1.5, 0, Math.PI * 2, true);
          ctx.closePath();
          ctx.clip();
        }

        // Offscreen canvas for rotation if needed
        if (rotation !== 0) {
          const rotCanvas = document.createElement('canvas');
          rotCanvas.width = image.width;
          rotCanvas.height = image.height;
          const rotCtx = rotCanvas.getContext('2d');
          if (rotCtx) {
            rotCtx.translate(image.width / 2, image.height / 2);
            rotCtx.rotate((rotation * Math.PI) / 180);
            rotCtx.drawImage(image, -image.width / 2, -image.height / 2);

            ctx.drawImage(
              rotCanvas,
              pixelCrop.x,
              pixelCrop.y,
              pixelCrop.width,
              pixelCrop.height,
              0,
              0,
              outputSize,
              outputSize
            );
          }
        } else {
          ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            outputSize,
            outputSize
          );
        }

        if (isCircle) {
          ctx.restore();
          // Add a subtle rim border so light/dark tab visibility is outstanding
          ctx.beginPath();
          ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2 - 2, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        resolve(canvas.toDataURL('image/png', 0.95));
      } catch (err) {
        console.warn('Cropping error:', err);
        resolve(imageSrc);
      }
    };
    image.onerror = (err) => reject(err);
    image.src = imageSrc;
  });
};

export const CircularFaviconCropperModal: React.FC<CircularFaviconCropperModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onCropCompleteSave,
  titleBarText = 'Al Amin Islam | Fullstack Web Developer'
}) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [cropShape, setCropShape] = useState<'round' | 'rect'>('round');

  const onCropComplete = useCallback((_croppedArea: Area, currentCroppedAreaPixels: Area) => {
    setCroppedAreaPixels(currentCroppedAreaPixels);
  }, []);

  const handleApplyCrop = async () => {
    if (!imageSrc) return;
    setIsProcessing(true);
    try {
      // If croppedAreaPixels is not yet available, fallback to center square
      const pixelCrop: Area = croppedAreaPixels || {
        x: 0,
        y: 0,
        width: 256,
        height: 256
      };

      const croppedUrl = await getCroppedCircularImage(
        imageSrc,
        pixelCrop,
        cropShape === 'round',
        rotation,
        256
      );

      onCropCompleteSave(croppedUrl, imageSrc);
      onClose();
    } catch (err) {
      console.error('Failed to crop favicon:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Circular Favicon Cropper</span>
                <span className="text-xs font-normal text-sky-400 bg-sky-950/70 border border-sky-800/60 px-2 py-0.5 rounded-full">
                  react-easy-crop
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                ছবিটি ড্র্যাগ বা জুম করে কাঙ্ক্ষিত বৃত্তাকার অংশটি নির্বাচন করুন (Select circular area for tab icon)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cropper Work Area */}
        <div className="relative w-full h-72 sm:h-80 bg-slate-950 flex items-center justify-center overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            cropShape={cropShape}
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
            classes={{
              containerClassName: 'relative w-full h-full'
            }}
          />

          {/* Stencil guidance badge overlay */}
          <div className="absolute top-3 left-3 z-10 pointer-events-none bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-[11px] text-slate-300 flex items-center gap-1.5">
            <Move className="w-3 h-3 text-sky-400" />
            <span>Drag photo to pan • Scroll to zoom</span>
          </div>
        </div>

        {/* Adjustments & Controls Panel */}
        <div className="p-4 sm:p-5 bg-slate-950/90 border-t border-slate-800 space-y-4 overflow-y-auto">
          {/* Zoom & Rotation Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Zoom Slider */}
            <div className="space-y-1.5 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <ZoomIn className="w-3.5 h-3.5 text-sky-400" />
                  <span>Zoom Level:</span>
                </span>
                <span className="font-mono text-sky-400 font-bold text-[11px]">
                  {zoom.toFixed(1)}x
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(1, +(z - 0.2).toFixed(1)))}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(3, +(z + 0.2).toFixed(1)))}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Rotation Control */}
            <div className="space-y-1.5 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <RotateCw className="w-3.5 h-3.5 text-sky-400" />
                  <span>Rotate:</span>
                </span>
                <span className="font-mono text-sky-400 font-bold text-[11px]">
                  {rotation}°
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>-90°</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 transition-colors"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>+90°</span>
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="ml-auto px-2.5 py-1 text-[11px] rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Stencil Shape Selector & Mini Browser Preview */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
            {/* Shape selection */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-sky-400" />
                <span>Stencil Shape:</span>
              </span>
              <div className="inline-flex rounded-xl p-0.5 bg-slate-950 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setCropShape('round')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    cropShape === 'round'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Circle (বৃত্তাকার)
                </button>
                <button
                  type="button"
                  onClick={() => setCropShape('rect')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    cropShape === 'rect'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Square (চারকোনা)
                </button>
              </div>
            </div>

            {/* Live Browser Tab Mini Preview */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 max-w-xs overflow-hidden">
              <div
                className={`w-4 h-4 overflow-hidden shrink-0 border border-sky-400/80 shadow-inner ${
                  cropShape === 'round' ? 'rounded-full' : 'rounded-xs'
                }`}
                style={{
                  backgroundImage: `url(${imageSrc})`,
                  backgroundPosition: 'center',
                  backgroundSize: `${zoom * 100}%`
                }}
              />
              <span className="text-[11px] font-medium text-slate-300 truncate">
                {titleBarText}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel (বাতিল)
          </button>
          <button
            type="button"
            onClick={handleApplyCrop}
            disabled={isProcessing}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-sky-500/25 transition-all cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Cropping...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Apply Circular Crop & Update Favicon</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
