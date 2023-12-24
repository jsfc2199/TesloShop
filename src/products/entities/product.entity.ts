import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
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

  //tags
  //images
}
