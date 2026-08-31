import React, { useRef, useState, useEffect, useMemo } from 'react';
import { evaluate2DFunction, Point2D } from '../utils/mathPlotEvaluator';
import { ZoomIn, ZoomOut, RefreshCw, Crosshair, Sparkles, TrendingUp } from 'lucide-react';

interface TwoDPlotViewerProps {
  equation: string;
  minX?: number;
  maxX?: number;
}

export const TwoDPlotViewer: React.FC<TwoDPlotViewerProps> = ({
  equation,
  minX = -10,
  maxX = 10,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [rangeX, setRangeX] = useState<[number, number]>([minX, maxX]);
  const [hoverPoint, setHoverPoint] = useState<{ x: number; y: number; pixelX: number; pixelY: number } | null>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 380 });

  // Update dimensions with ResizeObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setDimensions({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          });
        }
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Compute 2D points from equation
  const plotData = useMemo(() => {
    return evaluate2DFunction(equation, rangeX[0], rangeX[1], 500);
  }, [equation, rangeX]);

  const { points, minY, maxY, error } = plotData;

  // Margin and scales
  const padding = { top: 30, right: 30, bottom: 40, left: 55 };
  const plotWidth = Math.max(100, dimensions.width - padding.left - padding.right);
  const plotHeight = Math.max(100, dimensions.height - padding.top - padding.bottom);

  // Y-axis bounds with padding
  const ySpan = maxY - minY || 1;
  const effectiveMinY = minY - ySpan * 0.12;
  const effectiveMaxY = maxY + ySpan * 0.12;
  const effectiveYSpan = effectiveMaxY - effectiveMinY || 1;

  const scaleX = (x: number) => padding.left + ((x - rangeX[0]) / (rangeX[1] - rangeX[0])) * plotWidth;
  const scaleY = (y: number) => padding.top + (1 - (y - effectiveMinY) / effectiveYSpan) * plotHeight;

  // Inverse scale for mouse hover
  const invertX = (pixelX: number) => {
    const ratio = (pixelX - padding.left) / plotWidth;
    return rangeX[0] + ratio * (rangeX[1] - rangeX[0]);
  };

  // Generate SVG Path
  const svgPath = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((acc, pt, index) => {
      const px = scaleX(pt.x);
      const py = scaleY(pt.y);
      if (index === 0) return `M ${px.toFixed(1)} ${py.toFixed(1)}`;
      return `${acc} L ${px.toFixed(1)} ${py.toFixed(1)}`;
    }, '');
  }, [points, rangeX, effectiveMinY, effectiveYSpan, plotWidth, plotHeight]);

  // Compute Peak Point
  const peakPoint = useMemo(() => {
    if (points.length === 0) return null;
    let maxPt = points[0];
    for (const pt of points) {
      if (Math.abs(pt.y) > Math.abs(maxPt.y)) {
        maxPt = pt;
      }
    }
    return maxPt;
  }, [points]);

  // Grid tick marks
  const xTicks = useMemo(() => {
    const count = 9;
    const ticks: number[] = [];
    const step = (rangeX[1] - rangeX[0]) / (count - 1);
    for (let i = 0; i < count; i++) {
      ticks.push(rangeX[0] + i * step);
    }
    return ticks;
  }, [rangeX]);

  const yTicks = useMemo(() => {
    const count = 7;
    const ticks: number[] = [];
    const step = (effectiveMaxY - effectiveMinY) / (count - 1);
    for (let i = 0; i < count; i++) {
      ticks.push(effectiveMinY + i * step);
    }
    return ticks;
  }, [effectiveMinY, effectiveMaxY]);

  // Zoom handlers
  const handleZoom = (factor: number) => {
    const mid = (rangeX[0] + rangeX[1]) / 2;
    const span = (rangeX[1] - rangeX[0]) * factor;
    setRangeX([mid - span / 2, mid + span / 2]);
  };

  const handleResetZoom = () => {
    setRangeX([minX, maxX]);
  };

  // Pointer move for crosshair tooltip
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pixelX = e.clientX - rect.left;
    if (pixelX < padding.left || pixelX > padding.left + plotWidth) {
      setHoverPoint(null);
      return;
    }

    const currentX = invertX(pixelX);
    // Find closest point
    let closest = points[0];
    let minDiff = Infinity;
    for (const pt of points) {
      const diff = Math.abs(pt.x - currentX);
      if (diff < minDiff) {
        minDiff = diff;
        closest = pt;
      }
    }

    if (closest) {
      setHoverPoint({
        x: closest.x,
        y: closest.y,
        pixelX: scaleX(closest.x),
        pixelY: scaleY(closest.y),
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[380px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex flex-col select-none"
    >
      {/* Top Floating Controls Bar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10 pointer-events-none">
        {/* Peak & Range Stats */}
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] font-mono pointer-events-auto shadow-lg">
          <span className="text-slate-400">Domínio: <strong className="text-indigo-400">t ∈ [{rangeX[0].toFixed(1)}, {rangeX[1].toFixed(1)}]</strong></span>
          <span className="text-slate-600">|</span>
          {peakPoint && (
            <span className="text-slate-400">
              Pico: <strong className="text-emerald-400">y({peakPoint.x.toFixed(2)}) = {peakPoint.y.toFixed(2)}</strong>
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 pointer-events-auto shadow-lg">
          <button
            onClick={() => handleZoom(0.7)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs transition-colors cursor-pointer"
            title="Aproximar Zoom (X)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom(1.4)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs transition-colors cursor-pointer"
            title="Afastar Zoom (X)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs transition-colors cursor-pointer"
            title="Restaurar Escala Padrão"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Interactive Canvas */}
      <svg
        className="w-full h-full cursor-crosshair"
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHoverPoint(null)}
      >
        <defs>
          <linearGradient id="plot2DGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>

          <linearGradient id="plotAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {xTicks.map((val, idx) => {
          const xPos = scaleX(val);
          return (
            <g key={`x-tick-${idx}`}>
              <line
                x1={xPos}
                y1={padding.top}
                x2={xPos}
                y2={padding.top + plotHeight}
                stroke="#1e293b"
                strokeWidth="1"
                strokeDasharray={val === 0 ? 'none' : '3,3'}
              />
              <text
                x={xPos}
                y={dimensions.height - 12}
                textAnchor="middle"
                fontSize="10"
                fontFamily="monospace"
                fill="#64748b"
              >
                {val.toFixed(1)}
              </text>
            </g>
          );
        })}

        {yTicks.map((val, idx) => {
          const yPos = scaleY(val);
          return (
            <g key={`y-tick-${idx}`}>
              <line
                x1={padding.left}
                y1={yPos}
                x2={padding.left + plotWidth}
                y2={yPos}
                stroke="#1e293b"
                strokeWidth="1"
                strokeDasharray={Math.abs(val) < 0.01 ? 'none' : '3,3'}
              />
              <text
                x={padding.left - 8}
                y={yPos + 3}
                textAnchor="end"
                fontSize="10"
                fontFamily="monospace"
                fill="#64748b"
              >
                {val.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* Zero Axis Highlights */}
        {effectiveMinY <= 0 && effectiveMaxY >= 0 && (
          <line
            x1={padding.left}
            y1={scaleY(0)}
            x2={padding.left + plotWidth}
            y2={scaleY(0)}
            stroke="#475569"
            strokeWidth="1.5"
          />
        )}

        {rangeX[0] <= 0 && rangeX[1] >= 0 && (
          <line
            x1={scaleX(0)}
            y1={padding.top}
            x2={scaleX(0)}
            y2={padding.top + plotHeight}
            stroke="#475569"
            strokeWidth="1.5"
          />
        )}

        {/* Curve Line */}
        {svgPath && (
          <path
            d={svgPath}
            fill="none"
            stroke="url(#plot2DGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Hover Crosshair & Tooltip */}
        {hoverPoint && (
          <g>
            <line
              x1={hoverPoint.pixelX}
              y1={padding.top}
              x2={hoverPoint.pixelX}
              y2={padding.top + plotHeight}
              stroke="#818cf8"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
            <line
              x1={padding.left}
              y1={hoverPoint.pixelY}
              x2={padding.left + plotWidth}
              y2={hoverPoint.pixelY}
              stroke="#818cf8"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
            <circle
              cx={hoverPoint.pixelX}
              cy={hoverPoint.pixelY}
              r="4.5"
              fill="#38bdf8"
              stroke="#ffffff"
              strokeWidth="2"
            />
          </g>
        )}
      </svg>

      {/* Floating Hover Coordinates Box */}
      {hoverPoint && (
        <div
          className="absolute pointer-events-none bg-slate-900/95 border border-indigo-500/60 rounded-xl px-2.5 py-1 text-[11px] font-mono text-slate-200 shadow-xl backdrop-blur-md z-20 transition-transform"
          style={{
            left: Math.min(dimensions.width - 140, Math.max(10, hoverPoint.pixelX + 12)),
            top: Math.max(45, hoverPoint.pixelY - 35),
          }}
        >
          <span className="text-cyan-400 font-bold">t = {hoverPoint.x.toFixed(3)}</span>
          <span className="text-slate-500 mx-1.5">|</span>
          <span className="text-emerald-400 font-bold">y = {hoverPoint.y.toFixed(3)}</span>
        </div>
      )}

      {/* Axis Labels */}
      <div className="absolute bottom-1 right-4 text-[10px] font-mono font-bold text-slate-500 pointer-events-none">
        Tempo t (s) / Freq ω (rad/s) →
      </div>
      <div className="absolute top-2 left-4 text-[10px] font-mono font-bold text-slate-500 pointer-events-none">
        ↑ Amplitude y(t)
      </div>
    </div>
  );
};
