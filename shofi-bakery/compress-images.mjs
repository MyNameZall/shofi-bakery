import sharp from 'sharp';
import { readdirSync } from 'fs';

const files = [
  { input: 'public/hero.png', output: 'public/hero.webp', width: 1400 },
  { input: 'public/roti.png', output: 'public/roti.webp', width: 600 },
  { input: 'public/croissant.png', output: 'public/croissant.webp', width: 600 },
  { input: 'public/kue.png', output: 'public/kue.webp', width: 600 },
];

for (const f of files) {
  await sharp(f.input)
    .resize(f.width, null, { withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(f.output);
  console.log(`✅ ${f.input} → ${f.output}`);
}
console.log('Done!');
