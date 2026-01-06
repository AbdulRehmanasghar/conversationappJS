import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as fs from "fs";
import * as path from "path";
import * as uuid from "uuid";
import * as sharp from "sharp";
import * as mime from "mime-types";

export interface FileUploadResult {
  id: string;
  originalName: string;
  fileName: string;
  filePath: string;
  url: string;
  mimeType: string;
  size: number;
  fileType: "image" | "video" | "audio" | "document" | "other";
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    thumbnail?: string;
  };
  uploadedAt: Date;
}

export interface FileMetadata {
  conversationSid: string;
  messageSid?: string;
  uploadedBy: string;
  tags?: string[];
  description?: string;
}

@Injectable()
export class FileUploadService {
  private readonly uploadsDir: string;
  private readonly thumbnailsDir: string;
  private readonly maxFileSize = 100 * 1024 * 1024; // 100MB
  private readonly allowedMimeTypes = [
    // Images
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/bmp",
    "image/svg+xml",
    // Videos
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
    "video/x-msvideo",
    "video/webm",
    // Audio
    "audio/mpeg",
    "audio/wav",
    "audio/ogg",
    "audio/mp4",
    "audio/x-m4a",
    "audio/m4a",
    "audio/aac",
    "audio/webm",
    // Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/csv",
    "application/json",
    "application/xml",
    // Archives
    "application/zip",
    "application/x-rar-compressed",
    "application/x-7z-compressed",
  ];

  constructor(private configService: ConfigService) {
    this.uploadsDir = path.join(process.cwd(), "uploads");
    this.thumbnailsDir = path.join(this.uploadsDir, "thumbnails");
    this.ensureDirectoriesExist();
  }

