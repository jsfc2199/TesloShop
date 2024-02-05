import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { User } from '../entities/user.entity';
import { JwtPayload } from '../interfaces/jwt.-payload.interface';

//expandimos del passport importado de acuerdo a la documentacion oficial de nest
//Generalmente solo con definir la clase y la extension es mas que suficiente ya que usa validaciones internas
//pero nosotros queremos implementar una forma de expandir la forma en que se valida un jason web token
export class JwtStrategy extends PassportStrategy(Strategy) {
  //usamos este método para validar nuestro payload
  //queremos que al tener el email del payload, obtener toda la información del usuario
  async validate(payload: JwtPayload): Promise<User> {
    const { email } = payload;
    return;
  }
}
