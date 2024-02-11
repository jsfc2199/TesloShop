import { User } from 'src/auth/entities/user.entity';
import { ProductImage } from './product-image.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'products' })
export class Product {
  @ApiProperty({
    example: '1105e511-cbb6-49f7-b95b-7e757164753f',
    description: 'Product items',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'T shirt',
    description: 'Product title',
    uniqueItems: true,
  })
  @Column('text', {
    unique: true, //para que dos columnas no puedan tener un mismo titulo
  })
  title: string;

  @ApiProperty({
    example: 0,
    description: 'Product price',
  })
  @Column('float', {
    default: 0,
  })
  price: number;

  @ApiProperty({
    example: 'lorem impusm',
    description: 'Product description',
    default: null,
  })
  //otra sintaxis para el decorador colum es pasarle un objeto directamente
  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @ApiProperty({
    example: 't_shirt',
    description: 'Product slug',
    uniqueItems: true,
  })
  @Column('text', {
    unique: true,
  })
  slug: string;

  @ApiProperty({
    example: 10,
    description: 'Product stock',
    default: 0,
  })
  @Column('int', {
    default: 0,
  })
  stock: number;

  @ApiProperty({
    example: ['M', 'L', 'XL'],
    description: 'Product sizes',
  })
  @Column('text', {
    array: true,
  })
  sizes: string[];

  @ApiProperty({
    example: 'women',
    description: 'Product gender',
  })
  @Column('text')
  gender: string;

  @ApiProperty()
  @Column('text', {
    array: true,
    default: [],
  })
  tags: string[];

  @ApiProperty()
  //un producto tiene muchas images, por lo que se usa one to many
  //debemos especificar la relacion con el producto
  @OneToMany(
    () => ProductImage, //Indicamos que debe retornar un productImage
    (productImage) => productImage.product, //especificamos como se relaciona productImage con product (es decir inverso)
    { cascade: true, eager: true }, // cascade: sirve para que si eliminamos un producto, tambien eliminara las imagenes relacionadas, //eager permite que al usar un metodo fin tengamos las relaciones
  )
  images?: ProductImage[];

  //relacion producto - usuario
  @ManyToOne(
    () => User, //entidad con la que se relaciona
    (user) => user.product, //parametro con el que se relaciona
    { eager: true }, //para saber al consultar un producto, que usuairo lo creó
  )
  user: User;

  @BeforeInsert()
  checkSlugInsert() {
    if (!this.slug) this.slug = this.title;

    this.slug = this.slug.toLowerCase().replaceAll(' ', '_').replace("'", '');
  }

  @BeforeUpdate()
  checkSlugUpdate() {
    this.slug = this.slug.toLowerCase().replaceAll(' ', '_').replace("'", '');
  }
}
