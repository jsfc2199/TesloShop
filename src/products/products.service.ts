import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { validate as isUUID } from 'uuid';

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

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return await this.productRepository.find({
      take: limit,
      skip: offset,
      //TODO: Relaciones
    });
  }

  async findOne(term: string) {
    let product: Product;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({
        id: term,
      });
    } else {
      product = await this.productRepository.findOneBy({
        slug: term,
      });
    }

    if (!product)
      throw new NotFoundException(`Product with term: ${term} not found`);
    return product;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected Error, check server logs',
    );
  }
}
