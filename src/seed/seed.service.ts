import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService {
  constructor(
    private readonly productsService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async runSeed() {
    await this.deleteTables();
    const firstUser: User = await this.insertUsers();
    await this.insertNewProducts(firstUser);
    return 'seed executed';
  }

  //forma controlada de purgar la aplicacion antes de ejecutar el seed
  private async deleteTables() {
    await this.productsService.deleteAllProducts();

    const queryBuilder = this.userRepository.createQueryBuilder();
    //delete from user --> sin el where eliminamos todos los usuarios
    await queryBuilder.delete().where({}).execute();
  }

  private async insertUsers() {
    const seedUsers = initialData.users;

    const users: User[] = [];

    seedUsers.forEach((user) => {
      users.push(this.userRepository.create(user));
    });

    const dbUsers = await this.userRepository.save(seedUsers);
    return dbUsers[0]; //retornamos al menos un usuario que si tenga un id. No retornamos users[0] porque este no tiene el id y revienta el aplicativo
  }
  private async insertNewProducts(user: User) {
    await this.productsService.deleteAllProducts();

    //insertamos la informacion de forma masiva
    const seedProducts = initialData.products;

    const insertPromises = [];

    seedProducts.forEach((product) => {
      insertPromises.push(this.productsService.create(product, user)); //usamos el creat del propio servicio para reutilizar la lógica
    });

    await Promise.all(insertPromises); //esperamos a que todas las promesas se resuelvan. Hasta que no se cumplan no segura con la siguiente linea
    return true;
  }
}
