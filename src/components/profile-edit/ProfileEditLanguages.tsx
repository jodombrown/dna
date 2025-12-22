import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const LANGUAGES = [
  'Afrikaans', 'Akan', 'Albanian', 'Amharic', 'Arabic', 'Armenian', 'Azerbaijani',
  'Bambara', 'Basque', 'Belarusian', 'Bengali', 'Berber', 'Bosnian', 'Bulgarian',
  'Catalan', 'Chichewa', 'Chinese (Cantonese)', 'Chinese (Mandarin)', 'Croatian', 'Czech',
  'Danish', 'Dinka', 'Dutch',
  'English', 'Estonian', 'Ewe',
  'Fang', 'Finnish', 'French', 'Fula',
  'Ga', 'Georgian', 'German', 'Greek', 'Guarani', 'Gujarati',
  'Hausa', 'Hebrew', 'Hindi', 'Hungarian',
  'Icelandic', 'Igbo', 'Indonesian', 'Irish', 'Italian',
  'Japanese', 'Javanese',
  'Kannada', 'Kazakh', 'Khmer', 'Kikuyu', 'Kinyarwanda', 'Kirundi', 'Korean', 'Krio', 'Kurdish',
  'Lao', 'Latvian', 'Lingala', 'Lithuanian', 'Luo',
  'Macedonian', 'Malagasy', 'Malay', 'Malayalam', 'Maltese', 'Mandinka', 'Marathi', 'Mongolian', 'Moore',
  'Ndebele', 'Nepali', 'Nigerian Pidgin', 'Norwegian', 'Nuer',
  'Oromo',
  'Pashto', 'Persian (Farsi)', 'Polish', 'Portuguese', 'Punjabi',
  'Romanian', 'Russian',
  'Sango', 'Serbian', 'Sesotho', 'Shona', 'Sindhi', 'Sinhala', 'Slovak', 'Slovenian', 'Somali', 'Spanish', 'Swahili', 'Swedish',
  'Tagalog', 'Tamil', 'Telugu', 'Thai', 'Tigrinya', 'Tswana', 'Turkish', 'Twi',
  'Ukrainian', 'Urdu', 'Uzbek',
  'Vietnamese',
  'Welsh', 'Wolof',
  'Xhosa',
  'Yoruba',
  'Zulu'
].sort();

interface ProfileEditLanguagesProps {
  languages: string[];
  onLanguagesChange: (languages: string[]) => void;
}

const ProfileEditLanguages: React.FC<ProfileEditLanguagesProps> = ({
  languages,
  onLanguagesChange,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const safeLanguages = Array.isArray(languages) ? languages : [];

  const handleSelect = (normalizedValue: string) => {
    // Case-insensitive lookup to find original
    const originalLang = LANGUAGES.find(
      lang => lang.toLowerCase() === normalizedValue.toLowerCase()
    );
    
    if (!originalLang) return;

    if (safeLanguages.includes(originalLang)) {
      onLanguagesChange(safeLanguages.filter(l => l !== originalLang));
    } else {
      onLanguagesChange([...safeLanguages, originalLang]);
    }
  };

  const removeLanguage = (lang: string) => {
    onLanguagesChange(safeLanguages.filter(l => l !== lang));
  };

  const filteredLanguages = search
    ? LANGUAGES.filter(lang => lang.toLowerCase().includes(search.toLowerCase()))
    : LANGUAGES;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Languages
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Languages you speak help connect you with the diaspora</p>
            </TooltipContent>
          </Tooltip>
        </CardTitle>
        <CardDescription>Add all languages you speak to expand your reach</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="mb-2 block">Languages You Speak</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between bg-background"
              >
                {safeLanguages.length > 0 
                  ? `${safeLanguages.length} language${safeLanguages.length > 1 ? 's' : ''} selected`
                  : "Select languages..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 bg-popover border shadow-lg z-50" align="start">
              <Command shouldFilter={false}>
                <CommandInput 
                  placeholder="Search languages..." 
                  value={search}
                  onValueChange={setSearch}
                />
                <CommandList className="max-h-60 overflow-auto">
                  <CommandEmpty>No language found.</CommandEmpty>
                  <CommandGroup>
                    {filteredLanguages.map((language) => {
                      const isSelected = safeLanguages.some(
                        l => l.toLowerCase() === language.toLowerCase()
                      );
                      return (
                        <CommandItem
                          key={language}
                          value={language}
                          onSelect={handleSelect}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              isSelected ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {language}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {safeLanguages.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {safeLanguages.map((language) => (
              <Badge key={language} variant="secondary" className="pr-1">
                {language}
                <button
                  type="button"
                  className="ml-1 rounded-full hover:bg-black/10 p-0.5"
                  onClick={() => removeLanguage(language)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Type to search or scroll through the list. Select all languages you speak fluently or conversationally.
        </p>
      </CardContent>
    </Card>
  );
};

export default ProfileEditLanguages;
