// Robust and Safe Mathematical Expression Evaluator for 2D and 3D Plots in OmniSinais

export interface Point2D {
  x: number;
  y: number;
}

export interface Grid3DData {
  xRange: [number, number];
  yRange: [number, number];
  gridSize: number;
  vertices: Float32Array;
  colors: Float32Array;
  minZ: number;
  maxZ: number;
}

// Convert user-friendly math string into executable JS expression
export function sanitizeMathExpression(expr: string): string {
  let clean = expr.trim();

  // Strip LaTeX wrappers if present
  clean = clean.replace(/\\left|\\right/g, '');
  clean = clean.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)');
  clean = clean.replace(/\\cdot/g, '*');
  clean = clean.replace(/\\times/g, '*');
  clean = clean.replace(/\\pi/g, 'Math.PI');
  clean = clean.replace(/\\omega/g, 'w');
  clean = clean.replace(/\\sigma/g, 's');
  clean = clean.replace(/\\cos/g, 'cos');
  clean = clean.replace(/\\sin/g, 'sin');
  clean = clean.replace(/\\tan/g, 'tan');
  clean = clean.replace(/\\exp/g, 'exp');
  clean = clean.replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)');
  clean = clean.replace(/\\mathrm\{([^}]+)\}/g, '$1');

  // Strip equation prefixes like "y(t) =", "z =", "f(x,y) =", "H(s) ="
  clean = clean.replace(/^[a-zA-Z](\([a-zA-Z0-9,\s]*\))?\s*=\s*/, '');
  clean = clean.replace(/^[zZ]\s*=\s*/, '');

  // Replace common math functions with standard equivalents
  // u(t) unit step -> (t >= 0 ? 1 : 0)
  clean = clean.replace(/\bu\(([a-zA-Z0-9_+\-*/\s]+)\)/g, '(($1) >= 0 ? 1 : 0)');
  // sinc(x) -> (x === 0 ? 1 : Math.sin(Math.PI*(x))/(Math.PI*(x)))
  clean = clean.replace(/\bsinc\(([a-zA-Z0-9_+\-*/\s]+)\)/g, 'sincHelper($1)');

  // Power operator ^ to Math.pow or **
  // Replace x^2 with (x)**2
  clean = clean.replace(/([a-zA-Z0-9_.)]+)\^([a-zA-Z0-9_.]+)/g, 'Math.pow($1, $2)');

  // Implicit multiplication: 2t -> 2*t, 5cos(t) -> 5*cos(t), ) ( -> ) * (
  clean = clean.replace(/(\d+)([a-zA-Z(])/g, '$1*$2');
  clean = clean.replace(/(\))([a-zA-Z0-9(])/g, '$1*$2');

  return clean;
}

// Evaluate 2D function y = f(t) or y = f(x)
export function evaluate2DFunction(
  rawExpr: string,
  minX = -10,
  maxX = 10,
  samples = 400
): { points: Point2D[]; minY: number; maxY: number; error: string | null } {
  try {
    const expr = sanitizeMathExpression(rawExpr);

    // Build safe evaluator function
    const fn = new Function(
      't',
      'x',
      `
      const sin = Math.sin;
      const cos = Math.cos;
      const tan = Math.tan;
      const exp = Math.exp;
      const sqrt = Math.sqrt;
      const abs = Math.abs;
      const log = Math.log;
      const log10 = Math.log10;
      const PI = Math.PI;
      const sincHelper = (v) => (Math.abs(v) < 1e-6 ? 1 : Math.sin(Math.PI * v) / (Math.PI * v));
      const u = (v) => (v >= 0 ? 1 : 0);

      try {
        const val = ${expr};
        if (typeof val !== 'number' || isNaN(val) || !isFinite(val)) {
          return 0;
        }
        return val;
      } catch (e) {
        return 0;
      }
    `
    );

    const points: Point2D[] = [];
    let minY = Infinity;
    let maxY = -Infinity;
    const step = (maxX - minX) / (samples - 1);

    for (let i = 0; i < samples; i++) {
      const currentX = minX + i * step;
      let yVal = fn(currentX, currentX);

      // Clamp extreme values for visual stability
      if (yVal > 100) yVal = 100;
      if (yVal < -100) yVal = -100;

      points.push({ x: currentX, y: yVal });
      if (yVal < minY) minY = yVal;
      if (yVal > maxY) maxY = yVal;
    }

    if (minY === Infinity || maxY === -Infinity) {
      minY = -1;
      maxY = 1;
    }

    return { points, minY, maxY, error: null };
  } catch (err: any) {
    return {
      points: [],
      minY: -1,
      maxY: 1,
      error: err.message || 'Equação não pôde ser avaliada no plano 2D.',
    };
  }
}

