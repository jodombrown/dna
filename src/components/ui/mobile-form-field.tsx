import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface MobileFormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'textarea';
  placeholder?: string;
  required?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  className?: string;
  disabled?: boolean;
  rows?: number;
}

const MobileFormField: React.FC<MobileFormFieldProps> = ({
  label,
  name,
  type = 'text',
  placeholder,
  required = false,
  value,
  onChange,
  error,
  className,
  disabled = false,
  rows = 3
}) => {
  const inputId = `${name}-input`;

  return (
    <div className={cn('space-y-2', className)}>
      <Label 
        htmlFor={inputId}
        className="text-sm sm:text-base font-medium text-gray-700 flex items-center gap-1"
      >
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      
      {type === 'textarea' ? (
        <Textarea
          id={inputId}
          name={name}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={onChange}
          disabled={disabled}
          rows={rows}
          className={cn(
            'min-h-[44px] text-base resize-none',
            'focus:ring-2 focus:ring-dna-emerald focus:border-dna-emerald',
            'touch-manipulation',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
          )}
        />
      ) : (
        <Input
          id={inputId}
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={cn(
            'min-h-[44px] text-base',
            'focus:ring-2 focus:ring-dna-emerald focus:border-dna-emerald',
            'touch-manipulation',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
          )}
        />
      )}
      
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
};

export default MobileFormField;