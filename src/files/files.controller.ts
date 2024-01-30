import {
  Controller,
  FileTypeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  //usarlmente cargar archivos es un POST
  @Post('product')
  //especificamos en el fileInterceptor la clave que tendrá en postman
  @UseInterceptors(
    //usamos un interceptor para interceptar las solicitudes y mutar la respuesta
    FileInterceptor('file', {
      //guardamos el archivo en un espacio en memoria del proyecto
      storage: diskStorage({
        destination: './static/uploads', //se sube al path que queremos
      }),
    }),
  )
  uploadProductImage(
    @UploadedFile(
      //tambien se puede usar el ParseFilePipeBuilder como menciona la documentacion
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' })], //añadimos un pipe para las validaciones del formato de imagen que queremos
      }),
    )
    file: Express.Multer.File,
  ) {
    return file;
  }
}
