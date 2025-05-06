/**
 * Component Analyzer Script
 *
 * This script analyzes the codebase to identify components that need to be
 * renamed or moved according to the restructuring plan.
 */

const fs = require("fs");
const path = require("path");
const util = require("util");

const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);
const readFile = util.promisify(fs.readFile);

const ROOT_DIR = path.resolve(__dirname, "..");
const SRC_DIR = path.join(ROOT_DIR, "src");

// Patterns to identify component types
const CLIENT_COMPONENT_PATTERN = /"use client"/;
const SERVER_IMPORT_PATTERN =
  /import\s+.*\s+from\s+['"].*?(db|drizzle|server|auth\/auth).*?['"]/;
const DATA_FETCHING_PATTERN =
  /(fetch|query|db\.|sql|drizzle|auth\.|getServerSession)/;

// File name patterns
const CLIENT_SUFFIX_PATTERN = /-client\.tsx$/;
const SERVER_SUFFIX_PATTERN = /-server\.tsx$/;

// Results containers
const componentsToRename = {
  client: [],
  server: [],
};

const componentsToMove = {
  clientToComponents: [],
  serverToApp: [],
  dataToAppData: [],
};

/**
 * Recursively walk a directory and process files
 */
async function walkDir(dir) {
  const files = await readdir(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = await stat(filePath);

    if (stats.isDirectory()) {
      // Skip node_modules and .next
      if (["node_modules", ".next", ".git", ".vscode"].includes(file)) {
        continue;
      }
      await walkDir(filePath);
    } else if (stats.isFile() && file.endsWith(".tsx")) {
      await analyzeComponent(filePath);
    }
  }
}

/**
 * Analyze a component file to determine if it needs renaming or moving
 */
async function analyzeComponent(filePath) {
  const relativePath = path.relative(ROOT_DIR, filePath);
  const content = await readFile(filePath, "utf8");
  const fileName = path.basename(filePath);

  // Check if it's a client component
  const isClientComponent = CLIENT_COMPONENT_PATTERN.test(content);

  // Check if it's a server component with data fetching
  const hasServerImports = SERVER_IMPORT_PATTERN.test(content);
  const hasDataFetching = DATA_FETCHING_PATTERN.test(content);
  const isServerComponent =
    !isClientComponent && (hasServerImports || hasDataFetching);

  // Check if the component needs renaming
  const hasClientSuffix = CLIENT_SUFFIX_PATTERN.test(fileName);
  const hasServerSuffix = SERVER_SUFFIX_PATTERN.test(fileName);

  // Analyze for renaming
  if (isClientComponent && !hasClientSuffix) {
    componentsToRename.client.push({
      path: relativePath,
      suggestedName: fileName.replace(/\.tsx$/, "-client.tsx"),
    });
  } else if (isServerComponent && !hasServerSuffix) {
    componentsToRename.server.push({
      path: relativePath,
      suggestedName: fileName.replace(/\.tsx$/, "-server.tsx"),
    });
  }

  // Analyze for moving
  const inAppDir = relativePath.includes("src/app");
  const inComponentsDir = relativePath.includes("src/components");

  if (isClientComponent && inAppDir) {
    componentsToMove.clientToComponents.push({
      path: relativePath,
      suggestedLocation: relativePath.replace(
        /src\/app\/(.+?)\/(.+?)\.tsx/,
        "src/components/$1/$2.tsx"
      ),
    });
  } else if (isServerComponent && !inAppDir && !fileName.includes("page")) {
    componentsToMove.serverToApp.push({
      path: relativePath,
      suggestedLocation: relativePath.replace(
        /src\/components\/(.+?)\/(.+?)\.tsx/,
        "src/app/$1/$2.tsx"
      ),
    });
  } else if (
    isServerComponent &&
    hasDataFetching &&
    !relativePath.includes("/data/")
  ) {
    componentsToMove.dataToAppData.push({
      path: relativePath,
      suggestedLocation: relativePath.replace(
        /src\/app\/(.+?)\/(.+?)-server\.tsx/,
        "src/app/$1/data/$2-server.tsx"
      ),
    });
  }
}

/**
 * Generate a report of components that need to be renamed or moved
 */
async function generateReport() {
  try {
    console.log("Analyzing components...");
    await walkDir(SRC_DIR);

    console.log("\n=== COMPONENT ANALYSIS REPORT ===\n");

    console.log("Components to rename to -client.tsx:");
    if (componentsToRename.client.length === 0) {
      console.log("  None found");
    } else {
      componentsToRename.client.forEach((comp) => {
        console.log(`  ${comp.path} -> ${comp.suggestedName}`);
      });
    }

    console.log("\nComponents to rename to -server.tsx:");
    if (componentsToRename.server.length === 0) {
      console.log("  None found");
    } else {
      componentsToRename.server.forEach((comp) => {
        console.log(`  ${comp.path} -> ${comp.suggestedName}`);
      });
    }

    console.log("\nClient components to move to /src/components/:");
    if (componentsToMove.clientToComponents.length === 0) {
      console.log("  None found");
    } else {
      componentsToMove.clientToComponents.forEach((comp) => {
        console.log(`  ${comp.path} -> ${comp.suggestedLocation}`);
      });
    }

    console.log("\nServer components to move to /src/app/:");
    if (componentsToMove.serverToApp.length === 0) {
      console.log("  None found");
    } else {
      componentsToMove.serverToApp.forEach((comp) => {
        console.log(`  ${comp.path} -> ${comp.suggestedLocation}`);
      });
    }

    console.log("\nData fetching components to move to /src/app/*/data/:");
    if (componentsToMove.dataToAppData.length === 0) {
      console.log("  None found");
    } else {
      componentsToMove.dataToAppData.forEach((comp) => {
        console.log(`  ${comp.path} -> ${comp.suggestedLocation}`);
      });
    }

    console.log("\n=== SUMMARY ===");
    console.log(
      `Total components to rename: ${
        componentsToRename.client.length + componentsToRename.server.length
      }`
    );
    console.log(
      `Total components to move: ${
        componentsToMove.clientToComponents.length +
        componentsToMove.serverToApp.length +
        componentsToMove.dataToAppData.length
      }`
    );
  } catch (error) {
    console.error("Error analyzing components:", error);
  }
}

// Run the analysis
generateReport();
