import { Redis } from 'ioredis';
import { Injectable } from '@nestjs/common';
import { PriceTick } from '../../../domain/entities/price-tick.entity';
import { StreamPublisherPort } from '../../../domain/ports/out/stream-publisher.port';

@Injectable()
export class RedisStreamAdapter implements StreamPublisherPort {
  private redis = new Redis(); // Configuración de conexión

  async publish(tick: PriceTick): Promise<void> {
    // Publicar al canal que escuchará tu backend de Java o el Frontend
    await this.redis.publish('crypto-updates', JSON.stringify(tick));

    // Opcional: Guardar en Redis Stream para historial reciente
    await this.redis.xadd('crypto-stream', '*', 'data', JSON.stringify(tick));
  }
}