  private ensureDirectoriesExist(): void {
    [this.uploadsDir, this.thumbnailsDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    // Create subdirectories for organization
    const subDirs = ["images", "videos", "audio", "documents", "others"];
    subDirs.forEach((subDir) => {
      const fullPath = path.join(this.uploadsDir, subDir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    metadata: FileMetadata
  ): Promise<FileUploadResult> {
    // Validate file
    this.validateFile(file);

    const fileId = uuid.v4();
    const fileType = this.determineFileType(file.mimetype);
    const fileExtension =
      path.extname(file.originalname) ||
      this.getExtensionFromMimeType(file.mimetype);
    const fileName = `${fileId}${fileExtension}`;
    const subDir = this.getSubDirectory(fileType);
    const filePath = path.join(this.uploadsDir, subDir, fileName);
    // Public URL served from the static uploads folder
    const url = `/uploads/${subDir}/${fileName}`;

    // Save file
    fs.writeFileSync(filePath, file.buffer);

    // Create result object
    const result: FileUploadResult = {
      id: fileId,
      originalName: file.originalname,
      fileName,
      filePath,
      url,
      mimeType: file.mimetype,
      size: file.size,
      fileType,
      uploadedAt: new Date(),
    };

    // Generate additional metadata based on file type
    if (fileType === "image") {
      result.metadata = await this.processImage(filePath);
    } else if (fileType === "video") {
      result.metadata = await this.processVideo(filePath);
    }

    // Store metadata
    await this.storeFileMetadata(fileId, metadata, result);

    return result;
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    metadata: FileMetadata
  ): Promise<FileUploadResult[]> {
    const results: FileUploadResult[] = [];

    for (const file of files) {
      try {
        const result = await this.uploadFile(file, metadata);
        results.push(result);
      } catch (error) {
        console.error(`Failed to upload file ${file.originalname}:`, error);
        // Continue with other files
      }
    }

    return results;
  }

  private validateFile(file: Express.Multer.File): void {
    if (!file) throw new Error("No file provided");

    if (file.size > this.maxFileSize) {
      throw new Error(
        `File size exceeds limit of ${this.maxFileSize / 1024 / 1024}MB`
      );
    }

    // Some clients (mobile pickers) upload with a generic content-type
    // `application/octet-stream`. Try to detect from filename extension
    // and accept when it maps to an allowed MIME type.
    let detectedMime: string | false = file.mimetype || false;

    if (!detectedMime || detectedMime === "application/octet-stream") {
      const lookup = mime.lookup(file.originalname || "") as string | false;
      if (lookup) detectedMime = lookup;
      else {
        const ext = path.extname(file.originalname || "").toLowerCase();
        const extMap: Record<string, string> = {
          ".jpg": "image/jpeg",
          ".jpeg": "image/jpeg",
          ".png": "image/png",
          ".gif": "image/gif",
          ".webp": "image/webp",
          ".bmp": "image/bmp",
          ".mp4": "video/mp4",
          ".mov": "video/quicktime",
          ".avi": "video/x-msvideo",
          ".mp3": "audio/mpeg",
          ".wav": "audio/wav",
          ".m4a": "audio/mp4",
          ".pdf": "application/pdf",
        };

        if (ext && extMap[ext]) detectedMime = extMap[ext];
      }
    }

    if (!detectedMime) {
      throw new Error(
        `Could not determine file MIME type for ${file.originalname}`
      );
    }

    if (!this.allowedMimeTypes.includes(detectedMime as string)) {
      throw new Error(`File type ${detectedMime} is not allowed`);
    }

    // Normalize the file mimetype for downstream processing
    (file as any).mimetype = detectedMime;
  }

  private determineFileType(
    mimeType: string
  ): "image" | "video" | "audio" | "document" | "other" {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "audio";
    if (
      mimeType.includes("pdf") ||
      mimeType.includes("document") ||
      mimeType.includes("sheet") ||
      mimeType.includes("presentation") ||
      mimeType.includes("text/")
    )
      return "document";
    return "other";
  }

  private getSubDirectory(fileType: string): string {
    switch (fileType) {
      case "image":
        return "images";
      case "video":
        return "videos";
      case "audio":
        return "audio";
      case "document":
        return "documents";
      default:
        return "others";
    }
  }

  private getExtensionFromMimeType(mimeType: string): string {
    const ext = mime.extension(mimeType);
    return ext ? `.${ext}` : "";
  }

  private async processImage(filePath: string): Promise<any> {
    try {
      const image = sharp(filePath);
      const metadata = await image.metadata();

      // Generate thumbnail
      const thumbnailId = uuid.v4();
      const thumbnailPath = path.join(this.thumbnailsDir, `${thumbnailId}.jpg`);

      await image
        .resize(300, 300, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);

      return {
        width: metadata.width,
        height: metadata.height,
        thumbnail: `/uploads/thumbnails/${thumbnailId}.jpg`,
      };
    } catch (error) {
      console.error("Error processing image:", error);
      return {};
    }
  }

  private async processVideo(filePath: string): Promise<any> {
    // For video processing, you might want to use ffmpeg
    // For now, return basic metadata
    return {
      // You can add video duration, thumbnail generation using ffmpeg here
    };
  }

  private async storeFileMetadata(
    fileId: string,
    metadata: FileMetadata,
    result: FileUploadResult
  ): Promise<void> {
    // Store in a JSON file for now (you can replace with database)
    const metadataPath = path.join(this.uploadsDir, "metadata.json");

    let existingMetadata: any = {};
    if (fs.existsSync(metadataPath)) {
      const content = fs.readFileSync(metadataPath, "utf8");
      existingMetadata = JSON.parse(content);
    }

    existingMetadata[fileId] = {
      ...metadata,
      ...result,
    };

    fs.writeFileSync(metadataPath, JSON.stringify(existingMetadata, null, 2));
  }

  async getFileMetadata(fileId: string): Promise<any> {
    const metadataPath = path.join(this.uploadsDir, "metadata.json");

    if (!fs.existsSync(metadataPath)) {
      return null;
    }

    const content = fs.readFileSync(metadataPath, "utf8");
    const metadata = JSON.parse(content);
    return metadata[fileId] || null;
  }

  async updateFileMetadata(
    fileId: string,
    updates: Record<string, any>
  ): Promise<any> {
    const metadataPath = path.join(this.uploadsDir, "metadata.json");
    if (!fs.existsSync(metadataPath)) return null;

    const content = fs.readFileSync(metadataPath, "utf8");
    const allMetadata = JSON.parse(content);
    if (!allMetadata[fileId]) return null;

    allMetadata[fileId] = {
      ...allMetadata[fileId],
      ...updates,
    };

    fs.writeFileSync(metadataPath, JSON.stringify(allMetadata, null, 2));
    return allMetadata[fileId];
  }

  async getFilesByConversation(conversationSid: string): Promise<any[]> {
    const metadataPath = path.join(this.uploadsDir, "metadata.json");

    if (!fs.existsSync(metadataPath)) {
      return [];
    }

    const content = fs.readFileSync(metadataPath, "utf8");
    const metadata = JSON.parse(content);

    return Object.values(metadata).filter(
      (file: any) => file.conversationSid === conversationSid
    );
  }

  async getFilesByMessageSid(messageSid: string): Promise<any[]> {
    if (!messageSid) return [];
    const metadataPath = path.join(this.uploadsDir, "metadata.json");
    if (!fs.existsSync(metadataPath)) return [];

    const content = fs.readFileSync(metadataPath, "utf8");
    const metadata = JSON.parse(content);

    return Object.values(metadata).filter(
      (file: any) => file.messageSid && file.messageSid === messageSid
    );
  }

  async deleteFile(fileId: string): Promise<boolean> {
    try {
      const metadata = await this.getFileMetadata(fileId);
      if (!metadata) {
        return false;
      }

      // Delete the actual file
      if (fs.existsSync(metadata.filePath)) {
        fs.unlinkSync(metadata.filePath);
      }

      // Delete thumbnail if exists
      if (metadata.metadata?.thumbnail) {
        // Convert thumbnail URL (/uploads/thumbnails/xx.jpg) to a filesystem path
        const thumbnailPath = path.join(
          process.cwd(),
          metadata.metadata.thumbnail.replace(/^\//, "")
        );
        if (fs.existsSync(thumbnailPath)) {
          fs.unlinkSync(thumbnailPath);
        }
      }

      // Remove from metadata
      const metadataPath = path.join(this.uploadsDir, "metadata.json");
      const content = fs.readFileSync(metadataPath, "utf8");
      const allMetadata = JSON.parse(content);
      delete allMetadata[fileId];
      fs.writeFileSync(metadataPath, JSON.stringify(allMetadata, null, 2));

      return true;
    } catch (error) {
      console.error("Error deleting file:", error);
      return false;
    }
  }

  getFilePath(subDir: string, fileName: string): string {
    return path.join(this.uploadsDir, subDir, fileName);
  }

  fileExists(subDir: string, fileName: string): boolean {
    const filePath = this.getFilePath(subDir, fileName);
    return fs.existsSync(filePath);
  }
}
