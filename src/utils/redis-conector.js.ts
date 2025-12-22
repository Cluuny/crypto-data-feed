import { createClient } from 'redis';

export class RedisConector {
  public async start() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
    const client = createClient({
      username: 'default',
      password: 'wWJrwvMjZFOY33fvxrKF3Ad5fvisColV',
      socket: {
        host: 'redis-16895.crce196.sa-east-1-2.ec2.cloud.redislabs.com',
        port: 16895,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    client.on('error', (err) => console.log('Redis Client Error', err));

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    await client.connect();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    await client.set('foo', 'bar');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    const result = await client.get('foo');
    console.log(result); // >>> bar
  }
}

const redisC = new RedisConector();
void redisC.start();
