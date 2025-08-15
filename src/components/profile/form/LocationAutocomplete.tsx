
import React from "react";
import AdvancedLocationSearch from "@/components/location/AdvancedLocationSearch";

interface LocationAutocompleteProps {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  suggestions?: string[]; // Keep for backwards compatibility but not used
  id: string;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  label,
  value,
  placeholder,
  onChange,
  id,
}) => {
  return (
    <AdvancedLocationSearch
      id={id}
      label={label}
      value={value}
      onChange={onChange}
      placeholder={placeholder || "Search for any location..."}
    />
  );
};

export default LocationAutocomplete;
