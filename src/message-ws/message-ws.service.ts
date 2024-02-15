import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

interface ConnectedClientes {
  //id será tipo string cuando llegue y luego este mismo es un socket que es lo que estamos trabajando
  /*
  Lucirá algo como 
  {
    'sdfsdfsfsdwerwqere': socket,
  }
  lo primero es el id, y lo segundo el socket correspondiente a ese id
  */
  //! añadimos que no solo tenga el socket(cliente) sino tambien el usuario
  [id: string]: {
    socket: Socket;
    user: User;
  };
}
@Injectable()
export class MessageWsService {
  private connectedClientes: ConnectedClientes = {};

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async registerClient(client: Socket, userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new Error('User not found');
    if (!user.isActive) throw new Error('User not active');

    //indicamos en la lista de clientes conectados en la posicion del cliente que llegue que será igual al socket de ese cliente
    this.connectedClientes[client.id] = {
      socket: client,
      user: user,
    };
  }

  removeClient(clientId: string) {
    delete this.connectedClientes[clientId];
  }

  //cambiamos el retorno para manejar solo los ids
  getConnectedClients(): string[] {
    return Object.keys(this.connectedClientes);
  }
}
