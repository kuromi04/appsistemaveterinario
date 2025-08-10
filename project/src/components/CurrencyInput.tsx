import React, { useState, useEffect } from 'react';
import { formatCurrencyInput, parseCurrencyInput } from '../utils/inputValidation';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  required?: boolean;
  error?: string;
  label?: string;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  placeholder = "0",
  className = "",
  disabled = false,
  min = 0,
  max = 50000000,
  required = false,
  error,
  label
}) => {
  const [displayValue, setDisplayValue] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value > 0 ? formatCurrencyInput(value.toString()) : '');
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Permitir solo números, puntos, comas y espacios durante la escritura
    const cleanInput = inputValue.replace(/[^\d.,\s]/g, '');
    setDisplayValue(cleanInput);
    
    // Convertir a número y validar
    const numericValue = parseCurrencyInput(cleanInput);
    
    // Validar rangos
    if (numericValue >= min && numericValue <= max) {
      onChange(numericValue);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Mostrar el valor numérico sin formato cuando está enfocado
    setDisplayValue(value > 0 ? value.toString() : '');
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Formatear el valor cuando pierde el foco
    const numericValue = parseCurrencyInput(displayValue);
    onChange(numericValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permitir: backspace, delete, tab, escape, enter
    if ([46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
        // Permitir Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true) ||
        // Permitir home, end, left, right
        (e.keyCode >= 35 && e.keyCode <= 39)) {
      return;
    }
    
    // Asegurar que sea un número, punto o coma
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && 
        (e.keyCode < 96 || e.keyCode > 105) && 
        e.keyCode !== 190 && e.keyCode !== 188) {
      e.preventDefault();
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm pointer-events-none">
          $
        </span>
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`pl-8 w-full rounded-md border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm focus:border-secondary-500 focus:ring-secondary-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
            error ? 'border-red-300 dark:border-red-600' : ''
          } ${className}`}
        />
        {!isFocused && value > 0 && (
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-xs">
            COP
          </span>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
        Formato: 1.000.000 (use punto o coma para decimales)
      </p>
    </div>
  );
};

export default CurrencyInput;