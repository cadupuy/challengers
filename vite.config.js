import glsl from "vite-plugin-glsl";
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
	server: {
		port: "8000",
		https: false,
		open: true,
	},
	root: "src",
	publicDir: "../public",
	build: {
		outDir: "../dist",
		emptyOutDir: true,
		sourcemap: true,
	},

	resolve: {
		alias: {
			"@javascript": path.resolve(__dirname, "./src/javascript"),
			"@ui": path.resolve(__dirname, "./src/javascript/UI"),
			"@shaders": path.resolve(__dirname, "./src/shaders"),
			"@utils": path.resolve(__dirname, "./src/javascript/utils"),
			"@world": path.resolve(__dirname, "./src/javascript/world"),
			"@scss": path.resolve(__dirname, "./src/scss"),
			"@json": path.resolve(__dirname, "./src/json"),
		},
	},

	plugins: [glsl()],

	assetsInclude: ["**/*.glb", "**/*.gltf"],

	// ajouter le fichier de style variables.scss et le fichier functions.scss à tout le projet pour pouvoir utiliser les variables
	// dans les fichiers scss
	css: {
		preprocessorOptions: {
			scss: {
				additionalData: `@use "./src/scss/utils/variables.scss"; `,
			},
		},
	},
});
