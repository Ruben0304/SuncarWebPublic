'use client';

import { useState, useEffect, useCallback } from 'react';

export type Currency = 'EUR' | 'USD' | 'MXN';

export interface ExchangeRates {
  EUR: number;
  USD: number;
  MXN: number;
}

interface CacheData {
  rates: ExchangeRates;
  timestamp: number;
}

export interface CurrencyInfo {
  code: Currency;
  symbol: string;
  name: string;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'Dólar' },
  { code: 'MXN', symbol: '$', name: 'Peso Mexicano' }
];

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos
const CACHE_KEY = 'currency_exchange_rates';

export const useCurrencyExchange = () => {
  const [rates, setRates] = useState<ExchangeRates>({ EUR: 1, USD: 1, MXN: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener tasas desde caché
  const getCachedRates = useCallback((): CacheData | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const data: CacheData = JSON.parse(cached);
      const isValid = Date.now() - data.timestamp < CACHE_DURATION;

      return isValid ? data : null;
    } catch {
      return null;
    }
  }, []);

  // Guardar tasas en caché
  const setCachedRates = useCallback((rates: ExchangeRates) => {
    try {
      const data: CacheData = {
        rates,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch {
      // Silently fail if localStorage is not available
    }
  }, []);

  // Obtener tasas de la API
  const fetchRates = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Verificar caché primero
      const cached = getCachedRates();
      if (cached) {
        setRates(cached.rates);
        setLoading(false);
        return cached.rates;
      }

      // Obtener tasas base con EUR como base
      const eurResponse = await fetch(
        `https://data.fixer.io/api/latest?access_key=${process.env.NEXT_PUBLIC_FIXER_API_KEY}&base=EUR&symbols=USD,MXN`
      );

      if (!eurResponse.ok) {
        throw new Error('Error al obtener tasas de cambio');
      }

      const eurData = await eurResponse.json();

      if (!eurData.success) {
        throw new Error(eurData.error?.info || 'Error en la API de cambio');
      }

      // Construir objeto de tasas con EUR como 1
      const newRates: ExchangeRates = {
        EUR: 1,
        USD: eurData.rates.USD,
        MXN: eurData.rates.MXN
      };

      setRates(newRates);
      setCachedRates(newRates);

      return newRates;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);

      // En caso de error, usar tasas por defecto
      const defaultRates: ExchangeRates = { EUR: 1, USD: 1.09, MXN: 19.5 };
      setRates(defaultRates);

      return defaultRates;
    } finally {
      setLoading(false);
    }
  }, [getCachedRates, setCachedRates]);

  // Convertir precio entre monedas
  const convertPrice = useCallback((
    amount: number,
    fromCurrency: Currency,
    toCurrency: Currency
  ): number => {
    if (fromCurrency === toCurrency) return amount;

    // Convertir primero a EUR como base
    const amountInEUR = fromCurrency === 'EUR' ? amount : amount / rates[fromCurrency];

    // Convertir de EUR a la moneda objetivo
    const convertedAmount = toCurrency === 'EUR' ? amountInEUR : amountInEUR * rates[toCurrency];

    return convertedAmount;
  }, [rates]);

  // Formatear precio con símbolo de moneda
  const formatPrice = useCallback((amount: number, currency: Currency): string => {
    const currencyInfo = CURRENCIES.find(c => c.code === currency);
    const symbol = currencyInfo?.symbol || '';

    const formatter = new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: currency === 'MXN' ? 0 : 2,
      maximumFractionDigits: currency === 'MXN' ? 0 : 2,
    });

    return `${formatter.format(amount)} ${currency}`;
  }, []);

  // Cargar tasas al montar el componente
  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  return {
    rates,
    loading,
    error,
    convertPrice,
    formatPrice,
    refreshRates: fetchRates,
    currencies: CURRENCIES
  };
};