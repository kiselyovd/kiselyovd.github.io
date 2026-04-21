import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// Local-only dev script: runs on the maintainer's Windows machine to regenerate
// public/profile-portrait.* from the source portrait. Override with the
// PORTRAIT_SOURCE env var if the file moves or if run on another machine.
const SOURCE = process.env.PORTRAIT_SOURCE || 'D:/Projects/GitHub/Фото профиля.png';
const PUBLIC_DIR = path.resolve(process.cwd(), 'public');
const TARGET_WIDTH = 800;

async function main() {
  if (!existsSync(SOURCE)) {
    throw new Error(`Source image not found: ${SOURCE}`);
  }
  if (!existsSync(PUBLIC_DIR)) {
    await mkdir(PUBLIC_DIR, { recursive: true });
  }

  const input = await readFile(SOURCE);
  const base = sharp(input).resize({ width: TARGET_WIDTH, withoutEnlargement: true });

  // PNG does not support wide browser transparency fallback reliably; flatten
  // onto the site's --bg (#050505) so the PNG matches dark-theme rendering.
  await writeFile(
    path.join(PUBLIC_DIR, 'profile-portrait.png'),
    await base
      .clone()
      .flatten({ background: { r: 5, g: 5, b: 5 } })
      // palette: true gives an 8-bit indexed PNG. Acceptable here because this
      // fallback is only shown small (hero portrait) by browsers that support
      // neither AVIF nor WebP - a tiny slice of users where size beats color depth.
      .png({ compressionLevel: 9, palette: true, quality: 90 })
      .toBuffer(),
  );
  await writeFile(
    path.join(PUBLIC_DIR, 'profile-portrait.webp'),
    await base.clone().webp({ quality: 82 }).toBuffer(),
  );
  await writeFile(
    path.join(PUBLIC_DIR, 'profile-portrait.avif'),
    await base.clone().avif({ quality: 55 }).toBuffer(),
  );

  console.log('Portrait assets written to public/');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
