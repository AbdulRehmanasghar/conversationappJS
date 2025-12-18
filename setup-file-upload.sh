#!/bin/bash

echo "🚀 Setting up Robust File Upload System for Twilio Conversations..."

# Install dependencies
echo "📦 Installing required dependencies..."
npm install

# Create uploads directory structure
echo "📁 Creating uploads directory structure..."
mkdir -p uploads/images
mkdir -p uploads/videos
mkdir -p uploads/audio
mkdir -p uploads/documents
mkdir -p uploads/others
mkdir -p uploads/thumbnails

echo "✅ Directory structure created:"
echo "  uploads/"
echo "  ├── images/"
echo "  ├── videos/"
echo "  ├── audio/"
echo "  ├── documents/"
echo "  ├── others/"
echo "  └── thumbnails/"

# Set up environment variable for base URL
echo ""
echo "⚙️  Environment Setup:"
echo "Make sure to set BASE_URL in your .env file:"
echo "BASE_URL=http://localhost:3000"
echo ""

echo "📋 File Upload System Features:"
echo "• Multiple file type support (images, videos, audio, documents)"
echo "• Automatic thumbnail generation for images using Sharp"
echo "• File metadata tracking and search capabilities"
echo "• Integration with Twilio Conversations API"
echo "• WhatsApp-like file organization and management"
echo "• RESTful API for all file operations"
echo "• Real-time file sharing in conversations"
echo "• Robust error handling and validation"
echo ""

echo "🔧 API Endpoints Available:"
echo "• POST /api/files/upload/single - Upload single file"
echo "• POST /api/files/upload - Upload multiple files"
echo "• POST /api/conversations/:sid/send-message-with-files - Send message with files"
echo "• GET /api/files/conversation/:sid - Get files by conversation"
echo "• GET /api/files/search - Search files with filters"
echo "• GET /api/files/metadata/:id - Get file metadata"
echo "• GET /api/files/:subDir/:fileName - Serve/download files"
echo "• DELETE /api/files/:id - Delete file"
echo ""

echo "🧪 Testing:"
echo "Run 'node test-file-upload.js' to test all functionality"
echo ""

echo "✅ File Upload System setup complete!"
echo "Start your server with 'npm run start:dev' and test with the provided script."