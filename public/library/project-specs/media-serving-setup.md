# Media File Serving Setup

## Overview

This application uses a hybrid approach for serving uploaded media files:

- **File Storage**: Files are uploaded and stored in `server/uploads/`
- **File Serving**: Files are served through Next.js static file serving via a symbolic link

## Architecture

```
server/uploads/          # Actual file storage (Express server)
├── media/              # Media files (seals, flags, etc.)
├── avatars/            # User avatar images
└── test_seal.png       # Test files

public/uploads/         # Symbolic link to server/uploads/
└── (same structure as above)
```

## How It Works

1. **File Upload**: Files are uploaded through the Express server API (`/api/media/upload`)
2. **File Storage**: Files are saved to `server/uploads/` directory
3. **File Serving**: Next.js serves files from `public/uploads/` (symbolic link to `server/uploads/`)
4. **URL Access**: Files are accessible at `http://localhost:3000/uploads/...`

## Setup

The symbolic link is created with:

```bash
ln -sf ../server/uploads public/uploads
```

This is also available as an npm script:

```bash
npm run setup:uploads
```

## Benefits

- **Single Source of Truth**: Files are stored in one location (`server/uploads/`)
- **Efficient Serving**: Next.js serves files directly without proxying
- **Consistent URLs**: All media URLs use the same pattern (`/uploads/...`)
- **No API Overhead**: Direct file serving is faster than API proxying

## File Types Supported

- Images: JPEG, PNG, SVG
- Documents: PDF
- Avatars: JPEG, PNG

## URL Examples

- Media files: `http://localhost:3000/uploads/media/seal_123456.png`
- Avatars: `http://localhost:3000/uploads/avatars/user_avatar.jpg`
- Test files: `http://localhost:3000/uploads/test_seal.png`

## Troubleshooting

If files are not accessible:

1. Check if the symbolic link exists: `ls -la public/uploads/`
2. Recreate the link: `npm run setup:uploads`
3. Verify file exists: `ls -la server/uploads/media/`
4. Check file permissions: `ls -la server/uploads/`

## Development vs Production

- **Development**: Uses symbolic link for easy development
- **Production**: Should use proper file serving configuration (e.g., CDN, cloud storage)
