/**
 * 칼선 생성 알고리즘
 *
 * 알파 채널 임계값(alpha > 0) 기반으로 투명/불투명 경계를 추출하고,
 * 모든 요소를 통합(Union)하여 하나의 외곽선을 생성합니다.
 * Chaikin 스무딩 + Round Join으로 부드러운 벡터 path를 반환합니다.
 */

import { mmToPx } from "./unit-conversion";

/**
 * 2D 점
 */
interface Point {
  x: number;
  y: number;
}

/**
 * 빠른 거리 변환 (Chamfer Distance Transform)
 * O(width * height) - 2패스로 완료
 *
 * @param mask 불투명 픽셀 마스크 (1 = 불투명, 0 = 투명)
 * @param width 이미지 너비
 * @param height 이미지 높이
 * @returns 각 픽셀에서 가장 가까운 불투명 픽셀까지의 거리
 */
function fastDistanceTransform(mask: Uint8Array, width: number, height: number): Float32Array {
  const INF = width + height;
  const dist = new Float32Array(width * height);

  // 초기화: 불투명 픽셀은 0, 투명 픽셀은 무한대
  for (let i = 0; i < width * height; i++) {
    dist[i] = mask[i] ? 0 : INF;
  }

  // Forward pass (왼쪽 위 → 오른쪽 아래)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      if (x > 0) dist[i] = Math.min(dist[i], dist[i - 1] + 1);
      if (y > 0) dist[i] = Math.min(dist[i], dist[(y - 1) * width + x] + 1);
      // 대각선
      if (x > 0 && y > 0) dist[i] = Math.min(dist[i], dist[(y - 1) * width + x - 1] + 1.4);
      if (x < width - 1 && y > 0) dist[i] = Math.min(dist[i], dist[(y - 1) * width + x + 1] + 1.4);
    }
  }

  // Backward pass (오른쪽 아래 → 왼쪽 위)
  for (let y = height - 1; y >= 0; y--) {
    for (let x = width - 1; x >= 0; x--) {
      const i = y * width + x;
      if (x < width - 1) dist[i] = Math.min(dist[i], dist[i + 1] + 1);
      if (y < height - 1) dist[i] = Math.min(dist[i], dist[(y + 1) * width + x] + 1);
      // 대각선
      if (x < width - 1 && y < height - 1) dist[i] = Math.min(dist[i], dist[(y + 1) * width + x + 1] + 1.4);
      if (x > 0 && y < height - 1) dist[i] = Math.min(dist[i], dist[(y + 1) * width + x - 1] + 1.4);
    }
  }

  return dist;
}

/**
 * 모든 분리된 영역의 외곽선을 추출하고 연결합니다
 *
 * @param imageData 캔버스 이미지 데이터
 * @param dilateRadius 각 영역의 확장 반경 (픽셀)
 * @returns 연결된 외곽선 점 배열
 */
export function extractOuterContour(imageData: ImageData, dilateRadius: number = 15): Point[] {
  const { width, height, data } = imageData;

  // 1. 불투명 픽셀 마스크 생성 (1D 배열로 최적화)
  const mask = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    mask[i] = data[i * 4 + 3] > 0 ? 1 : 0;
  }

  // 2. 거리 변환 (Distance Transform) - O(width * height)
  // 각 픽셀에서 가장 가까운 불투명 픽셀까지의 거리 계산
  const dist = fastDistanceTransform(mask, width, height);

  // 3. 확장된 마스크 생성 (거리 <= dilateRadius인 픽셀)
  const dilated: boolean[][] = [];
  for (let y = 0; y < height; y++) {
    dilated[y] = [];
    for (let x = 0; x < width; x++) {
      dilated[y][x] = dist[y * width + x] <= dilateRadius;
    }
  }

  // 3. 연결 영역(Connected Components) 찾기
  const visited: boolean[][] = [];
  for (let y = 0; y < height; y++) {
    visited[y] = new Array(width).fill(false);
  }

  const regions: Point[][] = [];

  const floodFill = (startX: number, startY: number): Point[] => {
    const region: Point[] = [];
    const stack: [number, number][] = [[startX, startY]];

    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      if (visited[y][x] || !dilated[y][x]) continue;

      visited[y][x] = true;

      // 경계 픽셀인지 확인
      const isBorder = x === 0 || x === width - 1 || y === 0 || y === height - 1 ||
                       !dilated[y][x - 1] || !dilated[y][x + 1] ||
                       !dilated[y - 1]?.[x] || !dilated[y + 1]?.[x];
      if (isBorder) {
        region.push({ x: x + 0.5, y: y + 0.5 });
      }

      // 4방향 탐색
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }

    return region;
  };

  // 모든 연결 영역 찾기
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (dilated[y][x] && !visited[y][x]) {
        const region = floodFill(x, y);
        if (region.length > 10) {
          regions.push(region);
        }
      }
    }
  }

  console.log(`칼선: ${regions.length}개 영역 발견`);

  if (regions.length === 0) {
    return [];
  }

  // 4. 각 영역의 외곽선을 Moore Tracing으로 정렬
  const orderedRegions: Point[][] = [];
  for (const region of regions) {
    const ordered = orderBorderPoints(region, width, height, dilated);
    if (ordered.length > 10) {
      orderedRegions.push(ordered);
    }
  }

  if (orderedRegions.length === 0) {
    return [];
  }

  if (orderedRegions.length === 1) {
    console.log(`칼선: 단일 영역 ${orderedRegions[0].length}개 점`);
    return orderedRegions[0];
  }

  // 5. 여러 영역을 가장 가까운 점으로 연결
  const connected = connectRegions(orderedRegions);
  console.log(`칼선: ${orderedRegions.length}개 영역 연결 → ${connected.length}개 점`);

  return connected;
}

