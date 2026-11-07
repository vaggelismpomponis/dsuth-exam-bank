// Password validation utility functions
import { supabase } from '../supabaseClient';

export const validatePassword = (password) => {
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    symbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };

  const strength = Object.values(checks).filter(Boolean).length;
  let strengthLevel = 'weak';
  let strengthColor = '#f44336';

  if (strength >= 4) {
    strengthLevel = 'strong';
    strengthColor = '#4caf50';
  } else if (strength >= 3) {
    strengthLevel = 'medium';
    strengthColor = '#ff9800';
  } else if (strength >= 2) {
    strengthLevel = 'fair';
    strengthColor = '#ffc107';
  }

  return {
    isValid: strength >= 4,
    strength,
    strengthLevel,
    strengthColor,
    checks,
    percentage: (strength / 5) * 100
  };
};

export const validatePasswordBackend = async (password) => {
  try {
    const { data, error } = await supabase.functions.invoke('validate-password', {
      body: { password }
    });

    if (error) {
      console.error('Backend password validation error:', error);
      // Fallback to frontend validation
      return validatePassword(password);
    }

    return {
      isValid: data.isValid,
      strength: data.strength,
      checks: data.checks,
      percentage: (data.strength / 5) * 100
    };
  } catch (error) {
    console.error('Backend password validation failed:', error);
    // Fallback to frontend validation
    return validatePassword(password);
  }
};

export const getPasswordRequirements = () => [
  { key: 'length', label: 'Τουλάχιστον 8 χαρακτήρες' },
  { key: 'lowercase', label: 'Τουλάχιστον 1 πεζό γράμμα' },
  { key: 'uppercase', label: 'Τουλάχιστον 1 κεφαλαίο γράμμα' },
  { key: 'number', label: 'Τουλάχιστον 1 αριθμό' },
  { key: 'symbol', label: 'Τουλάχιστον 1 σύμβολο (!@#$%^&*)' }
]; 