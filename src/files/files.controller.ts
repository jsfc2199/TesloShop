import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  //usarlmente cargar archivos es un POST
  @Post('product')
  //especificamos en el fileInterceptor la clave que tendrá en postman
  @UseInterceptors(FileInterceptor('file')) //usamos un interceptor para interceptar las solicitudes y mutar la respuesta
  uploadProductImage(@UploadedFile() file: Express.Multer.File) {
    return file;
  }
}