/**
 * 경계점들을 순서대로 정렬 (Moore Neighborhood Tracing)
 */
function orderBorderPoints(points: Point[], width: number, height: number, mask: boolean[][]): Point[] {
  if (points.length < 3) return points;

  // 시작점: 가장 위쪽, 왼쪽
  let start = points[0];
  for (const p of points) {
    if (p.y < start.y || (p.y === start.y && p.x < start.x)) {
      start = p;
    }
  }

  const isOpaque = (x: number, y: number): boolean => {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    if (ix < 0 || ix >= width || iy < 0 || iy >= height) return false;
    return mask[iy]?.[ix] ?? false;
  };

  // Moore Neighborhood Tracing
  const dx = [1, 1, 0, -1, -1, -1, 0, 1];
  const dy = [0, 1, 1, 1, 0, -1, -1, -1];

  const ordered: Point[] = [];
  let x = Math.floor(start.x);
  let y = Math.floor(start.y);
  const startX = x;
  const startY = y;
  let dir = 7;

  const maxIter = width * height;
  let iter = 0;
  const visited = new Set<string>();

  do {
    const key = `${x},${y}`;

    if (!visited.has(key) && isOpaque(x, y)) {
      // 경계인지 확인
      const isBorder = !isOpaque(x - 1, y) || !isOpaque(x + 1, y) ||
                       !isOpaque(x, y - 1) || !isOpaque(x, y + 1);
      if (isBorder) {
        ordered.push({ x: x + 0.5, y: y + 0.5 });
      }
    }
    visited.add(key);

    const searchStart = (dir + 5) % 8;
    let found = false;

    for (let i = 0; i < 8; i++) {
      const checkDir = (searchStart + i) % 8;
      const nx = x + dx[checkDir];
      const ny = y + dy[checkDir];

      if (isOpaque(nx, ny)) {
        x = nx;
        y = ny;
        dir = checkDir;
        found = true;
        break;
      }
    }

    if (!found) break;
    iter++;
  } while ((x !== startX || y !== startY) && iter < maxIter);

  return ordered.length > 10 ? ordered : points;
}

/**
 * 여러 영역을 가장 가까운 점으로 연결
 */
