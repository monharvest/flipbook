# Next.js Flipbook

Interactive PDF flipbook viewer built with Next.js and DearFlip, optimized for static export and Cloudflare Pages deployment.

## Features

- 📖 **DearFlip Integration** - Professional 3D flipbook with WebGL rendering
- 📱 **Mobile Optimized** - Responsive design with automatic mobile detection
- ⚡ **Static Export** - Fully static site generation for edge deployment
- 🎨 **Custom UI** - Hide/show controls on user interaction
- 🔧 **Error Handling** - Graceful fallbacks and diagnostics overlay
- 🚀 **Performance** - Optimized for Core Web Vitals (CLS, LCP)

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Generate static export
npm run build:static
```

## Project Structure

```
nextjs-flipbook/
├── app/
│   ├── layout.js          # Root layout with metadata
│   └── page.js             # Home page with DearFlipEmbed
├── components/
│   ├── DearFlipEmbed.js    # DearFlip integration component
│   └── FlipBook.js         # Alternative react-pageflip component
├── public/
│   ├── books/
│   │   └── book.pdf        # Your PDF file
│   └── dflip/              # DearFlip vendor assets
├── scripts/
│   └── assemble-out.js     # Static export assembly script
├── next.config.js          # Next.js configuration
└── package.json            # Dependencies and scripts

```

## Configuration

### PDF Source
Update the PDF source in `components/DearFlipEmbed.js`:
```javascript
el.setAttribute("source", "/books/your-book.pdf");
```

### DearFlip Settings
Modify flipbook settings in the `useEffect`:
```javascript
el.setAttribute("pageMode", "2");        // 1=single, 2=double
el.setAttribute("textureSize", "2048");  // Texture resolution
el.setAttribute("pagespeed", "1.2");     // Flip animation speed
```

## Build & Deploy

### Static Export
```bash
npm run build:static
```
This generates `out/` folder ready for static hosting.

### Deploy to Cloudflare Pages

1. **Via Dashboard:**
   - Upload `out/` folder to Cloudflare Pages
   - Build command: `npm run build:static`
   - Publish directory: `out`

2. **Via Wrangler CLI:**
   ```bash
   npx wrangler pages deploy out
   ```

### Alternative: Next.js Server Mode
Remove `output: 'export'` from `next.config.js` and deploy with Cloudflare's Next.js adapter.

## Development Features

### Debug Mode
Enable diagnostics:
- `?dfdiag=1` - Show diagnostics panel
- `?dfdebug=1` - Enable debug logging (if implemented)
- `?mobile=1` - Force mobile view for testing

### Mobile Detection
Automatic switching between flip and PDF view based on viewport width (768px breakpoint).

## Performance Optimizations

### Core Web Vitals
- **CLS (Cumulative Layout Shift)**
  - Loading skeleton during initialization
  - CSS `contain` property for layout isolation
  - GPU acceleration with `transform: translateZ(0)`
  
- **LCP (Largest Contentful Paint)**
  - Preloaded critical resources
  - Optimized asset loading sequence

- **FID (First Input Delay)**
  - Deferred initialization with `requestAnimationFrame`
  - Async script loading

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

## Troubleshooting

### Dev Lock Issue
If you see "unable to acquire lock":
```bash
rm .next/dev/lock
npm run dev
```

### Assets Not Loading
Ensure DearFlip assets are in `public/dflip/`:
- `js/dflip.min.js`
- `js/libs/pdf.min.js`
- `js/libs/three.min.js`
- `js/libs/jquery.min.js`
- `css/dflip.min.css`

### Mobile CLS Issues
Check viewport meta tag in `app/layout.js`:
```javascript
viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build Next.js production bundle |
| `npm run build:static` | Build + generate static export in `out/` |
| `npm run assemble:out` | Run static export assembler only |
| `npm start` | Start production server (not for static export) |

## Dependencies

### Core
- `next@^16.0.0` - Next.js framework
- `react@18.2.0` - React library
- `react-dom@18.2.0` - React DOM

### PDF & Flipbook
- `pdfjs-dist@^5.4.296` - PDF.js library
- `react-pageflip@^2.0.3` - Alternative flip component
- DearFlip (vendor bundle in `/public/dflip`)

## License

Private project. All rights reserved.

## Support

For issues or questions:
1. Check browser console for errors
2. Enable `?dfdiag=1` query param
3. Review DearFlip documentation
4. Check Next.js static export docs
