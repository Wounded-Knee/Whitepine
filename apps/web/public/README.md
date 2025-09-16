# Public Assets Directory

This directory contains static assets that are served directly by the Next.js web server.

## Directory Structure

```
public/
├── images/           # Image assets
│   ├── hero/         # Hero section images
│   ├── team/         # Team member photos
│   ├── products/     # Product images
│   └── blog/         # Blog post images
├── icons/            # Icon files (SVG, PNG, ICO)
├── documents/        # PDF documents, guides, etc.
├── downloads/        # Downloadable files
└── README.md         # This file
```

## Usage

Files in this directory are served from the root URL. For example:

- `public/images/hero/hero-image.jpg` → `https://yoursite.com/images/hero/hero-image.jpg`
- `public/icons/favicon.ico` → `https://yoursite.com/icons/favicon.ico`
- `public/documents/guide.pdf` → `https://yoursite.com/documents/guide.pdf`

## Best Practices

1. **Optimize Images**: Use WebP format when possible, compress images
2. **Naming Convention**: Use kebab-case for file names (e.g., `hero-image.jpg`)
3. **Organization**: Keep related assets in appropriate subdirectories
4. **Size Limits**: Be mindful of file sizes for performance
5. **Alt Text**: Always provide alt text for images in your components

## Adding Assets

1. Place files in the appropriate subdirectory
2. Reference them in your components using the public path
3. Example: `<img src="/images/hero/hero-image.jpg" alt="Hero image" />`
