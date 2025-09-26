'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCurrencyExchange, Currency, CURRENCIES } from '@/hooks/useCurrencyExchange';
import { ChevronDown, Loader2 } from 'lucide-react';

interface CurrencySelectorProps {
  baseCurrency: Currency;
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  basePrice: number;
  size?: 'sm' | 'md' | 'lg';
  showConvertedPrice?: boolean;
  className?: string;
}

export const CurrencySelector = ({
  baseCurrency,
  selectedCurrency,
  onCurrencyChange,
  basePrice,
  size = 'sm',
  showConvertedPrice = true,
  className = ''
}: CurrencySelectorProps) => {
  const { convertPrice, formatPrice, loading, error } = useCurrencyExchange();

  const convertedPrice = convertPrice(basePrice, baseCurrency, selectedCurrency);
  const isConverted = baseCurrency !== selectedCurrency;

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const buttonSizes = {
    sm: 'h-7 px-2',
    md: 'h-8 px-3',
    lg: 'h-10 px-4'
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {/* Currency Selector */}
      <Select value={selectedCurrency} onValueChange={onCurrencyChange}>
        <SelectTrigger
          className={`
            ${buttonSizes[size]}
            ${sizeClasses[size]}
            bg-white border border-gray-200 hover:border-gray-300
            focus:border-blue-500 focus:ring-1 focus:ring-blue-500
            transition-colors duration-200 rounded-lg
            min-w-[80px] max-w-[120px]
          `}
          disabled={loading}
        >
          <div className="flex items-center gap-1.5">
            {loading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <>
                <span className="font-medium">
                  {CURRENCIES.find(c => c.code === selectedCurrency)?.symbol}
                </span>
                <span className="text-gray-600">
                  {selectedCurrency}
                </span>
              </>
            )}
          </div>
        </SelectTrigger>
        <SelectContent>
          {CURRENCIES.map((currency) => (
            <SelectItem key={currency.code} value={currency.code}>
              <div className="flex items-center gap-2">
                <span className="font-medium">{currency.symbol}</span>
                <span className="text-gray-600">{currency.code}</span>
                <span className="text-gray-500 text-xs">- {currency.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Price Display */}
      {showConvertedPrice && !error && (
        <div className="flex flex-col gap-0.5">
          <div className={`font-bold text-[#F26729] ${
            size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-lg' : 'text-base'
          }`}>
            {formatPrice(convertedPrice, selectedCurrency)}
          </div>

          {/* Show original price if converted */}
          {isConverted && (
            <div className={`text-gray-500 ${
              size === 'lg' ? 'text-sm' : size === 'md' ? 'text-xs' : 'text-xs'
            }`}>
              ≈ {formatPrice(basePrice, baseCurrency)} original
            </div>
          )}

          {/* Conversion indicator */}
          {isConverted && (
            <div className="text-xs text-blue-600 font-medium">
              Convertido en tiempo real
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="text-xs text-red-500 mt-1">
          {formatPrice(basePrice, baseCurrency)} (tasas no disponibles)
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;