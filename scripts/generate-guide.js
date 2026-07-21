#!/usr/bin/env node
// content/claude-md-example.md 는 CLAUDE.md 예시 텍스트의 단일 소스(SSOT)입니다.
// guide.md의 해당 코드 블록은 직접 손으로 고치지 말고, 이 스크립트로 생성하세요.
//   node scripts/generate-guide.js
// (build.html은 이 파일을 브라우저에서 직접 fetch하므로 별도 생성이 필요 없습니다.)

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SOURCE_PATH = path.join(ROOT, 'content', 'claude-md-example.md');
const GUIDE_PATH = path.join(ROOT, 'guide.md');

const source = fs.readFileSync(SOURCE_PATH, 'utf8').replace(/\n$/, '');
const guide = fs.readFileSync(GUIDE_PATH, 'utf8');

const blockPattern = /(```markdown\n)([\s\S]*?)(\n```)/;
if (!blockPattern.test(guide)) {
  throw new Error('guide.md: CLAUDE.md 예시 코드 블록을 찾을 수 없습니다.');
}

const updated = guide.replace(blockPattern, (_, before, _body, after) => before + source + after);

if (updated !== guide) {
  fs.writeFileSync(GUIDE_PATH, updated, 'utf8');
  console.log('synced: guide.md');
} else {
  console.log('already in sync: guide.md');
}
