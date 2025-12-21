export interface RestClientConnectorPort {
  name: string;
  getKlines(symbols: string[], startTime: Date, endTime: Date): void;
}
