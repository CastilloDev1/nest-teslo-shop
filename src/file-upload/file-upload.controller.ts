import { BadRequestException, Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { Response } from 'express';
import { diskStorage } from 'multer';

import { fileFilter } from './helpers/fileFilter.helper';
import { fileNamer } from './helpers/fileNamer.helper';

import { FileUploadService } from './file-upload.service';
import { ConfigService } from '@nestjs/config';

@Controller('file-upload')
export class FileUploadController {
  constructor(
    private readonly fileUploadService: FileUploadService,
    private readonly configService: ConfigService
  ) {}

  @Get('product/:imagename')
  getProductImage(
    @Param('imagename') imageName: string,
    @Res() res: Response
  ){
    const path = this.fileUploadService.getProductImage(imageName);
    res.sendFile(path);
  }

  @Post('product')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter,
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer
    })
  }))
  fileUpload(@UploadedFile() file: Express.Multer.File){
    if( !file ) throw new BadRequestException('Make sure that the file is a image.');
    const secureUrl = `${ this.configService.get('HOST_API') }/files/product/${ file.filename }`;

    return secureUrl;
  }
}
