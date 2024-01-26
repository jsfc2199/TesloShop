import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity({ name: 'product_images' })
export class ProductImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  url: string;

  //Muchas imagenes estan asociadas a un producto
  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: 'CASCADE', //lo declaramos para borrar en casacada las imagenes de un producto si eliminamos el mismo
  })
  product: Product;
}
