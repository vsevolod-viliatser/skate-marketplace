import { BadRequestException, Injectable } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuid } from 'uuid';

@Injectable()
export class FileUploadService {
  private readonly uploadPath = 'uploads';
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  private readonly allowedImageTypes = /jpeg|jpg|png|gif|webp/;

  constructor() {
    // Ensure upload directory exists
    if (!existsSync(this.uploadPath)) {
      mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  getMulterOptions(subfolder: string = 'general'): MulterOptions {
    const uploadDir = join(this.uploadPath, subfolder);

    // Ensure subfolder exists
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    return {
      storage: diskStorage({
        destination: uploadDir,
        filename: (req, file, callback) => {
          const uniqueSuffix = `${uuid()}${extname(file.originalname)}`;
          callback(null, uniqueSuffix);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (
          this.allowedImageTypes.test(extname(file.originalname).toLowerCase())
        ) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException(
              'Only image files (jpeg, jpg, png, gif, webp) are allowed!',
            ),
            false,
          );
        }
      },
      limits: {
        fileSize: this.maxFileSize,
      },
    };
  }

  getAvatarUploadOptions(): MulterOptions {
    return this.getMulterOptions('avatars');
  }

  getProductImageUploadOptions(): MulterOptions {
    return this.getMulterOptions('products');
  }

  getReviewImageUploadOptions(): MulterOptions {
    return this.getMulterOptions('reviews');
  }

  generateFileUrl(filename: string, subfolder: string = 'general'): string {
    return `/uploads/${subfolder}/${filename}`;
  }

  validateImageFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (
      !this.allowedImageTypes.test(extname(file.originalname).toLowerCase())
    ) {
      throw new BadRequestException(
        'Invalid file type. Only images are allowed.',
      );
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        'File size too large. Maximum size is 5MB.',
      );
    }
  }
}
