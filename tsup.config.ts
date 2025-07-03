import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
  target: "es2022",
  external: ["@ai-sdk/provider", "@ai-sdk/provider-utils", "ai"],
  noExternal: [],
  splitting: false,
  treeshake: true,
  outDir: "dist",
});
