import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { validateUsername, USERNAME_RULES } from '@/lib/username/validation';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

interface UsernameInputProps {
  value: string;
  onChange: (value: string) => void;
  currentUserId?: string;
  className?: string;
  showChangesRemaining?: boolean;
  changesUsed?: number;
}

export const UsernameInput: React.FC<UsernameInputProps> = ({
  value,
  onChange,
  currentUserId,
  className,
  showChangesRemaining = false,
  changesUsed = 0,
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; error?: string } | null>(null);
  const debouncedValue = useDebounce(value, 500);

  useEffect(() => {
    if (!debouncedValue || debouncedValue.length < USERNAME_RULES.minLength) {
      setValidationResult(null);
      return;
    }

    const checkUsername = async () => {
      setIsChecking(true);
      const result = await validateUsername(debouncedValue, currentUserId);
      setValidationResult(result);
      setIsChecking(false);
    };

    checkUsername();
  }, [debouncedValue, currentUserId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Auto-convert to lowercase and filter invalid characters
    const newValue = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    onChange(newValue);
  };

  const changesRemaining = USERNAME_RULES.maxLifetimeChanges - changesUsed;
  const isAvailable = validationResult?.valid === true;
  const hasError = validationResult && !validationResult.valid;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="username" className="text-sm font-medium">
        Choose Username
      </Label>
      
      <div className="relative">
        <div className="flex items-center space-x-2">
          <span className="text-muted-foreground select-none">@</span>
          <div className="relative flex-1">
            <Input
              id="username"
              value={value}
              onChange={handleChange}
              placeholder="yourname"
              maxLength={USERNAME_RULES.maxLength}
              className={cn(
                "lowercase pr-10",
                isAvailable && "border-green-500 focus:ring-green-500",
                hasError && "border-red-500 focus:ring-red-500"
              )}
            />
            
            {/* Status Icon */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isChecking && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              {!isChecking && isAvailable && <CheckCircle className="h-4 w-4 text-green-500" />}
              {!isChecking && hasError && value.length >= USERNAME_RULES.minLength && (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Validation Feedback */}
      {validationResult && value.length >= USERNAME_RULES.minLength && (
        <div className="flex items-start gap-2">
          {isAvailable && (
            <p className="text-sm text-green-600">✓ Username available!</p>
          )}
          {hasError && (
            <p className="text-sm text-red-600">{validationResult.error}</p>
          )}
        </div>
      )}

      {/* Changes Remaining */}
      {showChangesRemaining && changesUsed > 0 && (
        <p className="text-xs text-muted-foreground">
          {changesRemaining} username change{changesRemaining !== 1 ? 's' : ''} remaining
        </p>
      )}
    </div>
  );
};
