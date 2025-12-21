export class GateioWsreponseDto {
  time: string;
  time_ms: string;
  channel: string;
  event: string;
  result: {
    t: string;
    v: string;
    c: string;
    h: string;
    l: string;
    o: string;
    n: string;
    a: string;
    w: string;
  };
  wskey: string;
}
