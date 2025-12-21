// {
//   "topic": "kline.1.BTCUSDT",
//   "data": [
//   {
//     "start": 1766283360000,
//     "end": 1766283419999,
//     "interval": "1",
//     "open": "87963.9",
//     "close": "87957.7",
//     "high": "87963.9",
//     "low": "87955",
//     "volume": "3.448",
//     "turnover": "303279.135",
//     "confirm": false,
//     "timestamp": 1766283374344
//   }
// ],
//   "ts": 1766283374344,
//   "type": "snapshot",
//   "wsKey": "v5LinearPublic"
// }

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
