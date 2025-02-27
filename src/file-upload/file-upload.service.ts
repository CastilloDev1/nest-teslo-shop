import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FileUploadService {

  getProductImage(imageName){

    const path: string = join( __dirname, '../../static/products', imageName);
    if( !existsSync(path) ) throw new BadRequestException(`No product found with image ${ imageName }`);
    return path;

  }

  fileUpload(){
    return 'Hola mundo!';
  }

}
