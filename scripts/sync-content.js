#!/usr/bin/env node
// Single source of truth: content/claude-md-example.md
// This script injects that content into every page that duplicates it
// (guide.md, build.html), so edits only ever happen in one place.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SOURCE_PATH = path.join(ROOT, 'content', 'claude-md-example.md');

const source = fs.readFileSync(SOURCE_PATH, 'utf8').replace(/\n$/, '');

const targets = [
  {
    file: 'guide.md',
    replace(content) {
      const re = /(CLAUDE\.md \(예시\)\s*\n\n```markdown\n)([\s\S]*?)(\n```)/;
      if (!re.test(content)) {
        throw new Error('guide.md: CLAUDE.md 예시 코드 블록을 찾을 수 없습니다.');
      }
      return content.replace(re, (_, before, _body, after) => before + source + after);
    },
  },
  {
    file: 'build.html',
    replace(content) {
      // build.html already hard-codes the "# CLAUDE.md" heading as literal
      // text right after the label span, so only the remaining body is injected.
      const body = source.replace(/^# CLAUDE\.md\n\n/, '');
      const re = /(CLAUDE\.md \(예시\)<\/span># CLAUDE\.md\n\n)([\s\S]*?)(<\/div>)/;
      if (!re.test(content)) {
        throw new Error('build.html: CLAUDE.md 예시 code-block을 찾을 수 없습니다.');
      }
      return content.replace(re, (_, before, _body, after) => before + body + after);
    },
  },
];

let changed = false;
for (const target of targets) {
  const filePath = path.join(ROOT, target.file);
  const original = fs.readFileSync(filePath, 'utf8');
  const updated = target.replace(original);
  if (updated !== original) {
    fs.writeFileSync(filePath, updated, 'utf8');
    changed = true;
    console.log(`synced: ${target.file}`);
  } else {
    console.log(`already in sync: ${target.file}`);
  }
}

if (changed) {
  console.log('\n일부 파일이 content/claude-md-example.md 기준으로 갱신되었습니다.');
} else {
  console.log('\n모든 파일이 이미 content/claude-md-example.md와 일치합니다.');
}
