const path = require("node:path");

// Local Windows application-control policies can block Next's native SWC binary.
// Resolve the matching WASM binding installed with the project before Next starts.
process.env.NEXT_TEST_WASM_DIR = path.dirname(
  require.resolve("@next/swc-wasm-nodejs/wasm.js"),
);
process.argv = [process.argv[0], "next", "build", "--webpack"];

require("next/dist/bin/next");