function connectRegions(regions: Point[][]): Point[] {
  if (regions.length === 0) return [];
  if (regions.length === 1) return regions[0];

  // 가장 큰 영역부터 시작
  regions.sort((a, b) => b.length - a.length);

  const result = [...regions[0]];
  const used = new Set<number>([0]);

  while (used.size < regions.length) {
    let bestDist = Infinity;
    let bestRegionIdx = -1;
    let bestResultIdx = -1;
    let bestRegionPointIdx = -1;

    // 연결되지 않은 영역 중 가장 가까운 점 찾기
    for (let ri = 0; ri < regions.length; ri++) {
      if (used.has(ri)) continue;

      const region = regions[ri];
      for (let rpi = 0; rpi < region.length; rpi++) {
        const rp = region[rpi];
        for (let resi = 0; resi < result.length; resi++) {
          const resp = result[resi];
          const dist = (rp.x - resp.x) ** 2 + (rp.y - resp.y) ** 2;
          if (dist < bestDist) {
            bestDist = dist;
            bestRegionIdx = ri;
            bestResultIdx = resi;
            bestRegionPointIdx = rpi;
          }
        }
      }
    }

    if (bestRegionIdx === -1) break;

    // 영역을 result에 삽입 (연결점 기준으로 재정렬)
    const region = regions[bestRegionIdx];
    const reorderedRegion = [
      ...region.slice(bestRegionPointIdx),
      ...region.slice(0, bestRegionPointIdx),
    ];

    // 연결점에서 영역 삽입 (왕복)
    const connectionPoint = result[bestResultIdx];
    const insertRegion = [
      connectionPoint, // 연결점
      ...reorderedRegion, // 새 영역
      reorderedRegion[0], // 돌아오기
      connectionPoint, // 원래 위치로
    ];

    result.splice(bestResultIdx + 1, 0, ...insertRegion);
    used.add(bestRegionIdx);
  }

  return result;
}

/**
 * Douglas-Peucker 알고리즘으로 점 개수 줄이기
 */
