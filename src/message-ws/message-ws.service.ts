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

    this.checkUserConnection(user);
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

  //de la lista de clientes conectados devolvemos el nombre de la posicion del id que queremos
  getUserFullNameBySocketId(socketId: string) {
    return this.connectedClientes[socketId].user.fullName;
  }

  //! vamos a suponer en este aplicativo que un usuario no requiere tener 2 o mas isntancias, aunque es relativo
  private checkUserConnection(user: User) {
    for (const clientId of Object.keys(this.connectedClientes)) {
      const connectedClient = this.connectedClientes[clientId];
      if (connectedClient.user.id === user.id) {
        connectedClient.socket.disconnect();
        break;
      }
    }
  }
}
