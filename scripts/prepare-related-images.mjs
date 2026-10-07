import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Explicit interpreter override supports existing virtualenvs; never auto-install.
export function prepareRelatedImages() {
  const python = process.env.ATLAS_PYTHON || 'python3';
  const help = 'Related image preparation requires Python >=3.10 and Pillow. Create a virtualenv: python3 -m venv .venv; .venv/bin/python -m pip install Pillow; then set ATLAS_PYTHON=.venv/bin/python (Windows: .venv/Scripts/python.exe). See docs/methodology/RELATED-IMAGES.md.';
  const check = spawnSync(python, ['-c', 'import sys; assert sys.version_info >= (3,10); import PIL'], {encoding:'utf8'});
  if (check.error || check.status !== 0) throw new Error(`${help}\n${check.error?.message || check.stderr}`);
  const result = spawnSync(python, [fileURLToPath(new URL('./related_images.py', import.meta.url)), '--prepare'], {stdio:'inherit'});
  if (result.error || result.status !== 0) throw new Error(`Related image preparation failed; startup/build stopped. Restore tracked originals or review the index before retrying. ${result.error?.message || ''}`);
}
