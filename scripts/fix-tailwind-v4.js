import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const replacements = [
  ['w-[600px]', 'w-150'],
  ['h-[600px]', 'h-150'],
  ['w-[500px]', 'w-125'],
  ['h-[500px]', 'h-125'],
  ['w-[400px]', 'w-100'],
  ['h-[400px]', 'h-100'],
  ['w-[700px]', 'w-175'],
  ['h-[700px]', 'h-175'],
  ['w-[300px]', 'w-75'],
  ['h-[300px]', 'h-75'],
  ['w-[3px]', 'w-0.75'],
  ['h-[2px]', 'h-0.5'],
  ['inset-[1px]', 'inset-px'],
  ['translate-x-[-100%]', '-translate-x-full'],
  ['translate-x-[100%]', 'translate-x-full'],
  ['group-hover/btn:translate-x-[100%]', 'group-hover/btn:translate-x-full'],
  ['bg-[size:', 'bg-size-['],
];

function processDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (
      entry.isDirectory() &&
      !entry.name.startsWith('.') &&
      entry.name !== 'node_modules'
    ) {
      processDir(fullPath);
    } else if (entry.isFile() && /\.(jsx?|css)$/.test(entry.name)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      for (const [oldStr, newStr] of replacements) {
        if (content.includes(oldStr)) {
          content = content.split(oldStr).join(newStr);
          modified = true;
        }
      }

      if (modified) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated:', fullPath);
      }
    }
  }
}

processDir(path.join(__dirname, '..', 'app'));
processDir(path.join(__dirname, '..', 'components'));
console.log('Done!');
