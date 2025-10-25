/**
 * Next.js static export configuration.
 * We set `output: 'export'` so `next build` + `next export` generates a static `out/` folder
 * which can be deployed to Cloudflare Pages as a fully static site.
 */
module.exports = {
  // Use the static HTML export output
  output: 'export',
  // Keep trailingSlash false so routes map to index.html in subfolders
  trailingSlash: false,
};
module.exports = { reactStrictMode: true }