import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { MarketHistoryRepositoryPort } from '../../domain/ports/out/market-history-repository.port';
import { RestClientConnectorPort } from '../../domain/ports/in/rest-client.connector.port';

@Injectable()
export class BackfillMarketDataUseCase implements OnModuleInit {
  constructor(
    @Inject('EXCHANGE_REST_CLIENTS')
    private readonly restClientList: RestClientConnectorPort[],
    private readonly historyRepo: MarketHistoryRepositoryPort,
  ) {}
  async onModuleInit() {
    const lastTick = await this.historyRepo.findLast();
    const now = new Date();

    if (lastTick) {
      console.log(
        `Último dato: ${lastTick[0].time.toISOString()}. Iniciando descarga hasta AHORA...`,
      );
      this.downloadRange(lastTick[0].time, now);
    }
  }

  downloadRange(lastTickDate: Date, now: Date) {
    console.log(
      `Descargando rango [${lastTickDate.toISOString()} - ${now.toISOString()}]`,
    );
    this.restClientList.forEach((client: RestClientConnectorPort) => {
      void client.getKlines(['BTC-USDT'], lastTickDate, now);
    });
  }

  // // 1. EL GRAN EMPALME (Bloque B -> C)
  // const lastTick =
  // const now = new Date();
  //
  // if (lastTick) {
  //   console.log(`Último dato: ${lastTick.time}. Iniciando descarga hasta AHORA...`);
  //   // Descarga desde lastTick hasta now
  //   // Gracias al .orIgnore(), cuando llegue a los datos que el Ingest ya metió, no pasa nada.
  //   await this.downloadRange(lastTick.time, now);
  // }
  //
  // // 2. (OPCIONAL) EL REPARADOR (Bloque A)
  // // Podrías correr esto periódicamente o al inicio
  // const gaps = await this.historyRepo.findInternalGaps('7 days'); // Lógica personalizada
  // for (const gap of gaps) {
  //   console.log(`Reparando hueco interno: ${gap.start} - ${gap.end}`);
  //   await this.downloadRange(gap.start, gap.end);
  // }
}
