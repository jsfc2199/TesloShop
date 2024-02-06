import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';

//el createParamDecorator espera un callback
export const GetUser = createParamDecorator(
  //siempre tebemos la data y el context
  (data, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest(); //extraemos la request del contexto
    const user = req.user; //extraemos el usuario de la request

    if (!user)
      throw new InternalServerErrorException('User not found in request');

    return user;
  },
);
