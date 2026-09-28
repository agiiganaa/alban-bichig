import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Eraser, PenTool, Upload, Check, RotateCcw } from 'lucide-react';

interface SignaturePadProps {
  signatureDataUrl?: string;
  onSignatureChange: (dataUrl: string) => void;
}

interface Point {
  x: number;
  y: number;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  signatureDataUrl,
  onSignatureChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [penColor, setPenColor] = useState<string>('#1e3a8a'); // Classic official dark blue ink
  const [strokeWidth, setStrokeWidth] = useState<number>(2.5);
  const pointsRef = useRef<Point[]>([]);

  // Setup canvas with high DPI support
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    // Set actual size in memory (scaled to account for extra pixel density)
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = penColor;
      ctx.lineWidth = strokeWidth;
    }
  }, [penColor, strokeWidth]);

  useEffect(() => {
    setupCanvas();

    const handleResize = () => {
      // If we already have a signatureDataUrl, we can restore it after resize
      setupCanvas();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setupCanvas]);

  // Redraw if signatureDataUrl is present and canvas is empty
  useEffect(() => {
    if (signatureDataUrl && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        ctx.clearRect(0, 0, rect.width, rect.height);
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setHasDrawn(true);
      };
      img.src = signatureDataUrl;
    }
  }, [signatureDataUrl]);

  const getCanvasCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const point = getCanvasCoordinates(e);
    if (!point) return;

    setIsDrawing(true);
    pointsRef.current = [point];

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.fillStyle = penColor;
      ctx.arc(point.x, point.y, strokeWidth / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    const point = getCanvasCoordinates(e);
    if (!point) return;

    pointsRef.current.push(point);
    const points = pointsRef.current;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || points.length < 2) return;

    ctx.strokeStyle = penColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Smooth curve using midpoints
    const p1 = points[points.length - 2];
    const p2 = points[points.length - 1];
    const midPoint = {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    };

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
    ctx.stroke();

    setHasDrawn(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    pointsRef.current = [];

    // Export signature as transparent PNG
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onSignatureChange(dataUrl);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    }
    setHasDrawn(false);
    onSignatureChange('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onSignatureChange(result);
        setHasDrawn(true);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <PenTool className="w-3.5 h-3.5 text-blue-600" />
          Цахим гарын үсэг (Зурах эсвэл оруулах)
        </label>
        <span className="text-[11px] text-slate-500">
          Хулгана эсвэл хуруугаар зурна уу
        </span>
      </div>

      <div className="relative border border-slate-300 rounded-lg overflow-hidden bg-white shadow-xs group transition-colors focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
        {/* Background signature guide line */}
        <div className="absolute inset-x-6 bottom-7 border-b border-dashed border-slate-200 pointer-events-none flex justify-between text-[10px] text-slate-300 select-none pb-0.5">
          <span>Гарын үсэг зурах хэсэг</span>
          <span>✕ Тэмдэглэгээ</span>
        </div>

        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{ touchAction: 'none' }}
          className="w-full h-32 cursor-crosshair block relative z-10"
        />

        {/* Status watermark when empty */}
        {!hasDrawn && !signatureDataUrl && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-300 text-xs italic">
            Энд дарж гарын үсгээ зурна уу
          </div>
        )}
      </div>

      {/* Signature Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
        {/* Ink Colors */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-[11px]">Бэх:</span>
          <button
            type="button"
            onClick={() => setPenColor('#1e3a8a')}
            title="Албаны хөх"
            className={`w-5 h-5 rounded-full bg-blue-900 transition-transform ${
              penColor === '#1e3a8a'
                ? 'ring-2 ring-blue-600 ring-offset-1 scale-110'
                : 'opacity-70 hover:opacity-100'
            }`}
          />
          <button
            type="button"
            onClick={() => setPenColor('#0f172a')}
            title="Сонгодог хар"
            className={`w-5 h-5 rounded-full bg-slate-900 transition-transform ${
              penColor === '#0f172a'
                ? 'ring-2 ring-blue-600 ring-offset-1 scale-110'
                : 'opacity-70 hover:opacity-100'
            }`}
          />
          <button
            type="button"
            onClick={() => setPenColor('#2563eb')}
            title="Тод цэнхэр"
            className={`w-5 h-5 rounded-full bg-blue-600 transition-transform ${
              penColor === '#2563eb'
                ? 'ring-2 ring-blue-600 ring-offset-1 scale-110'
                : 'opacity-70 hover:opacity-100'
            }`}
          />

          <span className="text-slate-300">|</span>

          {/* Stroke Width */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setStrokeWidth(1.8)}
              className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                strokeWidth === 1.8
                  ? 'bg-slate-200 text-slate-800'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Нарийн
            </button>
            <button
              type="button"
              onClick={() => setStrokeWidth(2.5)}
              className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                strokeWidth === 2.5
                  ? 'bg-slate-200 text-slate-800'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Дунд
            </button>
            <button
              type="button"
              onClick={() => setStrokeWidth(3.5)}
              className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                strokeWidth === 3.5
                  ? 'bg-slate-200 text-slate-800'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Өргөн
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Upload scanned signature */}
          <label className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer transition-colors text-[11px] border border-slate-200">
            <Upload className="w-3 h-3" />
            <span>Зураг оруулах</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Clear button */}
          <button
            type="button"
            onClick={clearCanvas}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors text-[11px] border border-rose-200"
          >
            <Eraser className="w-3 h-3" />
            <span>Цэвэрлэх</span>
          </button>
        </div>
      </div>
    </div>
  );
};
