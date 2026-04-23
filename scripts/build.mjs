import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import esbuild from "esbuild";

const current_file_path = fileURLToPath(import.meta.url);
const project_root = path.resolve(path.dirname(current_file_path), "..");
const dist_directory = path.join(project_root, "dist");
const dist_i18n_directory = path.join(dist_directory, "i18n");

const shared_banner = {
  js: "/*! mangoPicker v1.0.0 | MIT License */",
  css: "/*! mangoPicker v1.0.0 | MIT License */"
};

await mkdir(dist_directory, { recursive: true });
await mkdir(dist_i18n_directory, { recursive: true });

const build_jobs = [
  {
    entryPoints: [path.join(project_root, "src/index.js")],
    outfile: path.join(dist_directory, "mangopicker.js"),
    bundle: true,
    format: "iife",
    globalName: "mangoPicker",
    minify: false,
    banner: { js: shared_banner.js }
  },
  {
    entryPoints: [path.join(project_root, "src/index.js")],
    outfile: path.join(dist_directory, "mangopicker.min.js"),
    bundle: true,
    format: "iife",
    globalName: "mangoPicker",
    minify: true,
    banner: { js: shared_banner.js }
  },
  {
    entryPoints: [path.join(project_root, "src/styles/mangopicker.css")],
    outfile: path.join(dist_directory, "mangopicker.css"),
    bundle: true,
    minify: false,
    banner: { css: shared_banner.css }
  },
  {
    entryPoints: [path.join(project_root, "src/styles/mangopicker.css")],
    outfile: path.join(dist_directory, "mangopicker.min.css"),
    bundle: true,
    minify: true,
    banner: { css: shared_banner.css }
  },
  {
    entryPoints: [path.join(project_root, "src/i18n/build_th.js")],
    outfile: path.join(dist_i18n_directory, "th.js"),
    bundle: true,
    format: "iife",
    minify: false,
    banner: { js: shared_banner.js }
  },
  {
    entryPoints: [path.join(project_root, "src/i18n/build_en.js")],
    outfile: path.join(dist_i18n_directory, "en.js"),
    bundle: true,
    format: "iife",
    minify: false,
    banner: { js: shared_banner.js }
  }
];

await Promise.all(
  build_jobs.map((build_job) =>
    esbuild.build({
      charset: "utf8",
      target: ["es2018"],
      logLevel: "info",
      ...build_job
    })
  )
);
