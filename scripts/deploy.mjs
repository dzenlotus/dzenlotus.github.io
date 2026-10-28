import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

function run(command, args, cwd = process.cwd()) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', stdio: ['inherit', 'pipe', 'pipe'] });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || `${command} failed`);
  return result.stdout.trim();
}

run('npm', ['run', 'build']);
const remote = run('git', ['remote', 'get-url', 'origin']);
const directory = mkdtempSync(join(tmpdir(), 'ivan-portfolio-pages-'));
try {
  run('git', ['init', '-b', 'gh-pages'], directory);
  run('git', ['remote', 'add', 'origin', remote], directory);
  if (run('git', ['ls-remote', '--heads', 'origin', 'gh-pages'], directory)) {
    run('git', ['fetch', '--depth=1', 'origin', 'gh-pages'], directory);
    run('git', ['reset', '--hard', 'FETCH_HEAD'], directory);
  }
  for (const entry of readdirSync(directory)) {
    if (entry !== '.git') rmSync(join(directory, entry), { recursive: true, force: true });
  }
  cpSync(resolve('dist'), directory, { recursive: true });
  run('git', ['add', '.'], directory);
  if (run('git', ['status', '--porcelain'], directory)) {
    run('git', ['commit', '-m', 'Publish portfolio build'], directory);
    run('git', ['push', 'origin', 'HEAD:gh-pages'], directory);
    console.log('Published build to gh-pages. GitHub Pages will deploy it.');
  } else {
    console.log('Published build is already current.');
  }
} finally {
  rmSync(directory, { recursive: true, force: true });
}