export function simplifyContour(points: Point[], epsilon: number = 2): Point[] {
  if (points.length < 3) return points;

  const sqDist = (p1: Point, p2: Point): number =>
    (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2;

  const perpDist = (p: Point, lineStart: Point, lineEnd: Point): number => {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    const lenSq = dx * dx + dy * dy;

    if (lenSq === 0) return Math.sqrt(sqDist(p, lineStart));

    const t = Math.max(0, Math.min(1,
      ((p.x - lineStart.x) * dx + (p.y - lineStart.y) * dy) / lenSq
    ));

    return Math.sqrt(sqDist(p, {
      x: lineStart.x + t * dx,
      y: lineStart.y + t * dy
    }));
  };

  const rdp = (start: number, end: number): number[] => {
    let maxDist = 0;
    let maxIdx = start;

    for (let i = start + 1; i < end; i++) {
      const d = perpDist(points[i], points[start], points[end]);
      if (d > maxDist) {
        maxDist = d;
        maxIdx = i;
      }
    }

    if (maxDist > epsilon) {
      const left = rdp(start, maxIdx);
      const right = rdp(maxIdx, end);
      return [...left.slice(0, -1), ...right];
    }

    return [start, end];
  };

  const indices = rdp(0, points.length - 1);
  return indices.map(i => points[i]);
}

/**
 * Chaikin's Corner Cutting 알고리즘
 * 뾰족한 코너를 부드럽게 깎아냄
 */
export function chaikinSmooth(points: Point[], iterations: number = 2): Point[] {
  if (points.length < 3) return points;

  let result = [...points];

  for (let iter = 0; iter < iterations; iter++) {
    const smoothed: Point[] = [];
    const n = result.length;

    for (let i = 0; i < n; i++) {
      const p0 = result[i];
      const p1 = result[(i + 1) % n];

      // 1/4 지점과 3/4 지점에 새 점 생성
      smoothed.push({
        x: p0.x * 0.75 + p1.x * 0.25,
        y: p0.y * 0.75 + p1.y * 0.25,
      });
      smoothed.push({
        x: p0.x * 0.25 + p1.x * 0.75,
        y: p0.y * 0.25 + p1.y * 0.75,
      });
    }

    result = smoothed;
  }

  return result;
}

/**
 * 외곽선에 오프셋 적용 (Round Join 방식)
 * 뾰족한 코너에서 호(arc)로 부드럽게 연결
 */
export function offsetContourRound(
  points: Point[],
  offsetMm: number,
  dpi: number = 72
): Point[] {
  if (points.length < 3 || offsetMm === 0) return points;

  const offsetPx = mmToPx(offsetMm, dpi);
  const result: Point[] = [];
  const n = points.length;

  for (let i = 0; i < n; i++) {
    const prev = points[(i - 1 + n) % n];
    const curr = points[i];
    const next = points[(i + 1) % n];

    // 두 선분의 방향 벡터
    const d1x = curr.x - prev.x;
    const d1y = curr.y - prev.y;
    const d2x = next.x - curr.x;
    const d2y = next.y - curr.y;

    const len1 = Math.sqrt(d1x * d1x + d1y * d1y);
    const len2 = Math.sqrt(d2x * d2x + d2y * d2y);

    if (len1 < 0.001 || len2 < 0.001) {
      result.push(curr);
      continue;
    }

    // 법선 벡터 (외부 방향)
    const n1x = d1y / len1;
    const n1y = -d1x / len1;
    const n2x = d2y / len2;
    const n2y = -d2x / len2;

    // 두 법선의 각도 차이
    const dot = n1x * n2x + n1y * n2y;
    const cross = n1x * n2y - n1y * n2x;

    // 거의 평행한 경우 (부드러운 곡선)
    if (dot > 0.95) {
      const nx = (n1x + n2x) / 2;
      const ny = (n1y + n2y) / 2;
      const nLen = Math.sqrt(nx * nx + ny * ny);
      result.push({
        x: curr.x + (nx / nLen) * offsetPx,
        y: curr.y + (ny / nLen) * offsetPx,
      });
    }
    // 볼록한 코너 (외부로 꺾임) - Round Join으로 호 생성
    else if (cross > 0) {
      // 시작 법선에서 끝 법선까지 호로 연결
      const startAngle = Math.atan2(n1y, n1x);
      let endAngle = Math.atan2(n2y, n2x);

      // 각도 차이 계산 (양수 방향으로)
      let angleDiff = endAngle - startAngle;
      if (angleDiff < 0) angleDiff += Math.PI * 2;

      // 호의 분할 수 (각도에 비례)
      const segments = Math.max(2, Math.ceil(angleDiff / (Math.PI / 6)));

      for (let j = 0; j <= segments; j++) {
        const t = j / segments;
        const angle = startAngle + angleDiff * t;
        result.push({
          x: curr.x + Math.cos(angle) * offsetPx,
          y: curr.y + Math.sin(angle) * offsetPx,
        });
      }
    }
    // 오목한 코너 (내부로 꺾임) - 단순 평균 법선
    else {
      let nx = n1x + n2x;
      let ny = n1y + n2y;
      const nLen = Math.sqrt(nx * nx + ny * ny);

      if (nLen < 0.001) {
        nx = n1x;
        ny = n1y;
      } else {
        nx /= nLen;
        ny /= nLen;
      }

      // Miter limit (과도한 돌출 방지)
      const miterLen = 1 / Math.max(0.5, (1 + dot) / 2);
      const scale = Math.min(miterLen, 1.5);

      result.push({
        x: curr.x + nx * offsetPx * scale,
        y: curr.y + ny * offsetPx * scale,
      });
    }
  }

  return result;
}

/**
 * Catmull-Rom 스플라인으로 부드러운 보간
 */
export function catmullRomSmooth(points: Point[], segments: number = 4): Point[] {
  if (points.length < 4) return points;

  const result: Point[] = [];
  const n = points.length;

  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];

    for (let t = 0; t < segments; t++) {
      const s = t / segments;
      const s2 = s * s;
      const s3 = s2 * s;

      const x = 0.5 * (
        (2 * p1.x) +
        (-p0.x + p2.x) * s +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * s2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * s3
      );
      const y = 0.5 * (
        (2 * p1.y) +
        (-p0.y + p2.y) * s +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * s2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * s3
      );

      result.push({ x, y });
    }
  }

  return result;
}

/**
 * 중복 점 및 너무 가까운 점 제거
 */
export function removeDuplicatePoints(points: Point[], minDist: number = 0.5): Point[] {
  if (points.length < 2) return points;

  const result: Point[] = [points[0]];

  for (let i = 1; i < points.length; i++) {
    const last = result[result.length - 1];
    const curr = points[i];
    const dist = Math.sqrt((curr.x - last.x) ** 2 + (curr.y - last.y) ** 2);

    if (dist >= minDist) {
      result.push(curr);
    }
  }

  return result;
}

/**
 * 점 배열을 부드러운 SVG path로 변환 (Quadratic Bezier 사용)
 */
