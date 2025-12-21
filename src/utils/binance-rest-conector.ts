import dotenv from 'dotenv';
import { MainClient } from 'binance';

function connect() {
  dotenv.config();
  const api_key = process.env.BINANCE_API_KEY;
  const api_secret = process.env.BINANCE_API_SECRET;

  const restClient: MainClient = new MainClient({
    api_key: 'PmfQIusJQ6W9ZiSDjSXJKV972ZKfqLlVB6a7T6MFsdKVAbwnHVLgZiPNYRxpNkhN',
    api_secret:
      'KB85I2rHTcN82YqnP3i89gHtZ9pbISBRMbH6oPeB2MJGeRnG5UKCbb9IxefzplMf',
    testnet: true,
  });

  console.log(api_key);
  console.log(api_secret);

  restClient
    .getAccountInfo()
    .then((result) => {
      console.log('getExchangeInfo inverse result: ', result);
    })
    .catch((err) => {
      console.error('getExchangeInfo inverse error: ', err);
    });
}

connect();
