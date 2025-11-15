import fs from 'fs';
import path from 'path';

const run = async () => {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.error('The `sharp` package is required. Run `yarn add -D sharp` or `npm i -D sharp` then re-run this script.');
    process.exit(1);
  }

  const publicDir = path.join(process.cwd(), 'public');
  const iconsDir = path.join(publicDir, 'icons');
  if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

  // Prefer `digital-kta.png` else fallback to `digital-kta-logo.png` or others
  const candidates = ['digital-kta.png', 'digital-kta-logo.png', 'logo.webp'];
  const source = candidates.map((c) => path.join(publicDir, c)).find((p) => fs.existsSync(p));

  if (!source) {
    console.error('No source logo found. Put your logo in `public/digital-kta.png` or `public/digital-kta-logo.png`.');
    process.exit(1);
  }

  const sizes = [48, 72, 96, 128, 144, 152, 192, 256, 384, 512];

  try {
    await Promise.all(
      sizes.map((size) => {
        const out = path.join(iconsDir, `android-chrome-${size}x${size}.png`);
        return sharp(source).resize(size, size).png().toFile(out).then(() => {
          console.log('Generated', out);
        });
      })
    );

    // write apple-touch-icon (180x180)
    const appleOut = path.join(publicDir, 'apple-touch-icon.png');
    await sharp(source).resize(180, 180).png().toFile(appleOut);
    console.log('Generated', appleOut);
  } catch (err) {
    console.error('Error generating icons:', err);
    process.exit(1);
  }
};

run();
