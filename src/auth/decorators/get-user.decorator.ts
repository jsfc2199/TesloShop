import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';

//el createParamDecorator espera un callback
export const GetUser = createParamDecorator(
  //siempre tebemos la data y el context
  (data: string, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest(); //extraemos la request del contexto
    const user = req.user; //extraemos el usuario de la request

    if (!user)
      throw new InternalServerErrorException('User not found in request');
    //TODO cuando la data sea un arreglo
    // const filteredUser: any = {};
    // console.log('usuario del request', user);
    // if (data) {
    //   for (const key of data) {
    //     console.log('key', key);
    //     if (key in user) {
    //       console.log('key in user', key);
    //       filteredUser[key] = user[key];
    //     }
    //   }
    // }
    // console.log(data);
    return !data ? user : user[data]; //si no nos envian data retornarmos todo el usaurio, caso contrario retornamos lo que corresponde a la data
  },
);
