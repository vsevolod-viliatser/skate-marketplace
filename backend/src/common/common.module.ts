import { Global, Module } from '@nestjs/common';
import { FileUploadService } from './services/file-upload.service';
import { LoggerService } from './services/logger.service';

@Global()
@Module({
  providers: [FileUploadService, LoggerService],
  exports: [FileUploadService, LoggerService],
})
export class CommonModule {}
