import { BadRequestException, Injectable } from '@nestjs/common';

import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {
  //buscamos el producto en nuestra carpeta static
  getStaticProductImage(imageName: string) {
    const path = join(__dirname, '../../static/products', imageName);
    if (!existsSync(path))
      throw new BadRequestException(`No product found with image ${imageName}`);

    return path;
  }
}
