import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { LoginUserDto, CreateUserDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10), //lo usamos para encriptar la contraseña
      });

      await this.userRepository.save(user);
      delete user.password; //lo borramos del retorno ya que no debemos de devolverlo
      return user;
      //TODO: retornar JWT de acceso
    } catch (error) {
      this.handleDBErrores(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true }, //solo traemos, al consular un usuario completo, el correo y contraseña
    });

    if (!user) {
      throw new UnauthorizedException('Not valid credentials (email)');
    }

    //comparamos la contraseña que nos viene con la del usuario en base de datos
    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Not valid credentials (password)');
    }
    return user;
    //TODO: Retornar JWT de acceso
  }

  private handleDBErrores(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    console.log(error);

    throw new InternalServerErrorException('Please check server logs');
  }
}