export function pointsToSmoothPath(points: Point[]): string {
  if (points.length === 0) return "";
  if (points.length < 3) {
    return `M${points[0].x.toFixed(1)},${points[0].y.toFixed(1)} Z`;
  }

  const n = points.length;
  const path: string[] = [];

  // 시작점: 첫 번째와 마지막 점의 중간
  const startX = (points[0].x + points[n - 1].x) / 2;
  const startY = (points[0].y + points[n - 1].y) / 2;
  path.push(`M${startX.toFixed(1)},${startY.toFixed(1)}`);

  // Quadratic Bezier curves - 점들을 컨트롤 포인트로, 중간점을 실제 경유점으로
  for (let i = 0; i < n; i++) {
    const curr = points[i];
    const next = points[(i + 1) % n];
    const midX = (curr.x + next.x) / 2;
    const midY = (curr.y + next.y) / 2;

    path.push(`Q${curr.x.toFixed(1)},${curr.y.toFixed(1)} ${midX.toFixed(1)},${midY.toFixed(1)}`);
  }

  path.push("Z");
  return path.join(" ");
}

/**
 * 점 배열을 단순 SVG path로 변환 (직선)
 */
export function pointsToSvgPath(points: Point[]): string {
  if (points.length === 0) return "";
  if (points.length < 3) {
    return `M${points[0].x.toFixed(1)},${points[0].y.toFixed(1)} Z`;
  }

  const path = [`M${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`];
  for (let i = 1; i < points.length; i++) {
    path.push(`L${points[i].x.toFixed(1)},${points[i].y.toFixed(1)}`);
  }
  path.push("Z");

  return path.join(" ");
}

/**
 * 폴리곤을 캔버스에 채워서 렌더링
 */
function fillPolygonToCanvas(
  points: Point[],
  width: number,
  height: number
): ImageData | null {
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = width;
  tempCanvas.height = height;
  const ctx = tempCanvas.getContext("2d");
  if (!ctx || points.length < 3) return null;

  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  ctx.fill();

  return ctx.getImageData(0, 0, width, height);
}

/**
 * 캔버스에서 칼선 경로 생성
 *
 * 파이프라인:
 * 1. 외곽선 추출 (alpha > 0 경계)
 * 2. Douglas-Peucker 단순화
 * 3. 오프셋 적용 (바깥쪽 확장)
 * 4. 오프셋된 폴리곤을 비트맵에 다시 렌더링 (자기 교차 해결)
 * 5. 비트맵에서 다시 외곽선 추출 (Union 효과)
 * 6. Chaikin + Catmull-Rom 스무딩
 * 7. Quadratic Bezier SVG path 생성
 */
export function generateCutlinePath(
  canvas: HTMLCanvasElement,
  offsetMm: number,
  dpi: number = 72
): string {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return "";

  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);

  // 확장 반경 계산:
  // - 기본 연결 반경: 10px (떨어진 요소 연결용)
  // - 오프셋을 픽셀로 변환하여 추가
  const baseConnectRadius = 10;
  const offsetPx = mmToPx(offsetMm, dpi);
  const totalDilateRadius = Math.round(baseConnectRadius + offsetPx);

  console.log(`칼선: 확장 반경 ${totalDilateRadius}px (연결: ${baseConnectRadius}px + 오프셋: ${offsetPx.toFixed(1)}px)`);

  // 1. 외곽 경계 추출 (모폴로지 확장 포함)
  let contour = extractOuterContour(imageData, totalDilateRadius);
  if (contour.length < 10) {
    console.log("칼선: 외곽선 점이 부족합니다:", contour.length);
    return "";
  }

  // 2. 단순화
  contour = simplifyContour(contour, 2);
  console.log(`칼선: ${contour.length}개로 단순화`);

  // 3. Chaikin 스무딩 (코너 부드럽게)
  contour = chaikinSmooth(contour, 3);
  console.log(`칼선: Chaikin 스무딩 후 ${contour.length}개`);

  // 4. 중복 점 제거
  contour = removeDuplicatePoints(contour, 1);

  // 5. 최종 단순화 (너무 많은 점 방지)
  if (contour.length > 300) {
    contour = simplifyContour(contour, 1.5);
  }

  // 6. Catmull-Rom 보간 (최종 스무딩)
  contour = catmullRomSmooth(contour, 3);

  // 7. 중복 점 제거
  contour = removeDuplicatePoints(contour, 0.5);

  // 11. 부드러운 SVG path 생성 (Quadratic Bezier)
  const path = pointsToSmoothPath(contour);
  console.log(`칼선: 최종 path 생성 (${contour.length}개 점)`);

  return path;
}

// 레거시 호환
export const extractContour = extractOuterContour;
export const extractContourWithThreshold = extractOuterContour;
export const smoothContour = catmullRomSmooth;
export const smoothToBezier = catmullRomSmooth;
export const offsetContour = offsetContourRound;
