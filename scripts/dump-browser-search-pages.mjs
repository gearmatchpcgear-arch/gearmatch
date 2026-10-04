/**
 * Dump all 3 Amazon search pages via browser CDP evaluate snippets.
 * Run: node scripts/dump-browser-search-pages.mjs
 * Then paste CDP JSON outputs into page1/2/3 files — or use browser automation.
 *
 * This script writes placeholder instructions; actual data is merged by merge-monitor-search-browser-pages.mjs
 */
console.log("Use browser CDP extract on pages 1-3, save to:")
console.log("  scripts/monitor-search-22-120-page1.json")
console.log("  scripts/monitor-search-22-120-page2.json")
console.log("  scripts/monitor-search-22-120-page3.json")
console.log("Then: node scripts/merge-monitor-search-browser-pages.mjs")
console.log("      node scripts/generate-monitor-search-22-120.mjs")
