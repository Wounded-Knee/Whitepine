# Media Management System

## Overview

The Media Management System allows users to upload, manage, and link various types of media files to government entities. This includes seals, flags, headshots, logos, building photos, documents, signatures, and other media types.

## Media Types

The system supports the following media types:

- **Seal**: Official seals and emblems
- **Flag**: Flags and banners
- **Headshot**: Official photos of individuals
- **Logo**: Logos and branding materials
- **Building**: Photos of government buildings
- **Document**: Official documents and certificates
- **Signature**: Digital signatures
- **Other**: Miscellaneous media files

## Supported File Types

- **Images**: JPEG, PNG, SVG
- **Documents**: PDF
- **Maximum file size**: 10MB

## Database Schema

### Media Model

```javascript
{
  filename: String,           // Generated unique filename
  original_name: String,      // Original uploaded filename
  mime_type: String,          // File MIME type
  size: Number,               // File size in bytes
  path: String,               // File system path
  url: String,                // Public URL for access
  
  media_type: String,         // One of the supported media types
  title: String,              // Optional title
  description: String,        // Optional description
  alt_text: String,           // Alt text for accessibility
  
  // Entity references (only one should be set)
  jurisdiction: ObjectId,     // Reference to Jurisdiction
  governing_body: ObjectId,   // Reference to GoverningBody
  office: ObjectId,           // Reference to Office
  position: ObjectId,         // Reference to Position
  
  // Metadata
  width: Number,              // Image width (if applicable)
  height: Number,             // Image height (if applicable)
  duration: Number,           // Duration for videos/audio
  
  is_primary: Boolean,        // Whether this is the primary media for the entity
  is_public: Boolean,         // Whether this media is publicly accessible
  
  uploaded_by: ObjectId,      // Reference to User who uploaded
  metadata: Map,              // Additional metadata
  timestamps: true
}
```

### Entity Updates

All government entities (Jurisdiction, GoverningBody, Office, Position) now include:

```javascript
{
  media: [ObjectId],          // Array of media references
  primary_media: ObjectId     // Reference to primary media
}
```

## API Endpoints

### Media Management

- `GET /api/media` - List all media with optional filtering
- `GET /api/media/:id` - Get specific media by ID
- `POST /api/media/upload` - Upload new media file
- `PUT /api/media/:id` - Update media metadata
- `DELETE /api/media/:id` - Delete media file and record
- `PUT /api/media/:id/set-primary` - Set media as primary for entity
- `GET /api/media/entity/:entityType/:entityId` - Get media for specific entity
- `POST /api/media/link` - Link existing media to entity
- `POST /api/media/unlink` - Unlink media from entity

### Upload Example

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('media_type', 'seal');
formData.append('title', 'Official State Seal');
formData.append('description', 'The official seal of the state');
formData.append('alt_text', 'Official state seal featuring state symbols');
formData.append('entity_type', 'jurisdiction');
formData.append('entity_id', 'jurisdiction_id_here');

const response = await fetch('/api/media/upload', {
  method: 'POST',
  body: formData
});
```

## Frontend Integration

### Media Browser

The Media Browser component provides:

- **Upload Interface**: Drag-and-drop or file picker for uploading media
- **Media Grid**: Visual display of all media with previews
- **Filtering**: Filter by entity type and specific entity
- **Management**: Set primary media, delete media, update metadata
- **Responsive Design**: Works on desktop and mobile devices

### Usage in Government Browser

1. Navigate to the Government Browser
2. Click on the "Media" tab
3. Use the upload button to add new media
4. Filter media by entity type and specific entity
5. Manage existing media (set primary, delete, etc.)

## File Storage

- **Upload Directory**: `server/uploads/media/`
- **Public URL Base**: `/uploads/media/`
- **File Naming**: `{media_type}_{timestamp}_{random}.{extension}`
- **Static Serving**: Files are served statically via Express

## Security Features

- **File Type Validation**: Only allowed file types can be uploaded
- **File Size Limits**: 10MB maximum file size
- **Access Control**: Media management requires authorization
- **Input Validation**: All inputs are validated before processing

## Image Processing

- **Automatic Dimensions**: Image dimensions are extracted automatically
- **Metadata Extraction**: File metadata is captured and stored
- **Format Support**: JPEG, PNG, and SVG images are supported

## Best Practices

1. **Use Descriptive Titles**: Provide meaningful titles for media files
2. **Include Alt Text**: Add alt text for accessibility
3. **Set Primary Media**: Designate primary media for each entity
4. **Organize by Type**: Use appropriate media types for categorization
5. **Regular Cleanup**: Remove unused or outdated media files

## Error Handling

The system includes comprehensive error handling for:

- Invalid file types
- File size limits
- Database errors
- File system errors
- Network issues
- Authorization failures

## Performance Considerations

- **Lazy Loading**: Media previews are loaded on demand
- **Pagination**: Large media collections are paginated
- **Caching**: Static files are served with appropriate headers
- **Optimization**: Images can be optimized during upload (future feature)

## Future Enhancements

- **Image Optimization**: Automatic image resizing and optimization
- **Thumbnail Generation**: Automatic thumbnail creation
- **Cloud Storage**: Integration with cloud storage providers
- **Advanced Search**: Full-text search across media metadata
- **Bulk Operations**: Bulk upload and management features
- **Version Control**: Media versioning and history tracking
