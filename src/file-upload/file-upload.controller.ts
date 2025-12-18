import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  UploadedFiles,
  UploadedFile,
  UseInterceptors,
  Body,
  Res,
  HttpException,
  HttpStatus,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from "@nestjs/common";
import { FilesInterceptor, FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import * as path from "path";
import { FileUploadService, FileMetadata } from "./file-upload.service";

@Controller("files")
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post("upload")
  @UseInterceptors(FilesInterceptor("files", 10)) // Max 10 files
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body()
    body: {
      conversationSid: string;
      uploadedBy: string;
      messageSid?: string;
      tags?: string;
      description?: string;
    }
  ) {
    try {
      if (!files || files.length === 0) {
        throw new HttpException("No files uploaded", HttpStatus.BAD_REQUEST);
      }

      const metadata: FileMetadata = {
        conversationSid: body.conversationSid,
        uploadedBy: body.uploadedBy,
        messageSid: body.messageSid,
        tags: body.tags ? body.tags.split(",").map((tag) => tag.trim()) : [],
        description: body.description,
      };

      const results = await this.fileUploadService.uploadMultipleFiles(
        files,
        metadata
      );

      return {
        status: 200,
        message: "Files uploaded successfully",
        data: {
          uploadedFiles: results,
          count: results.length,
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 500,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("upload/single")
  @UseInterceptors(FileInterceptor("file"))
  async uploadSingleFile(
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: {
      conversationSid: string;
      uploadedBy: string;
      messageSid?: string;
      tags?: string;
      description?: string;
    }
  ) {
    try {
      if (!file) {
        throw new HttpException("No file uploaded", HttpStatus.BAD_REQUEST);
      }

      const metadata: FileMetadata = {
        conversationSid: body.conversationSid,
        uploadedBy: body.uploadedBy,
        messageSid: body.messageSid,
        tags: body.tags ? body.tags.split(",").map((tag) => tag.trim()) : [],
        description: body.description,
      };

      const result = await this.fileUploadService.uploadFile(file, metadata);

      return {
        status: 200,
        message: "File uploaded successfully",
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 500,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("conversation/:conversationSid")
  async getFilesByConversation(
    @Param("conversationSid") conversationSid: string
  ) {
    try {
      const files =
        await this.fileUploadService.getFilesByConversation(conversationSid);

      return {
        status: 200,
        message: "Files retrieved successfully",
        data: {
          files,
          count: files.length,
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 500,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("metadata/:fileId")
  async getFileMetadata(@Param("fileId") fileId: string) {
    try {
      const metadata = await this.fileUploadService.getFileMetadata(fileId);

      if (!metadata) {
        throw new HttpException("File not found", HttpStatus.NOT_FOUND);
      }

      return {
        status: 200,
        message: "File metadata retrieved successfully",
        data: metadata,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: error.status || 500,
          message: error.message,
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(":subDir/:fileName")
  async serveFile(
    @Param("subDir") subDir: string,
    @Param("fileName") fileName: string,
    @Res() res: Response
  ) {
    try {
      if (!this.fileUploadService.fileExists(subDir, fileName)) {
        throw new HttpException("File not found", HttpStatus.NOT_FOUND);
      }

      const filePath = this.fileUploadService.getFilePath(subDir, fileName);

      // Set appropriate headers
      res.setHeader("Cache-Control", "public, max-age=31536000"); // Cache for 1 year
      res.sendFile(path.resolve(filePath));
    } catch (error) {
      throw new HttpException(
        {
          status: error.status || 500,
          message: error.message,
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(":fileId")
  async deleteFile(@Param("fileId") fileId: string) {
    try {
      const success = await this.fileUploadService.deleteFile(fileId);

      if (!success) {
        throw new HttpException(
          "File not found or could not be deleted",
          HttpStatus.NOT_FOUND
        );
      }

      return {
        status: 200,
        message: "File deleted successfully",
      };
    } catch (error) {
      throw new HttpException(
        {
          status: error.status || 500,
          message: error.message,
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("search")
  async searchFiles(
    @Query("conversationSid") conversationSid?: string,
    @Query("uploadedBy") uploadedBy?: string,
    @Query("fileType") fileType?: string,
    @Query("tags") tags?: string,
    @Query("limit") limit?: string
  ) {
    try {
      // This is a basic implementation - you might want to implement more sophisticated search
      let files = [];

      if (conversationSid) {
        files =
          await this.fileUploadService.getFilesByConversation(conversationSid);
      } else {
        // Implement global search logic here if needed
        files = [];
      }

      // Apply additional filters
      if (uploadedBy) {
        files = files.filter((file: any) => file.uploadedBy === uploadedBy);
      }

      if (fileType) {
        files = files.filter((file: any) => file.fileType === fileType);
      }

      if (tags) {
        const searchTags = tags
          .split(",")
          .map((tag) => tag.trim().toLowerCase());
        files = files.filter(
          (file: any) =>
            file.tags &&
            file.tags.some((tag: string) =>
              searchTags.includes(tag.toLowerCase())
            )
        );
      }

      // Apply limit
      const limitNum = limit ? parseInt(limit, 10) : 50;
      files = files.slice(0, limitNum);

      return {
        status: 200,
        message: "Files retrieved successfully",
        data: {
          files,
          count: files.length,
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 500,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
