/*
 * Local PostCSS pipeline used by Vite. Explicitly declare the plugins here
 * so the loader never climbs up to the drive root (which caused the missing
 * tailwindcss module error during builds).
 */
module.exports = {
	plugins: {
		tailwindcss: {},
		autoprefixer: {},
	},
};
