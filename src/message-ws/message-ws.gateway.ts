import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
} from '@nestjs/websockets';
import { MessageWsService } from './message-ws.service';
import { Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class MessageWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly messageWsService: MessageWsService) {}
  handleConnection(client: Socket) {
    // console.log(client.id, 'cliente conectado');
    this.messageWsService.registerClient(client);
    console.log({ conectados: this.messageWsService.getConnectedClients() });
  }
  handleDisconnect(client: Socket) {
    // console.log(client.id, 'cliente desconectado');
    this.messageWsService.removeClient(client.id);
    console.log({ conectados: this.messageWsService.getConnectedClients() });
  }
}
