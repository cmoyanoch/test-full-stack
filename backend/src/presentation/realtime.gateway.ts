import 'dotenv/config';

import { getSocketIoCorsConfig } from '../config/cors-config';
import { appLog } from './logging/structured-log';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  FavoriteSocketPayload,
  IRealtimeNotifierPort,
} from '../application/ports/realtime-notifier.port';
import { clientRoomName, resolveClientId } from './client-id';

@WebSocketGateway({
  cors: getSocketIoCorsConfig(),
})
export class RealtimeGateway
  implements
    OnGatewayConnection,
    OnGatewayDisconnect,
    IRealtimeNotifierPort
{
  @WebSocketServer() server!: Server;

  handleConnection(client: Socket) {
    const raw =
      (client.handshake.auth as { clientId?: string } | undefined)
        ?.clientId ??
      (typeof client.handshake.query.clientId === 'string'
        ? client.handshake.query.clientId
        : undefined);
    const clientId = resolveClientId(raw);
    void client.join(clientRoomName(clientId));
    appLog('log', 'Socket', 'client connected', {
      clientId,
      clientIdSocket: client.id,
    });
  }

  handleDisconnect(client: Socket) {
    appLog('log', 'Socket', 'client disconnected', { clientIdSocket: client.id });
  }

  notifyFavoriteAdded(payload: FavoriteSocketPayload): void {
    appLog('log', 'Socket', 'emit favorite:added', {
      event: 'favorite:added',
      clientId: payload.clientId,
      favoriteId: payload.favoriteId,
      pokemonId: payload.pokemonId,
    });
    this.server
      .to(clientRoomName(payload.clientId))
      .emit('favorite:added', payload);
  }

  notifyFavoriteRemoved(
    payload: Pick<
      FavoriteSocketPayload,
      'clientId' | 'favoriteId' | 'pokemonId'
    >,
  ): void {
    appLog('log', 'Socket', 'emit favorite:removed', {
      event: 'favorite:removed',
      clientId: payload.clientId,
      favoriteId: payload.favoriteId,
      pokemonId: payload.pokemonId,
    });
    this.server
      .to(clientRoomName(payload.clientId))
      .emit('favorite:removed', payload);
  }

  notifyFavoriteUpdated(payload: FavoriteSocketPayload): void {
    appLog('log', 'Socket', 'emit favorite:updated', {
      event: 'favorite:updated',
      clientId: payload.clientId,
      favoriteId: payload.favoriteId,
      pokemonId: payload.pokemonId,
    });
    this.server
      .to(clientRoomName(payload.clientId))
      .emit('favorite:updated', payload);
  }
}
