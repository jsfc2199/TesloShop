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
import { ProductImage } from './entities';

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
    @InjectRepository(ProductImage) //este dato no debemos olvidar cambiarlo
    private readonly productImageRepository: Repository<ProductImage>, //añadimos el repositorio para las imagenes y crear instancias
  ) {}
  async create(createProductDto: CreateProductDto) {
    try {
      const { images = [], ...productDetails } = createProductDto; //desestructuramos el DTO
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map((image) =>
          this.productImageRepository.create({ url: image }),
        ),
      }); //se crea solo la instancia junto con las imagenes
      await this.productRepository.save(product); //guardarmos el registro en la base de datos tanto del producto como las imagenes
      return { ...product, images: images };
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
      // product = await this.productRepository.findOneBy({
      //   slug: term,
      // });
      const queryBuilder = this.productRepository.createQueryBuilder();
      product = await queryBuilder
        .where('UPPER(title) = :title or slug = :slug', {
          title: term.toUpperCase(),
          slug: term.toLocaleLowerCase(),
        })
        .getOne();
    }

    if (!product)
      throw new NotFoundException(`Product with term: ${term} not found`);
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    //con preload buscamos el producto por un id y le cargamos las propieades del updateDto, es decir, lo modificamos en este paso
    const product = await this.productRepository.preload({
      id: id, //buscar por el id
      ...updateProductDto, //coloca las propiedades del dto en este producto
      images: [],
    });

    if (!product)
      throw new NotFoundException(`Product with id: ${id} not found`);

    //guardamos en la tabla
    try {
      await this.productRepository.save(product);
    } catch (error) {
      this.handleDBExceptions(error);
    }

    return product;
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