// Evaluate 3D function z = f(x, y) or |H(s)| where s = sigma + j*omega
export function evaluate3DFunction(
  rawExpr: string,
  minX = -4,
  maxX = 4,
  minY = -4,
  maxY = 4,
  gridSize = 48
): Grid3DData {
  const expr = sanitizeMathExpression(rawExpr);

  // Evaluator for 3D function
  let fn: (x: number, y: number, s: number, w: number) => number;
  try {
    fn = new Function(
      'x',
      'y',
      's',
      'w',
      `
      const sin = Math.sin;
      const cos = Math.cos;
      const tan = Math.tan;
      const exp = Math.exp;
      const sqrt = Math.sqrt;
      const abs = Math.abs;
      const PI = Math.PI;
      const sincHelper = (v) => (Math.abs(v) < 1e-6 ? 1 : Math.sin(Math.PI * v) / (Math.PI * v));

      try {
        const val = ${expr};
        if (typeof val !== 'number' || isNaN(val) || !isFinite(val)) {
          return 0;
        }
        return val;
      } catch (e) {
        return 0;
      }
    `
    ) as any;
  } catch {
    // Fallback: simple saddle surface
    fn = (x, y) => Math.sin(Math.sqrt(x * x + y * y) + 0.001) / (Math.sqrt(x * x + y * y) + 0.001);
  }

  // Pre-calculate heights
  const heights: number[][] = [];
  let minZ = Infinity;
  let maxZ = -Infinity;

  const stepX = (maxX - minX) / (gridSize - 1);
  const stepY = (maxY - minY) / (gridSize - 1);

  for (let i = 0; i < gridSize; i++) {
    heights[i] = [];
    const currentX = minX + i * stepX;
    for (let j = 0; j < gridSize; j++) {
      const currentY = minY + j * stepY;
      let z = fn(currentX, currentY, currentX, currentY);

      // Clamp peak for visual elegance
      if (z > 6) z = 6;
      if (z < -6) z = -6;

      heights[i][j] = z;
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;
    }
  }

  if (minZ === Infinity || maxZ === -Infinity || minZ === maxZ) {
    minZ = -1;
    maxZ = 1;
  }

  // Build triangle vertices and vertex colors for WebGL BufferGeometry
  // (gridSize - 1) * (gridSize - 1) quads = 2 triangles per quad = 6 vertices per quad
  const quadCount = (gridSize - 1) * (gridSize - 1);
  const vertexCount = quadCount * 6;
  const vertices = new Float32Array(vertexCount * 3);
  const colors = new Float32Array(vertexCount * 3);

  let vIdx = 0;
  let cIdx = 0;

  const zSpan = maxZ - minZ || 1;

  // Color map helper: Turbo / Cyberpunk gradient
  function getColorForZ(normZ: number): [number, number, number] {
    // normZ from 0 to 1
    const t = Math.max(0, Math.min(1, normZ));
    // Indigo -> Cyan -> Emerald -> Amber -> Rose
    let r = 0, g = 0, b = 0;
    if (t < 0.25) {
      const f = t / 0.25;
      r = 0.2 + 0.1 * f;
      g = 0.3 + 0.5 * f;
      b = 0.8 + 0.2 * f;
    } else if (t < 0.5) {
      const f = (t - 0.25) / 0.25;
      r = 0.1 + 0.1 * f;
      g = 0.8 + 0.15 * f;
      b = 1.0 - 0.6 * f;
    } else if (t < 0.75) {
      const f = (t - 0.5) / 0.25;
      r = 0.2 + 0.7 * f;
      g = 0.95 - 0.1 * f;
      b = 0.4 - 0.3 * f;
    } else {
      const f = (t - 0.75) / 0.25;
      r = 0.9 + 0.1 * f;
      g = 0.85 - 0.5 * f;
      b = 0.1 + 0.2 * f;
    }
    return [r, g, b];
  }

  function addVertex(x: number, y: number, z: number) {
    vertices[vIdx++] = x;
    vertices[vIdx++] = z; // Three.js Y is UP
    vertices[vIdx++] = y; // Three.js Z is Depth

    const normZ = (z - minZ) / zSpan;
    const [r, g, b] = getColorForZ(normZ);
    colors[cIdx++] = r;
    colors[cIdx++] = g;
    colors[cIdx++] = b;
  }

  for (let i = 0; i < gridSize - 1; i++) {
    const x0 = minX + i * stepX;
    const x1 = minX + (i + 1) * stepX;

    for (let j = 0; j < gridSize - 1; j++) {
      const y0 = minY + j * stepY;
      const y1 = minY + (j + 1) * stepY;

      const z00 = heights[i][j];
      const z10 = heights[i + 1][j];
      const z01 = heights[i][j + 1];
      const z11 = heights[i + 1][j + 1];

      // Triangle 1: (x0, y0), (x1, y0), (x0, y1)
      addVertex(x0, y0, z00);
      addVertex(x1, y0, z10);
      addVertex(x0, y1, z01);

      // Triangle 2: (x1, y0), (x1, y1), (x0, y1)
      addVertex(x1, y0, z10);
      addVertex(x1, y1, z11);
      addVertex(x0, y1, z01);
    }
  }

  return {
    xRange: [minX, maxX],
    yRange: [minY, maxY],
    gridSize,
    vertices,
    colors,
    minZ,
    maxZ,
  };
}
