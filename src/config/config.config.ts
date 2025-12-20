import dotenv from 'dotenv';
export class Config {
  static load() {
    dotenv.config();
    console.log(process.env.DB_HOST);
    return process.env;
  }
}

Config.load();
