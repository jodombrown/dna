import AdvancedLocationSearch from '@/components/location/AdvancedLocationSearch';
import type { SelectedLocation } from '@/components/location/AdvancedLocationSearch';

interface LocationAutocompleteProps {
  id?: string;
  label?: string;
  value: string;
  onChange?: (value: string) => void;
  onSelect?: (location: SelectedLocation) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  id = 'location',
  label = 'Location',
  value,
  onChange,
  onSelect,
  placeholder = 'Search for any location worldwide...',
  required = false,
  className
}) => {
  const handleChange = (newValue: string) => {
    onChange?.(newValue);
  };

  return (
    <AdvancedLocationSearch
      id={id}
      label={label}
      value={value}
      onChange={handleChange}
      onSelect={onSelect}
      placeholder={placeholder}
      required={required}
      className={className}
    />
  );
};

export default LocationAutocomplete;