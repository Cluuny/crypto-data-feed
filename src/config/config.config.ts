// src/config/config.ts
import dotenv from 'dotenv';
export class Config {
  static load() {
    dotenv.config({ quiet: false });
    console.log(process.env.DB_HOST);
    return process.env;
  }
}

Config.load();
