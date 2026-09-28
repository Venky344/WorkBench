import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Architecture Boundary & Storage Isolation', () => {
  const domainDir = path.resolve(__dirname, '../../src/domain');

  function getTsFiles(dir: string): string[] {
    const files: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...getTsFiles(fullPath));
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
        files.push(fullPath);
      }
    }

    return files;
  }

  it('ensures domain files have ZERO imports of browser/storage APIs', () => {
    const domainFiles = getTsFiles(domainDir);
    expect(domainFiles.length).toBeGreaterThan(0);

    const forbiddenTokens = [
      'indexedDB',
      'localStorage',
      'sessionStorage',
      'window.',
      'document.',
      '@/persistence',
      '@/repositories',
      'IDBDatabase',
      'IDBTransaction',
      'IDBValidKey',
    ];

    const violations: { file: string; token: string; line: number }[] = [];

    for (const file of domainFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, idx) => {
        for (const token of forbiddenTokens) {
          if (line.includes(token)) {
            violations.push({
              file: path.relative(domainDir, file),
              token,
              line: idx + 1,
            });
          }
        }
      });
    }

    expect(violations).toEqual([]);
  });
});
