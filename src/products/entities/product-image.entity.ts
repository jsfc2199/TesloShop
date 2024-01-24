import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class ProductImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  url: string;

  //Muchas imagenes estan asociadas a un producto
  @ManyToOne(() => Product, (product) => product.images)
  product: Product;
}
