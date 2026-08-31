import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { evaluate3DFunction } from '../utils/mathPlotEvaluator';
import { RotateCw, Maximize2, Layers, Eye, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';

interface ThreeDPlotViewerProps {
  equation: string;
  gridSize?: number;
  minRange?: number;
  maxRange?: number;
}

export const ThreeDPlotViewer: React.FC<ThreeDPlotViewerProps> = ({
  equation,
  gridSize = 48,
  minRange = -4,
  maxRange = 4,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [stats, setStats] = useState({ minZ: 0, maxZ: 0 });

  // References for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Orbit controls state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0.45, y: -0.6 });
  const zoomRef = useRef(14);

  // Initialize Three.js Scene once
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#030712'); // Slate 950
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(12, 10, 14);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight1.position.set(10, 20, 15);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x6366f1, 0.6); // Indigo accent light
    dirLight2.position.set(-10, -10, -10);
    scene.add(dirLight2);

    // Floor Grid Helper (Ground plane at y = -3)
    const gridHelper = new THREE.GridHelper(12, 12, 0x4f46e5, 0x1e293b);
    gridHelper.position.y = -3;
    scene.add(gridHelper);

    // Axes Helper (X = Red / Sigma, Y = Green / Height, Z = Blue / Omega)
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // Animation Render Loop
    const animate = () => {
      if (autoRotate && !isDraggingRef.current) {
        rotationRef.current.y += 0.006;
      }

      // Update camera spherical orbit position
      if (cameraRef.current) {
        const radius = zoomRef.current;
        const phi = Math.max(0.1, Math.min(Math.PI - 0.1, Math.PI / 2 - rotationRef.current.x));
        const theta = rotationRef.current.y;

        cameraRef.current.position.x = radius * Math.sin(phi) * Math.sin(theta);
        cameraRef.current.position.y = radius * Math.cos(phi);
        cameraRef.current.position.z = radius * Math.sin(phi) * Math.cos(theta);
        cameraRef.current.lookAt(0, 0, 0);
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      animFrameIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    // ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0 && rendererRef.current && cameraRef.current) {
          cameraRef.current.aspect = newW / newH;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(newW, newH);
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, []);

  // Update Surface Geometry whenever equation or range changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove existing mesh if any
    if (meshRef.current) {
      scene.remove(meshRef.current);
      meshRef.current.geometry.dispose();
      if (Array.isArray(meshRef.current.material)) {
        meshRef.current.material.forEach((m) => m.dispose());
      } else {
        meshRef.current.material.dispose();
      }
      meshRef.current = null;
    }

    // Evaluate 3D surface
    const data = evaluate3DFunction(equation, minRange, maxRange, minRange, maxRange, gridSize);
    setStats({ minZ: data.minZ, maxZ: data.maxZ });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(data.vertices, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(data.colors, 3));
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      wireframe: wireframe,
      roughness: 0.35,
      metalness: 0.2,
      flatShading: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    meshRef.current = mesh;
  }, [equation, gridSize, minRange, maxRange, wireframe]);

  // Mouse & Touch Orbit Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    rotationRef.current.y -= deltaX * 0.008;
    rotationRef.current.x += deltaY * 0.008;

    // Clamp vertical tilt
    rotationRef.current.x = Math.max(-1.3, Math.min(1.3, rotationRef.current.x));

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    zoomRef.current = Math.max(5, Math.min(30, zoomRef.current + e.deltaY * 0.015));
  };

  const handleResetCamera = () => {
    rotationRef.current = { x: 0.45, y: -0.6 };
    zoomRef.current = 14;
  };

  const handleZoom = (delta: number) => {
    zoomRef.current = Math.max(5, Math.min(30, zoomRef.current + delta));
  };

  return (
    <div className="relative w-full h-full min-h-[380px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 select-none">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
      />

      {/* Floating 3D Controls Bar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
        {/* Surface Altitude & Legend */}
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] font-mono pointer-events-auto shadow-lg">
          <span className="text-slate-400">Z min: <strong className="text-cyan-400">{stats.minZ.toFixed(2)}</strong></span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Z max: <strong className="text-amber-400">{stats.maxZ.toFixed(2)}</strong></span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 hidden sm:inline">Plano <strong className="text-indigo-400">σ + jω</strong></span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 pointer-events-auto shadow-lg">
          {/* Wireframe toggle */}
          <button
            onClick={() => setWireframe(!wireframe)}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              wireframe ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Alternar Malha Wireframe"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          {/* Auto Rotate toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              autoRotate ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Rotação Automática 360°"
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin-slow' : ''}`} />
          </button>

          {/* Zoom in / out */}
          <button
            onClick={() => handleZoom(-2)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs transition-colors cursor-pointer"
            title="Aproximar Zoom"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => handleZoom(2)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs transition-colors cursor-pointer"
            title="Afastar Zoom"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          {/* Reset camera */}
          <button
            onClick={handleResetCamera}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs transition-colors cursor-pointer"
            title="Restaurar Ângulo de Visão Padrão"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Axis color key helper */}
      <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center gap-2 pointer-events-none">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> X (Real σ)</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Y (Altura |H|)</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Z (Imag jω)</span>
      </div>

      {/* Interaction tip */}
      <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 text-[10px] text-slate-400 font-medium pointer-events-none hidden sm:block">
        Arraste com o mouse/touch para girar 360° • Scroll para zoom
      </div>
    </div>
  );
};
