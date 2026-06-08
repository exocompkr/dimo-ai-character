#!/usr/bin/env node
/**
 * dimo_mockup_v2.html 에서 base64 임베드 이미지를 추출하여
 * public/images/mockup/ 폴더에 저장합니다.
 *
 * 출력 형식: line-{lineNumber}-{index}.{ext}
 * 동시에 manifest.json에 (라인번호 → 파일경로) 매핑을 기록합니다.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, "..", "dimo_mockup_v2.html");
const OUT_DIR = join(__dirname, "..", "public", "images", "mockup");
const MANIFEST = join(__dirname, "..", "src", "mocks", "mockup-images.json");

mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(dirname(MANIFEST), { recursive: true });

const html = readFileSync(SRC, "utf8");
const lines = html.split("\n");

const RE = /data:image\/(png|jpe?g|webp|gif);base64,([A-Za-z0-9+/=]+)/g;

const manifest = [];
let totalFound = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  let m;
  let inLineIdx = 0;
  RE.lastIndex = 0;
  while ((m = RE.exec(line)) !== null) {
    const ext = m[1] === "jpeg" ? "jpg" : m[1];
    const b64 = m[2];
    const buf = Buffer.from(b64, "base64");
    const name = `line-${String(i + 1).padStart(3, "0")}-${inLineIdx}.${ext}`;
    writeFileSync(join(OUT_DIR, name), buf);
    manifest.push({
      lineNumber: i + 1,
      indexInLine: inLineIdx,
      publicPath: `/images/mockup/${name}`,
      bytes: buf.length,
      // 라인 텍스트 컨텍스트 (id/alt/class 등 추측에 도움)
      lineSnippet: line.slice(0, 200),
    });
    inLineIdx += 1;
    totalFound += 1;
  }
}

writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
console.log(`✓ Extracted ${totalFound} images to ${OUT_DIR}`);
console.log(`✓ Wrote manifest to ${MANIFEST}`);
