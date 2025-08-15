import AdvancedLocationSearch from '@/components/location/AdvancedLocationSearch';

interface ComprehensiveLocationInputProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  icon?: boolean; // Add for compatibility
}

const ComprehensiveLocationInput: React.FC<ComprehensiveLocationInputProps> = ({
  id = 'location',
  label,
  value,
  onChange,
  placeholder = 'Search for any location worldwide...',
  required = false,
  disabled = false,
  className = '',
  icon = false, // Add for compatibility but ignore
}) => {
  return (
    <AdvancedLocationSearch
      id={id}
      label={label}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className={className}
    />
  );
};

export default ComprehensiveLocationInput;