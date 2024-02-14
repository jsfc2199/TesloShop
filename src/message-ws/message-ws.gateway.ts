import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessageWsService } from './message-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';

@WebSocketGateway({ cors: true })
export class MessageWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  //usamos este decorador para tener la informacion de todas las personas conectadas
  @WebSocketServer() webSocketServer: Server;

  constructor(private readonly messageWsService: MessageWsService) {}
  handleConnection(client: Socket) {
    // console.log(client.id, 'cliente conectado');
    this.messageWsService.registerClient(client);

    //enviar mensaje a todas las personas conectadas
    //el emit recibe un identificador y su payload
    this.webSocketServer.emit(
      'clients-updates',
      this.messageWsService.getConnectedClients(),
    );
  }
  handleDisconnect(client: Socket) {
    // console.log(client.id, 'cliente desconectado');
    this.messageWsService.removeClient(client.id);

    //emitimos el evento tambien para desconectar (el mismo evento)
    this.webSocketServer.emit(
      'clients-updates',
      this.messageWsService.getConnectedClients(),
    );
  }

  //al usar este decorador siempre tenemos dos propiedades, el cliente y el payload
  @SubscribeMessage('message-from-client')
  handleMessageFromClient(client: Socket, payload: NewMessageDto) {
    console.log(client.id);
    console.log(payload.message);
  }
}
