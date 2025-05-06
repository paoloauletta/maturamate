/**
 * Data Fetching Analysis Script
 *
 * This script analyzes data fetching patterns in the codebase to identify:
 * 1. Redundant/duplicated data fetching
 * 2. Inefficient patterns
 * 3. Inconsistent approaches
 */

const fs = require("fs");
const path = require("path");
const util = require("util");

const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);
const readFile = util.promisify(fs.readFile);

const ROOT_DIR = path.resolve(__dirname, "..");
const SRC_DIR = path.join(ROOT_DIR, "src");

// Patterns to identify different data fetching approaches
const FETCH_PATTERNS = [
  { name: "fetch API", pattern: /fetch\(['"]/ },
  { name: "drizzle query", pattern: /db\..+?\.query|db\..+?\.select/ },
  { name: "getServerSession", pattern: /getServerSession/ },
  { name: "cache wrapper", pattern: /cache\(async.*?\)/ },
  { name: "useQuery", pattern: /useQuery\(/ },
];

// Results containers
const dataFetchingComponents = [];
const fetchingApproaches = {
  serverComponents: {},
  clientComponents: {},
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
      await analyzeDataFetching(filePath);
    }
  }
}

/**
 * Analyze data fetching in a component file
 */
async function analyzeDataFetching(filePath) {
  const relativePath = path.relative(ROOT_DIR, filePath);
  const content = await readFile(filePath, "utf8");
  const fileName = path.basename(filePath);

  // Determine if it's a client or server component
  const isClientComponent = content.includes('"use client"');
  const componentType = isClientComponent ? "client" : "server";

  // Check for data fetching patterns
  const foundPatterns = [];

  for (const pattern of FETCH_PATTERNS) {
    if (pattern.pattern.test(content)) {
      foundPatterns.push(pattern.name);

      // Update the stats
      if (isClientComponent) {
        fetchingApproaches.clientComponents[pattern.name] =
          (fetchingApproaches.clientComponents[pattern.name] || 0) + 1;
      } else {
        fetchingApproaches.serverComponents[pattern.name] =
          (fetchingApproaches.serverComponents[pattern.name] || 0) + 1;
      }
    }
  }

  if (foundPatterns.length > 0) {
    // Extract the actual fetch calls for analysis
    const fetchMatches =
      content.match(/(?:fetch|query|select|getServerSession)[^;{]*(?:[);])/g) ||
      [];

    dataFetchingComponents.push({
      path: relativePath,
      type: componentType,
      patterns: foundPatterns,
      fetchCount: fetchMatches.length,
      hasCaching:
        content.includes("cache(") || content.includes("revalidatePath"),
      examples: fetchMatches.slice(0, 2).map((m) => m.trim()),
    });
  }
}

/**
 * Identify potential redundant data fetching
 */
function findRedundantDataFetching() {
  const fetchPaths = {};
  const redundancies = [];

  // Group components by what they fetch
  dataFetchingComponents.forEach((comp) => {
    comp.examples.forEach((example) => {
      const key = example.replace(/\s+/g, "").substring(0, 100);
      if (!fetchPaths[key]) {
        fetchPaths[key] = [];
      }
      fetchPaths[key].push(comp.path);
    });
  });

  // Find instances where the same data is fetched in multiple places
  Object.entries(fetchPaths).forEach(([key, paths]) => {
    if (paths.length > 1) {
      redundancies.push({
        example: key,
        components: paths,
      });
    }
  });

  return redundancies;
}

/**
 * Generate a report of data fetching patterns
 */
async function generateReport() {
  try {
    console.log("Analyzing data fetching patterns...");
    await walkDir(SRC_DIR);

    const redundancies = findRedundantDataFetching();

    console.log("\n=== DATA FETCHING ANALYSIS REPORT ===\n");

    console.log("Data Fetching in Server Components:");
    Object.entries(fetchingApproaches.serverComponents).forEach(
      ([name, count]) => {
        console.log(`  ${name}: ${count} occurrences`);
      }
    );

    console.log("\nData Fetching in Client Components:");
    Object.entries(fetchingApproaches.clientComponents).forEach(
      ([name, count]) => {
        console.log(`  ${name}: ${count} occurrences`);
      }
    );

    console.log("\nComponents with most fetch calls:");
    dataFetchingComponents
      .sort((a, b) => b.fetchCount - a.fetchCount)
      .slice(0, 5)
      .forEach((comp) => {
        console.log(
          `  ${comp.path} (${comp.type}): ${comp.fetchCount} fetch calls`
        );
      });

    console.log("\nComponents without caching:");
    dataFetchingComponents
      .filter((comp) => !comp.hasCaching && comp.type === "server")
      .forEach((comp) => {
        console.log(`  ${comp.path}`);
      });

    console.log("\nPotential redundant data fetching:");
    if (redundancies.length === 0) {
      console.log("  None found");
    } else {
      redundancies.forEach((r) => {
        console.log(`  Data pattern: ${r.example.substring(0, 50)}...`);
        console.log(`  Found in components:`);
        r.components.forEach((c) => console.log(`    - ${c}`));
        console.log("");
      });
    }

    console.log("\n=== RECOMMENDATIONS ===");
    console.log(
      "1. Create centralized data fetching utilities in src/lib/server/"
    );
    console.log("2. Implement consistent caching strategies");
    console.log("3. Move redundant data fetching to shared server components");
    console.log("4. Ensure all server components use proper caching");
  } catch (error) {
    console.error("Error analyzing data fetching:", error);
  }
}

// Run the analysis
generateReport();
