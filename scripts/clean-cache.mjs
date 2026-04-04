import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
for (const rel of [".next", path.join("node_modules", ".cache")]) {
  const target = path.join(root, rel);
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
    console.log("[sora-calm] Removed", rel);
  }
}
console.log("[sora-calm] Cache clean done. Run npm run dev.");
