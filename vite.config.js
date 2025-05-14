import { defineConfig } from "vite";
import path from "path";

export default defineConfig(({ command, mode }) => {
  const isWorkerBuild = process.env.BUILD_TARGET === "worker";

  return {
    publicDir: "public", // Ensures painus.yaml is served statically
    build: isWorkerBuild
      ? {
          target: "esnext",
          outDir: "dist",
          lib: {
            entry: path.resolve(__dirname, "src/worker.js"),
            formats: ["es"],
            fileName: () => "worker.js",
          },
          rollupOptions: {
            external: [],
          },
          emptyOutDir: true,
        }
      : {
          outDir: "dist", // fallback build config
        },
  };
});
