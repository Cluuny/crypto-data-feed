export class BybitWsreponseDto {
  topic: string;
  data: {
    start: number;
    end: number;
    interval: string;
    open: string;
    close: string;
    high: string;
    low: string;
    volume: string;
    turnover: string;
    confirm: boolean;
    timestamp: number;
  }[];
  ts: number;
  type: string;
  wsKey: string;
}
