import AdvancedLocationSearch from './AdvancedLocationSearch';

export type LocationTypeaheadProps = {
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
  provider?: 'local'; // future: 'mapbox' | 'google'
};

export default function LocationTypeahead({
  value = '',
  onChange,
  placeholder = 'Current location',
}: LocationTypeaheadProps) {
  return (
    <AdvancedLocationSearch
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
}
