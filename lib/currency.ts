import { apiGet } from '@/lib/axios';
import { exchangeRateSchema, type ExchangeRate } from '@/schemas';

// DolarAPI - Free Argentine peso exchange rate API
const DOLAR_API = 'https://dolarapi.com/v1/dolares';

interface DolarApiResponse {
  casa: string;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

export async function fetchExchangeRate(): Promise<ExchangeRate> {
  const response = await apiGet<DolarApiResponse[]>(DOLAR_API);

  // Use "oficial" (official) rate, fallback to first available rate
  const oficialRate = response.find((rate) => rate.casa === 'oficial');
  const rate = oficialRate || response[0];

  if (!rate) {
    throw new Error('No exchange rate data available');
  }

  // Use the selling rate (venta) as it's typically used for conversions
  return exchangeRateSchema.parse({
    usd_to_ars: rate.venta,
    last_updated: rate.fechaActualizacion,
    source: 'dolarapi.com',
  });
}

export function convertUsdToArs(usd: number, rate: number): number {
  return usd * rate;
}

export function convertArsToUsd(ars: number, rate: number): number {
  return ars / rate;
}
