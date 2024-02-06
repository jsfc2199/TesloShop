import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../entities/user.entity';
import { JwtPayload } from '../interfaces/jwt.-payload.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';

//expandimos del passport importado de acuerdo a la documentacion oficial de nest
//Generalmente solo con definir la clase y la extension es mas que suficiente ya que usa validaciones internas
//pero nosotros queremos implementar una forma de expandir la forma en que se valida un jason web token
@Injectable() //se usa el decorador ya que las strategy generalmente son providers
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), //otenemos el token como bearer token de postman
    });
  }
  //usamos este método para validar nuestro payload
  //queremos que al tener el email del payload, obtener toda la información del usuario
  //este metodo se usara si el token no ha expirado y si la firma del jwt hace match con el payload
  async validate(payload: JwtPayload): Promise<User> {
    const { id } = payload;

    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new UnauthorizedException('Token not valid');
    if (!user.isActive) throw new UnauthorizedException('Inactive userd');
    return user;
  }
}
