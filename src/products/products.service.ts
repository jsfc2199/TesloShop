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
import { DataSource, Repository } from 'typeorm';
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
    private readonly dataSource: DataSource, //con esto tenemos acceso a la coneccion como tal de la base de datos
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
    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true, //con el true indicamos "llena las imagenes al encontrar todo"
      },
    });

    return products.map((product) => {
      return {
        ...product,
        images: product.images.map((img) => img.url),
      };
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
      const queryBuilder = this.productRepository.createQueryBuilder('prod'); //añadimos el alias del producto
      product = await queryBuilder
        .where('UPPER(title) = :title or slug = :slug', {
          title: term.toUpperCase(),
          slug: term.toLocaleLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImages') //se colocan al menos dos alias, pero el que nos interesa es el primero
        .getOne();
    }

    if (!product)
      throw new NotFoundException(`Product with term: ${term} not found`);
    return product;
  }

  //helper para retornar las imagenes aplandas
  async findOnePlain(term: string) {
    const { images = [], ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: images.map((img) => img.url),
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    //trabajams imagenes y el producto de manera independiente
    const { images, ...toUpdate } = updateProductDto; //las imagenes pueden ser nulas

    //con preload buscamos el producto por un id y le cargamos las propieades del updateDto, es decir, lo modificamos en este paso
    const product = await this.productRepository.preload({
      id: id, //buscar por el id
      ...toUpdate, //coloca las propiedades del dto en este producto
    });

    if (!product)
      throw new NotFoundException(`Product with id: ${id} not found`);

    //si hay un producto evaluamos si hay imagenes (create query runner)
    const queryRunner = this.dataSource.createQueryRunner();

    //definimos los procedimientos que ejecutara el query runner (las transacciones que hará)
    await queryRunner.connect(); //1. conectamos a la base de datos
    await queryRunner.startTransaction(); //2.Indicamos que vamos a iniciar la transaccion

    //guardamos en la tabla
    try {
      //si images tiene info indica que debemos borrar las anteriores que teniamos
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id: id } }); //indicamos la entidad a eliminar, y el segundo parametro es el "where" es decir where id = id
        //creamos la instancia de las nuevas imagenes
        product.images = images.map((image) =>
          this.productImageRepository.create({ url: image }),
        );
      }
      //creamos la transaccion de guardar el producto
      await queryRunner.manager.save(product);

      //impatamos la base de datos con un commit
      await queryRunner.commitTransaction();

      await queryRunner.release(); //cerramos la conexión

      // await this.productRepository.save(product);
      //si tenemos imagenes pordemos usar el findOnePlain directamente porque no estamos borrando info
      return this.findOnePlain(id);
    } catch (error) {
      await queryRunner.rollbackTransaction(); //si hay un error hacemos rollback
      await queryRunner.release(); //cerramos la conexión
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

  //para el seed
  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product'); //product es el alias

    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
}
