# File Upload System Documentation

## Overview

This is a comprehensive file upload system integrated with Twilio Conversations, designed to provide WhatsApp-like file sharing capabilities. The system supports multiple file types, automatic thumbnail generation, metadata tracking, and robust file management.

## Features

### ✅ Core Features

- **Multiple File Type Support**: Images, videos, audio, documents, archives
- **Automatic Organization**: Files are organized by type (images/, videos/, audio/, documents/, others/)
- **Thumbnail Generation**: Automatic thumbnail creation for images using Sharp
- **Metadata Tracking**: Comprehensive file metadata with search capabilities
- **Twilio Integration**: Seamless integration with Twilio Conversations API
- **Real-time Broadcasting**: File sharing with real-time updates via Socket.IO
- **File Validation**: Size limits, MIME type validation, and security checks
- **RESTful API**: Complete REST API for all file operations

### 📱 WhatsApp-like Features

- Upload multiple files at once
- Send messages with attached files
- View files by conversation
- Search files by type, tags, or uploader
- Automatic file organization
- Thumbnail preview for images
- Robust error handling

## API Endpoints

### 1. Upload Single File

**Endpoint:** `POST /api/files/upload/single`

**Content-Type:** `multipart/form-data`

**Request:**

```javascript
const formData = new FormData();
formData.append("file", fileInput.files[0]);
formData.append("conversationSid", "CHxxxxxxxxx");
formData.append("uploadedBy", "user123");
formData.append("description", "My file description");
formData.append("tags", "important,document,work");
```

**Response:**

```json
{
  "status": 200,
  "message": "File uploaded successfully",
  "data": {
    "id": "uuid-file-id",
    "originalName": "document.pdf",
    "fileName": "uuid-file-id.pdf",
    "url": "/api/files/documents/uuid-file-id.pdf",
    "mimeType": "application/pdf",
    "size": 1024000,
    "fileType": "document",
    "uploadedAt": "2025-12-18T10:30:00.000Z",
    "metadata": {
      "thumbnail": "/api/files/thumbnails/uuid.jpg" // for images
    }
  }
}
```

### 2. Upload Multiple Files

**Endpoint:** `POST /api/files/upload`

**Content-Type:** `multipart/form-data`

**Request:**

```javascript
const formData = new FormData();
formData.append("files", file1);
formData.append("files", file2);
formData.append("files", file3);
formData.append("conversationSid", "CHxxxxxxxxx");
formData.append("uploadedBy", "user123");
formData.append("tags", "batch,upload");
```

**Response:**

```json
{
  "status": 200,
  "message": "Files uploaded successfully",
  "data": {
    "uploadedFiles": [...], // Array of file objects
    "count": 3
  }
}
```

### 3. Send Message with Files

**Endpoint:** `POST /api/conversations/:convoSid/send-message-with-files`

**Content-Type:** `multipart/form-data`

**Request:**

```javascript
const formData = new FormData();
formData.append("files", file1);
formData.append("files", file2);
formData.append("body", "Check out these files! 📎");
formData.append("author", "user123");
```

**Response:**

```json
{
  "status": 200,
  "message": "Message with files sent successfully",
  "data": {
    "success": true,
    "message_sid": "IMxxxxxxxxx",
    "body": "Check out these files! 📎",
    "author": "user123",
    "date_created": "2025-12-18T10:30:00.000Z",
    "uploaded_files": [...], // Array of uploaded file objects
    "media_urls": ["http://localhost:3000/api/files/images/file1.jpg"]
  }
}
```

### 4. Get Files by Conversation

**Endpoint:** `GET /api/files/conversation/:conversationSid`

**Response:**

```json
{
  "status": 200,
  "message": "Files retrieved successfully",
  "data": {
    "files": [...], // Array of file objects
    "count": 5
  }
}
```

### 5. Search Files

**Endpoint:** `GET /api/files/search`

**Query Parameters:**

- `conversationSid`: Filter by conversation
- `uploadedBy`: Filter by uploader
- `fileType`: Filter by type (image, video, audio, document, other)
- `tags`: Comma-separated tags
- `limit`: Max results (default: 50)

**Example:** `GET /api/files/search?conversationSid=CHxxx&fileType=image&tags=important&limit=10`

### 6. Get File Metadata

**Endpoint:** `GET /api/files/metadata/:fileId`

**Response:**

```json
{
  "status": 200,
  "message": "File metadata retrieved successfully",
  "data": {
    "id": "uuid-file-id",
    "originalName": "image.jpg",
    "fileName": "uuid-file-id.jpg",
    "url": "/api/files/images/uuid-file-id.jpg",
    "mimeType": "image/jpeg",
    "size": 524288,
    "fileType": "image",
    "uploadedAt": "2025-12-18T10:30:00.000Z",
    "conversationSid": "CHxxxxxxxxx",
    "uploadedBy": "user123",
    "tags": ["photo", "vacation"],
    "description": "Beach photo from vacation",
    "metadata": {
      "width": 1920,
      "height": 1080,
      "thumbnail": "/api/files/thumbnails/uuid.jpg"
    }
  }
}
```

### 7. Serve/Download Files

**Endpoint:** `GET /api/files/:subDir/:fileName`

