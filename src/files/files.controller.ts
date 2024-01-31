import {
  Controller,
  FileTypeValidator,
  Get,
  Param,
  ParseFilePipe,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileNamer } from './helpers/fileNamer.helper';
import { Response } from 'express';

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
        destination: './static/products', //se sube al path que queremos
        filename: fileNamer,
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
    const secureURL = `${file.filename}`;
    return secureURL;
  }

  @Get('product/:imageName')
  findProductImage(
    @Param('imageName') imageName: string,
    //el decorador Res es delicado ya que puede romper toda la aplicación
    //con este decorador le indicamos a nest que nosotros emitiremos la respuesta de acuerdo a lo que necesitemos
    @Res() res: Response,
  ) {
    const path = this.filesService.getStaticProductImage(imageName);
    res.sendFile(path); //damos como respuesta en el endpoint directamente la imagen
  }
}
