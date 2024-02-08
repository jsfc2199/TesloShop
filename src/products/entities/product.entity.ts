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

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    unique: true, //para que dos columnas no puedan tener un mismo titulo
  })
  title: string;

  @Column('float', {
    default: 0,
  })
  price: number;

  //otra sintaxis para el decorador colum es pasarle un objeto directamente
  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column('text', {
    unique: true,
  })
  slug: string;

  @Column('int', {
    default: 0,
  })
  stock: number;

  @Column('text', {
    array: true,
  })
  sizes: string[];

  @Column('text')
  gender: string;

  @Column('text', {
    array: true,
    default: [],
  })
  tags: string[];

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
