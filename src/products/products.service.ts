import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  /*
  usando el patron repositorio hacemos las interacciones a la base de datos
  esto esta creado por defecto por nest y typeOrm
  */

  private readonly logger = new Logger('ProductsService'); //creamos una propiedad dentro de la clase para imprimir mejor los errores

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>, //sirve para insertar, transacciones, rollbacks y mas
  ) {}
  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create(createProductDto); //se crea solo la instancia
      await this.productRepository.save(product); //guardarmos el registro en la base de datos
      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  findAll() {
    return `This action returns all products`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected Error, check server logs',
    );
  }
}
