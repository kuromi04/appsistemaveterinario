// Input validation and sanitization utilities

/**
 * Sanitizes a string by removing potentially harmful characters
 */
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove HTML tags and potentially harmful characters
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"&]/g, '') // Remove potentially harmful characters
    .trim();
};

/**
 * Validates user input based on type and constraints
 */
export const validateUserInput = (
  value: string | number,
  type: 'string' | 'number' | 'email' | 'phone' | 'required',
  constraints?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
  }
): { isValid: boolean; error?: string } => {
  if (type === 'required' && (!value || value.toString().trim() === '')) {
    return { isValid: false, error: 'Este campo es requerido' };
  }

  const stringValue = value.toString().trim();

  switch (type) {
    case 'string':
      if (constraints?.minLength && stringValue.length < constraints.minLength) {
        return { isValid: false, error: `Mínimo ${constraints.minLength} caracteres` };
      }
      if (constraints?.maxLength && stringValue.length > constraints.maxLength) {
        return { isValid: false, error: `Máximo ${constraints.maxLength} caracteres` };
      }
      if (constraints?.pattern && !constraints.pattern.test(stringValue)) {
        return { isValid: false, error: 'Formato inválido' };
      }
      break;

    case 'number':
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return { isValid: false, error: 'Debe ser un número válido' };
      }
      if (constraints?.min !== undefined && numValue < constraints.min) {
        return { isValid: false, error: `Mínimo ${constraints.min}` };
      }
      if (constraints?.max !== undefined && numValue > constraints.max) {
        return { isValid: false, error: `Máximo ${constraints.max}` };
      }
      break;

    case 'email':
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(stringValue)) {
        return { isValid: false, error: 'Email inválido' };
      }
      break;

    case 'phone':
      const phonePattern = /^[\d\s\-\+\(\)]{10,}$/;
      if (!phonePattern.test(stringValue)) {
        return { isValid: false, error: 'Teléfono inválido' };
      }
      break;
  }

  return { isValid: true };
};

/**
 * Formats a number as currency string
 */
export const formatCurrencyInput = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return '0.00';
  }

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue);
};

/**
 * Parses a currency string back to a number
 */
export const parseCurrencyInput = (value: string): number => {
  if (typeof value !== 'string') {
    return 0;
  }

  // Remove currency symbols, spaces, and commas
  const cleaned = value
    .replace(/[\$\s,]/g, '')
    .replace(/[^\d.-]/g, '');

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Validates medication name
 */
export const validateMedicationName = (name: string): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeString(name);
  return validateUserInput(sanitized, 'string', { minLength: 2, maxLength: 100 });
};

/**
 * Validates patient name
 */
export const validatePatientName = (name: string): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeString(name);
  return validateUserInput(sanitized, 'string', { minLength: 2, maxLength: 50 });
};

/**
 * Validates dosage input
 */
export const validateDosage = (dosage: string): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeString(dosage);
  if (!sanitized) {
    return { isValid: false, error: 'La dosis es requerida' };
  }
  
  // Allow alphanumeric characters, spaces, and common dosage units
  const dosagePattern = /^[\w\s\.,\/\-\(\)]+$/;
  if (!dosagePattern.test(sanitized)) {
    return { isValid: false, error: 'Formato de dosis inválido' };
  }
  
  return { isValid: true };
};