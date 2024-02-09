import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
  constructor(private readonly productsService: ProductsService) {}
  async runSeed() {
    await this.insertNewProducts();
    return 'seed executed';
  }

  private async insertNewProducts() {
    await this.productsService.deleteAllProducts();

    //insertamos la informacion de forma masiva
    const seedProducts = initialData.products;

    const insertPromises = [];
    //TODO: IMPLEMENTAR CORRECCION
    // seedProducts.forEach((product) => {
    //   insertPromises.push(this.productsService.create(product)); //usamos el creat del propio servicio para reutilizar la lógica
    // });

    await Promise.all(insertPromises); //esperamos a que todas las promesas se resuelvan. Hasta que no se cumplan no segura con la siguiente linea
    return true;
  }
}
