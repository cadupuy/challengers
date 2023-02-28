import { defineConfig, loadEnv } from "vite";
import glsl from "vite-plugin-glsl";
import path from "path";

export default ({ mode }) => {
	console.log("🏓 Environnement :", mode);

	return defineConfig({
		server: {
			port: 3000,
			https: false,
			open: true,
			hmr: { port: 3000 },
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
				"@js": path.resolve(__dirname, "../src/js"),
				"@ui": path.resolve(__dirname, "../src/js/UI"),
				"@shaders": path.resolve(__dirname, "../src/shaders"),
				"@utils": path.resolve(__dirname, "../src/js/utils"),
				"@world": path.resolve(__dirname, "../src/js/world"),
				"@scss": path.resolve(__dirname, "../src/scss"),
				"@json": path.resolve(__dirname, "../src/json"),
			},
		},

		plugins: [glsl()],

		assetsInclude: ["**/*.glb", "**/*.gltf"],

		css: {
			preprocessorOptions: {
				scss: {
					additionalData: `@import "../src/scss/utils/variables";`,
					sassOptions: {
						outputStyle: "compressed",
					},
				},
			},
		},
	});
};
