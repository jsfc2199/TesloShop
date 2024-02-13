import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

interface ConnectedClientes {
  //id será tipo string cuando llegue y luego este mismo es un socket que es lo que estamos trabajando
  /*
  Lucirá algo como 
  {
    'sdfsdfsfsdwerwqere': socket,
  }
  lo primero es el id, y lo segundo el socket correspondiente a ese id
  */
  [id: string]: Socket;
}
@Injectable()
export class MessageWsService {
  private connectedClientes: ConnectedClientes = {};
  registerClient(client: Socket) {
    //indicamos en la lista de clientes conectados en la posicion del cliente que llegue que será igual al socket de ese cliente
    this.connectedClientes[client.id] = client;
  }

  removeClient(clientId: string) {
    delete this.connectedClientes[clientId];
  }

  getConnectedClients(): number {
    return Object.keys(this.connectedClientes).length;
  }
}
