import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { StreamPublisherPort } from '../../../domain/ports/out/stream-publisher.port';
import { PriceTick } from '../../../domain/entities/price-tick.entity';
import dotenv from 'dotenv';

@Injectable()
export class RedisStreamAdapter implements StreamPublisherPort {
  private redis: Redis;

  constructor() {
    dotenv.config();
    // redis://username:authpassword@127.0.0.1:6380/4
    const connectionUrl = `redis://${process.env.REDIS_USER || 'default'}:${process.env.REDIS_PASSWORD || 'my-secure-password'}@${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`;
    this.redis = new Redis(connectionUrl);
  }

  async publish(tick: PriceTick): Promise<void> {
    // Ej: LATEST_CANDLE:BINANCE:BTC-USDT
    const snapshotKey = `LATEST_CANDLE:${tick.source}:${tick.symbol}`;
    await this.redis.set(snapshotKey, JSON.stringify(tick));

    // Ej: updates:BTC-USDT
    const channelName = `updates:${tick.symbol}`;
    await this.redis.publish(channelName, JSON.stringify(tick));
  }
}