**Example:** `GET /api/files/images/uuid-file-id.jpg`

Returns the actual file with appropriate headers for caching and content type.

### 8. Delete File

**Endpoint:** `DELETE /api/files/:fileId`

**Response:**

```json
{
  "status": 200,
  "message": "File deleted successfully"
}
```

## Supported File Types

### Images

- JPEG, PNG, GIF, WebP, BMP, SVG
- Automatic thumbnail generation
- Metadata extraction (width, height)

### Videos

- MP4, MPEG, QuickTime, AVI, WebM
- Future: Video thumbnail generation with ffmpeg

### Audio

- MP3, WAV, OGG, AAC, WebM
- Future: Duration extraction

### Documents

- PDF, Word, Excel, PowerPoint
- Text files, CSV, JSON, XML

### Archives

- ZIP, RAR, 7Z

## File Organization Structure

```
uploads/
├── images/           # All image files
├── videos/           # All video files
├── audio/            # All audio files
├── documents/        # All document files
├── others/           # Other file types
├── thumbnails/       # Generated thumbnails
└── metadata.json     # File metadata storage
```

## Configuration

### Environment Variables

```env
BASE_URL=http://localhost:3000  # Your server base URL
```

### File Limits

- **Max File Size**: 100MB per file
- **Max Files per Upload**: 10 files
- **Thumbnail Size**: 300x300px (maintaining aspect ratio)

## Frontend Integration Examples

### HTML Form Upload

```html
<form id="fileUploadForm" enctype="multipart/form-data">
  <input type="file" id="fileInput" multiple accept="*/*" />
  <input type="text" id="conversationSid" placeholder="Conversation SID" />
  <input type="text" id="author" placeholder="Author" />
  <textarea id="message" placeholder="Message"></textarea>
  <button type="submit">Send with Files</button>
</form>
```

### JavaScript Upload

```javascript
document
  .getElementById("fileUploadForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData();
    const files = document.getElementById("fileInput").files;

    for (let file of files) {
      formData.append("files", file);
    }

    formData.append("body", document.getElementById("message").value);
    formData.append("author", document.getElementById("author").value);

    try {
      const response = await fetch(
        `/api/conversations/${conversationSid}/send-message-with-files`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();
      console.log("Files uploaded and message sent:", result);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  });
```

### React Integration

```jsx
import React, { useState } from "react";

const FileUpload = ({ conversationSid, author }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!files.length) return;

    setUploading(true);
    const formData = new FormData();

    files.forEach((file) => formData.append("files", file));
    formData.append("body", "Sharing files 📎");
    formData.append("author", author);

    try {
      const response = await fetch(
        `/api/conversations/${conversationSid}/send-message-with-files`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();
      console.log("Upload successful:", result);
      setFiles([]);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        multiple
        onChange={(e) => setFiles(Array.from(e.target.files))}
      />
      <button onClick={handleUpload} disabled={uploading || !files.length}>
        {uploading ? "Uploading..." : `Upload ${files.length} files`}
      </button>
    </div>
  );
};
```

## Error Handling

### Common Errors

```json
// File too large
{
  "status": 500,
  "message": "File size exceeds limit of 100MB"
}

// Invalid file type
{
  "status": 500,
  "message": "File type image/bmp is not allowed"
}

// No files uploaded
{
  "status": 400,
  "message": "No files uploaded"
}
```

### Frontend Error Handling

```javascript
try {
  const response = await fetch("/api/files/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  const result = await response.json();
  // Handle success
} catch (error) {
  // Handle specific errors
  if (error.message.includes("size exceeds")) {
    alert("File is too large. Maximum size is 100MB.");
  } else if (error.message.includes("not allowed")) {
    alert("File type not supported.");
  } else {
    alert("Upload failed: " + error.message);
  }
}
```

## Testing

Run the comprehensive test script:

```bash
node test-file-upload.js
```

This script tests all functionality including:

- Single and multiple file uploads
- Message sending with files
- File retrieval and search
- Metadata operations
- Error handling

## Security Considerations

1. **File Type Validation**: Only allowed MIME types are accepted
2. **Size Limits**: Prevents DoS attacks via large files
3. **File Storage**: Files are stored outside the web root
4. **Unique Names**: Files are renamed with UUIDs to prevent conflicts
5. **Path Traversal Protection**: File paths are validated
6. **Content Scanning**: Consider adding virus scanning for production

## Production Deployment

### Recommendations

1. **Storage**: Consider using cloud storage (AWS S3, Google Cloud Storage) for scalability
2. **CDN**: Use a CDN for faster file serving
3. **Database**: Move metadata from JSON file to a proper database
4. **Virus Scanning**: Implement file scanning before storage
5. **Backup**: Regular backup of uploaded files
6. **Monitoring**: Add file upload metrics and alerts

### Cloud Storage Integration Example

```javascript
// AWS S3 Integration (example)
import AWS from "aws-sdk";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

async function uploadToS3(file, fileName) {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const result = await s3.upload(params).promise();
  return result.Location;
}
```

This file upload system provides a robust, production-ready foundation for file sharing in your Twilio Conversations application with WhatsApp-like functionality.
