
import React, { useState } from "react";
import { Input } from "@/components/ui/input";

interface LocationAutocompleteProps {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  suggestions: string[];
  id: string;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  label,
  value,
  placeholder,
  onChange,
  suggestions,
  id,
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [filtered, setFiltered] = useState<string[]>([]);
  const [focusIdx, setFocusIdx] = useState(-1);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    if (!val) {
      setFiltered([]);
      setShowOptions(false);
      return;
    }
    const match = suggestions.filter((s) =>
      s.toLowerCase().includes(val.toLowerCase())
    );
    setFiltered(match.slice(0, 8));
    setShowOptions(true);
    setFocusIdx(-1);
  };

  const handleOptionClick = (option: string) => {
    onChange(option);
    setFiltered([]);
    setShowOptions(false);
  };

  const handleBlur = () => setTimeout(() => setShowOptions(false), 100);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showOptions || filtered.length === 0) return;
    if (e.key === "ArrowDown") {
      setFocusIdx((idx) => (idx + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      setFocusIdx((idx) => (idx - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      if (focusIdx >= 0 && filtered[focusIdx]) {
        onChange(filtered[focusIdx]);
        setFiltered([]);
        setShowOptions(false);
        e.preventDefault();
      }
    }
  };

  return (
    <div className="relative">
      <label htmlFor={id} className="block mb-1 text-dna-forest font-medium">{label}</label>
      <Input
        id={id}
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
      />
      {showOptions && filtered.length > 0 && (
        <ul className="absolute z-[999] bg-white border rounded mt-1 left-0 right-0 shadow-lg max-h-44 overflow-auto">
          {filtered.map((option, idx) => (
            <li
              key={option}
              className={`px-3 py-1 cursor-pointer hover:bg-dna-copper/20 ${
                idx === focusIdx ? "bg-dna-copper/30" : ""
              }`}
              onMouseDown={() => handleOptionClick(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationAutocomplete;
