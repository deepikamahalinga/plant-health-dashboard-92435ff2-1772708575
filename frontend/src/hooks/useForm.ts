// useForm.ts

import { useState, ChangeEvent, FormEvent } from 'react';

interface ValidationRules<T> {
  [key: string]: {
    required?: boolean;
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    custom?: (value: T[keyof T]) => boolean;
  };
}

interface FormErrors<T> {
  [key: string]: string;
}

interface UseFormReturn<T> {
  values: T;
  errors: FormErrors<T>;
  touched: { [key in keyof T]?: boolean };
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  reset: () => void;
  isValid: boolean;
  isDirty: boolean;
}

export const useForm = <T extends Record<string, any>>(
  initialValues: T,
  validationRules?: ValidationRules<T>,
  onSubmit?: (values: T) => void
): UseFormReturn<T> => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<{ [key in keyof T]?: boolean }>({});
  const [isDirty, setIsDirty] = useState(false);

  const validateField = (name: keyof T, value: any): string => {
    if (!validationRules || !validationRules[name as string]) return '';

    const rules = validationRules[name as string];

    if (rules.required && !value) return 'This field is required';
    if (rules.pattern && !rules.pattern.test(value)) return 'Invalid format';
    if (rules.minLength && value.length < rules.minLength) return `Minimum length is ${rules.minLength}`;
    if (rules.maxLength && value.length > rules.maxLength) return `Maximum length is ${rules.maxLength}`;
    if (rules.custom && !rules.custom(value)) return 'Invalid value';

    return '';
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors<T> = {};
    let isValid = true;

    Object.keys(values).forEach((key) => {
      const error = validateField(key as keyof T, values[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);

    if (touched[name as keyof T]) {
      const error = validateField(name as keyof T, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name as keyof T, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const isValid = validateForm();
    
    if (isValid && onSubmit) {
      onSubmit(values);
    }
  };

  const reset = (): void => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsDirty(false);
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    isValid: Object.keys(errors).length === 0,
    isDirty
  };
};