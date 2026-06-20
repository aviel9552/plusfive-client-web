/**
 * Phone number utility functions
 * Handles conversion between display format (without +972) and storage format (with +972)
 */

/**
 * Converts a phone number to Israeli format with +972 prefix for backend storage
 * @param {string} phone - Phone number (can be with or without +972)
 * @returns {string} - Phone number in format +972XXXXXXXXX
 */
export const formatPhoneForBackend = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, '');
  // International dialing prefix 00
  if (digits.startsWith('00972')) {
    digits = digits.slice(2);
  }

  // If already starts with 972, return with +
  if (digits.startsWith('972')) {
    return `+${digits}`;
  }
  
  // If starts with 0, replace with 972
  if (digits.startsWith('0')) {
    return `+972${digits.slice(1)}`;
  }
  
  // If it's 9 digits (without leading 0), add 972
  if (digits.length === 9) {
    return `+972${digits}`;
  }
  
  // If it's 10 digits (with leading 0), replace 0 with 972
  if (digits.length === 10) {
    return `+972${digits.slice(1)}`;
  }
  
  // If it's already in +972 format, return as is
  if (phone.startsWith('+972')) {
    return phone;
  }
  
  // Default: assume it's a 10-digit number starting with 0
  if (digits.length > 0) {
    return `+972${digits.slice(1)}`;
  }
  
  return phone;
};

/**
 * Converts a phone number from backend format (+972) to display format (without +972)
 * @param {string} phone - Phone number from backend (with +972)
 * @returns {string} - Phone number in display format (0XXXXXXXXX)
 */
export const formatPhoneForDisplay = (phone) => {
  if (phone === null || phone === undefined || phone === '') return '';
  const raw = String(phone).trim();
  let digits = raw.replace(/\D/g, '');
  // Allow user to continue typing "+" / partial paste without wiping the field
  if (!digits.length) return raw;

  // Strip international dialing 00 (e.g. 00972…) before country code normalization
  if (digits.startsWith('00972')) {
    digits = digits.slice(2);
  }

  // +972XXXXXXXXX → 0XXXXXXXXX (matches backend Israeli storage)
  if (digits.startsWith('972')) {
    const national = digits.slice(3);
    if (!national) return raw;
    return `0${national}`;
  }
  
  // If already starts with 0, return as is
  if (digits.startsWith('0')) {
    return digits;
  }
  
  // If it's 9 digits, add 0 at the beginning
  if (digits.length === 9) {
    return `0${digits}`;
  }
  
  // If it's 10 digits, return as is
  if (digits.length === 10) {
    return digits;
  }
  
  // Fallback: unchanged raw (unknown pattern)
  return raw;
};

/**
 * Formats phone number for WhatsApp URL (removes + and keeps country code)
 * @param {string} phone - Phone number
 * @returns {string} - Phone number for WhatsApp (972XXXXXXXXX)
 */
export const formatPhoneForWhatsApp = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // If starts with 972, return as is
  if (digits.startsWith('972')) {
    return digits;
  }
  
  // If starts with 0, replace with 972
  if (digits.startsWith('0')) {
    return `972${digits.slice(1)}`;
  }
  
  // If it's 9 digits, add 972
  if (digits.length === 9) {
    return `972${digits}`;
  }
  
  // If it's 10 digits, replace 0 with 972
  if (digits.length === 10) {
    return `972${digits.slice(1)}`;
  }
  
  return digits;
};

/**
 * Formats phone number to WhatsApp URL
 * @param {string} phone - Phone number (can be in any format)
 * @returns {string} - WhatsApp URL in format https://wa.me/972XXXXXXXXX
 */
export const formatPhoneToWhatsapp = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  let whatsappNumber = '';
  
  // If starts with 972, use as is
  if (digits.startsWith('972')) {
    whatsappNumber = digits;
  }
  // If starts with 0, remove 0 and add 972
  else if (digits.startsWith('0')) {
    whatsappNumber = `972${digits.slice(1)}`;
  }
  // If it's 9 digits (without leading 0), add 972
  else if (digits.length === 9) {
    whatsappNumber = `972${digits}`;
  }
  // If it's 10 digits (with leading 0), replace 0 with 972
  else if (digits.length === 10) {
    whatsappNumber = `972${digits.slice(1)}`;
  }
  // Default: assume it's a 10-digit number starting with 0
  else if (digits.length > 0) {
    whatsappNumber = `972${digits.slice(1)}`;
  }
  
  // Return WhatsApp URL
  return `https://wa.me/${whatsappNumber}`;
};

/**
 * Validate Israeli phone: must be 10 digits (e.g. 0501234567) - matches backend validation.
 * @param {string} phone - Raw phone input
 * @returns {boolean} - true if valid
 */
export const isValidIsraelPhone = (phone) => {
  if (!phone) return false;
  const digits = String(phone).replace(/\D/g, '');
  // 10 digits with leading 0 (e.g. 0501234567) or 9 digits (e.g. 501234567) - matches backend
  return (digits.length === 10 && digits.startsWith('0') && /^0[0-9]{9}$/.test(digits)) ||
    (digits.length === 9 && /^[0-9]{9}$/.test(digits));
};

/** Same validation error message as backend - use for all phone fields (EN + HE) */
export const PHONE_VALIDATION_ERROR = {
  en: 'Invalid phone number. Must be 10 digits (e.g. 0501234567).',
  he: 'מספר הטלפון לא תקין - חייב להכיל 10 ספרות (למשל 0501234567)',
};

/**
 * Get phone validation error message for current language (same as backend).
 * @param {string} language - 'he' | 'en'
 * @returns {string}
 */
export const getPhoneValidationError = (language) =>
  language === 'he' ? PHONE_VALIDATION_ERROR.he : PHONE_VALIDATION_ERROR.en;

