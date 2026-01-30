'use client';

import React, { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface BaseFieldProps {
  label: string;
  error?: string;
  required?: boolean;
}

interface InputFieldProps extends BaseFieldProps, InputHTMLAttributes<HTMLInputElement> {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
}

interface TextareaFieldProps extends BaseFieldProps, TextareaHTMLAttributes<HTMLTextAreaElement> {}

interface SelectFieldProps extends BaseFieldProps, SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
}

export const InputField = ({ label, error, required, className, ...props }: InputFieldProps) => {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        className={clsx(
          "w-full px-4 py-2.5 rounded-xl border transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
          error ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50 hover:border-gray-300",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export const TextareaField = ({ label, error, required, className, ...props }: TextareaFieldProps) => {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        className={clsx(
          "w-full px-4 py-2.5 rounded-xl border transition-colors resize-none",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
          error ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50 hover:border-gray-300",
          className
        )}
        rows={4}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export const SelectField = ({ label, error, required, options, className, ...props }: SelectFieldProps) => {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        className={clsx(
          "w-full px-4 py-2.5 rounded-xl border transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
          error ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50 hover:border-gray-300",
          className
        )}
        {...props}
      >
        <option value="">Selecione...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export const ToggleField = ({ 
  label, 
  checked, 
  onChange 
}: { 
  label: string; 
  checked: boolean; 
  onChange: (checked: boolean) => void;
}) => {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className={clsx(
          "w-11 h-6 rounded-full transition-colors",
          checked ? "bg-blue-600" : "bg-gray-300"
        )} />
        <div className={clsx(
          "absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
          checked && "translate-x-5"
        )} />
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </label>
  );
};
