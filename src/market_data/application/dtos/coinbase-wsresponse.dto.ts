export class BinanceWSResponseDTO {
  stream: string;
  data: {
    e: string;
    E: number;
    s: string;
    k: {
      t: number;
      T: number;
      s: string;
      i: string;
      f: number;
      L: number;
      o: string;
      c: string;
      h: string;
      l: string;
      v: string;
      n: number;
      x: boolean;
      q: string;
      V: string;
      Q: string;
      B: string;
    };
  };

  // constructor(
  //   e: string,
  //   E: number,
  //   s: string,
  //   k: {
  //     t: number;
  //     T: number;
  //     s: string;
  //     i: string;
  //     f: number;
  //     L: number;
  //     o: string;
  //     c: string;
  //     h: string;
  //     l: string;
  //     v: string;
  //     n: number;
  //     x: boolean;
  //     q: string;
  //     V: string;
  //     Q: string;
  //     B: string;
  //   },
  // ) {
  //   this.e = e;
  //   this.E = E;
  //   this.s = s;
  //   this.k = k;
  //   this.k.t = k.t;
  //   this.k.T = k.T;
  //   this.k.s = k.s;
  //   this.k.i = k.i;
  //   this.k.f = k.f;
  //   this.k.L = k.L;
  //   this.k.o = k.o;
  //   this.k.c = k.c;
  //   this.k.h = k.h;
  //   this.k.l = k.l;
  //   this.k.v = k.v;
  //   this.k.n = k.n;
  //   this.k.x = k.x;
  //   this.k.q = k.q;
  //   this.k.V = k.V;
  //   this.k.Q = k.Q;
  //   this.k.B = k.B;
  // }
}
