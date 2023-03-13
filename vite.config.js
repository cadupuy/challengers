import { defineConfig } from "vite";
import glsl from "vite-plugin-glsl";

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
			alias: [
				{
					find: "@js",
					replacement: "/js",
				},
				{
					find: "@ui",
					replacement: "/js/UI",
				},
				{
					find: "@shaders",
					replacement: "/js/shaders",
				},

				{
					find: "@utils",
					replacement: "/js/utils",
				},
				{
					find: "@world",
					replacement: "/js/world",
				},
				{
					find: "@scss",
					replacement: "/scss",
				},
				{
					find: "@json",
					replacement: "/json",
				},
			],

			extensions: [".cjs", ".js", ".json"],
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
