/**
 * Component Renaming Script
 *
 * This script helps rename components according to the new naming convention.
 * It takes a component file path and renames it according to the new convention,
 * then updates all imports in the codebase.
 */

const fs = require("fs");
const path = require("path");
const util = require("util");
const { execSync } = require("child_process");

const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const rename = util.promisify(fs.rename);

const ROOT_DIR = path.resolve(__dirname, "..");
const SRC_DIR = path.join(ROOT_DIR, "src");

// Helper to safely rename a file
async function safeRename(oldPath, newPath) {
  try {
    // Create directories if they don't exist
    const dir = path.dirname(newPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Rename the file
    await rename(oldPath, newPath);
    console.log(`✅ Renamed: ${oldPath} -> ${newPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error renaming ${oldPath}:`, error.message);
    return false;
  }
}

// Find all imports of a specific file across the codebase
function findImports(oldPath) {
  try {
    // Get the relative path (how it would be imported)
    const relativePath = path.relative(ROOT_DIR, oldPath);
    const fileNameWithExt = path.basename(oldPath);
    const fileName = fileNameWithExt.replace(/\.tsx?$/, "");

    // Use grep to find imports
    const grepBase = `grep -r "from ['\\"].*${fileName}" --include="*.tsx" --include="*.ts" ${SRC_DIR}`;
    const result = execSync(grepBase).toString();

    return result
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const [filePath] = line.split(":");
        return filePath;
      });
  } catch (error) {
    // grep returns non-zero if no matches are found
    return [];
  }
}

// Update imports in a specific file
async function updateImports(filePath, oldImport, newImport) {
  try {
    if (!fs.existsSync(filePath)) {
      return false;
    }

    const content = await readFile(filePath, "utf8");

    // Create patterns to match different import styles
    const oldBaseName = path.basename(oldImport, path.extname(oldImport));
    const newBaseName = path.basename(newImport, path.extname(newImport));

    const patterns = [
      // Relative imports
      {
        from: new RegExp(`from ['"](.+?)${oldBaseName}['"]`, "g"),
        to: (match, p1) => `from '${p1}${newBaseName}'`,
      },
      // Path alias imports
      {
        from: new RegExp(`from ['"](@/.+?)${oldBaseName}['"]`, "g"),
        to: (match, p1) => `from '${p1}${newBaseName}'`,
      },
    ];

    let updatedContent = content;
    let updated = false;

    patterns.forEach((pattern) => {
      const newContent = updatedContent.replace(pattern.from, pattern.to);
      if (newContent !== updatedContent) {
        updatedContent = newContent;
        updated = true;
      }
    });

    if (updated) {
      await writeFile(filePath, updatedContent, "utf8");
      console.log(`✅ Updated imports in: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error updating imports in ${filePath}:`, error.message);
    return false;
  }
}

// Rename a component and update all imports
async function renameComponent(oldPath, newName) {
  // Calculate the new path
  const dir = path.dirname(oldPath);
  const newPath = path.join(dir, newName);

  // Find all files that import this component
  const importingFiles = findImports(oldPath);
  console.log(`Found ${importingFiles.length} files importing ${oldPath}`);

  // Rename the file
  const renamed = await safeRename(oldPath, newPath);
  if (!renamed) {
    return false;
  }

  // Update imports in all files
  let updatedCount = 0;
  for (const file of importingFiles) {
    if (await updateImports(file, oldPath, newPath)) {
      updatedCount++;
    }
  }

  console.log(
    `Updated imports in ${updatedCount}/${importingFiles.length} files`
  );
  return true;
}

// Process commands from CLI
async function processCommand() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === "rename" && args.length === 3) {
    const [_, filePath, newName] = args;
    const fullPath = path.resolve(process.cwd(), filePath);
    await renameComponent(fullPath, newName);
  } else if (command === "move" && args.length === 3) {
    const [_, filePath, newLocation] = args;
    const fullPath = path.resolve(process.cwd(), filePath);
    const newPath = path.resolve(process.cwd(), newLocation);

    // Moving is similar to renaming but with a different path
    const fileName = path.basename(fullPath);
    const fullNewPath = path.join(newPath, fileName);

    // Find all files that import this component
    const importingFiles = findImports(fullPath);
    console.log(`Found ${importingFiles.length} files importing ${fullPath}`);

    // Rename the file
    const renamed = await safeRename(fullPath, fullNewPath);
    if (!renamed) {
      return false;
    }

    // Update imports in all files
    let updatedCount = 0;
    for (const file of importingFiles) {
      if (await updateImports(file, fullPath, fullNewPath)) {
        updatedCount++;
      }
    }

    console.log(
      `Updated imports in ${updatedCount}/${importingFiles.length} files`
    );
  } else {
    console.log(`
Usage:
  node rename-components.js rename <file-path> <new-name>
  node rename-components.js move <file-path> <new-directory>

Examples:
  node rename-components.js rename src/components/Button.tsx button-client.tsx
  node rename-components.js move src/app/dashboard/Stats.tsx src/components/dashboard/
    `);
  }
}

// Run the script
processCommand();
