import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

// Comprehensive list of world languages
const WORLD_LANGUAGES = [
  'Afrikaans', 'Albanian', 'Amharic', 'Arabic', 'Armenian', 'Assamese', 'Azerbaijani',
  'Bambara', 'Basque', 'Belarusian', 'Bengali', 'Bosnian', 'Bulgarian', 'Burmese',
  'Catalan', 'Cebuano', 'Chichewa', 'Chinese (Mandarin)', 'Chinese (Cantonese)', 'Croatian', 'Czech',
  'Danish', 'Dinka', 'Dutch',
  'English', 'Esperanto', 'Estonian', 'Ewe',
  'Farsi (Persian)', 'Finnish', 'French', 'Fula',
  'Galician', 'Georgian', 'German', 'Greek', 'Gujarati',
  'Haitian Creole', 'Hausa', 'Hawaiian', 'Hebrew', 'Hindi', 'Hmong', 'Hungarian',
  'Icelandic', 'Igbo', 'Indonesian', 'Irish', 'Italian',
  'Japanese', 'Javanese',
  'Kannada', 'Kazakh', 'Khmer', 'Kikuyu', 'Kinyarwanda', 'Korean', 'Kurdish',
  'Kyrgyz',
  'Lao', 'Latvian', 'Lithuanian', 'Luganda', 'Luxembourgish',
  'Macedonian', 'Malagasy', 'Malay', 'Malayalam', 'Maltese', 'Maori', 'Marathi',
  'Mongolian',
  'Nepali', 'Norwegian',
  'Oromo',
  'Pashto', 'Polish', 'Portuguese', 'Punjabi',
  'Romanian', 'Russian', 'Rwandan',
  'Samoan', 'Serbian', 'Sesotho', 'Shona', 'Sindhi', 'Sinhala', 'Slovak', 'Slovenian',
  'Somali', 'Spanish', 'Sundanese', 'Swahili', 'Swedish',
  'Tagalog (Filipino)', 'Tajik', 'Tamil', 'Tatar', 'Telugu', 'Thai', 'Tigrinya',
  'Turkish', 'Turkmen',
  'Ukrainian', 'Urdu', 'Uyghur', 'Uzbek',
  'Vietnamese',
  'Welsh', 'Wolof',
  'Xhosa',
  'Yiddish', 'Yoruba',
  'Zulu'
].sort();

interface LanguageAutocompleteProps {
  value: string[];
  onChange: (languages: string[]) => void;
}

export const LanguageAutocomplete = ({ value = [], onChange }: LanguageAutocompleteProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredLanguages, setFilteredLanguages] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filter languages based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredLanguages([]);
      return;
    }

    const filtered = WORLD_LANGUAGES
      .filter(lang => 
        lang.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !value.includes(lang)
      )
      .slice(0, 10);

    setFilteredLanguages(filtered);
  }, [searchTerm, value]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (language: string) => {
    if (!value.includes(language)) {
      onChange([...value, language]);
    }
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleRemoveLanguage = (language: string) => {
    onChange(value.filter(lang => lang !== language));
  };

  return (
    <div ref={wrapperRef} className="space-y-2">
      <Label>Languages You Speak</Label>
      
      {/* Selected languages */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((lang) => (
            <Badge
              key={lang}
              variant="default"
              className="cursor-pointer gap-1"
            >
              {lang}
              <X
                className="h-3 w-3"
                onClick={() => handleRemoveLanguage(lang)}
              />
            </Badge>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder="Type to search languages..."
          className="w-full"
        />
        
        {/* Dropdown */}
        {showDropdown && filteredLanguages.length > 0 && (
          <div className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto bg-background border border-input rounded-md shadow-lg">
            {filteredLanguages.map((language) => (
              <button
                key={language}
                type="button"
                className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground transition-colors"
                onClick={() => handleSelectLanguage(language)}
              >
                {language}
              </button>
            ))}
          </div>
        )}
        
        {showDropdown && searchTerm && filteredLanguages.length === 0 && (
          <div className="absolute z-50 w-full mt-1 bg-background border border-input rounded-md shadow-lg p-3 text-sm text-muted-foreground">
            No languages found matching "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
};
