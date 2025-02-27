import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileUploadController } from './file-upload.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [FileUploadController],
  providers: [FileUploadService],
  imports: [ ConfigModule ]
})
export class FileUploadModule {}
