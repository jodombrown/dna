import { useState, useRef, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Skill {
  id: string;
  name: string;
}

interface SkillsAutocompleteProps {
  selectedSkillIds: string[];
  onChange: (skillIds: string[]) => void;
  label?: string;
  minRequired?: number;
}

export default function SkillsAutocomplete({
  selectedSkillIds,
  onChange,
  label = 'Your Skills',
  minRequired = 3
}: SkillsAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: skills = [] } = useQuery({
    queryKey: ['skills'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('skills')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Skill[];
    },
  });

  const selectedSkills = skills.filter((s) => selectedSkillIds.includes(s.id));
  
  const filtered = skills.filter(
    (skill) =>
      skill.name.toLowerCase().includes(query.toLowerCase()) &&
      !selectedSkillIds.includes(skill.id)
  );

  const addSkill = (skillId: string) => {
    onChange([...selectedSkillIds, skillId]);
    setQuery('');
    setOpen(false);
  };

  const removeSkill = (skillId: string) => {
    onChange(selectedSkillIds.filter((id) => id !== skillId));
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div>
      <Label>
        {label} * {minRequired > 0 && `(select at least ${minRequired})`}
      </Label>
      <div className="space-y-2 mt-2">
        <div ref={containerRef} className="relative">
          <input
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={query}
            placeholder="Search skills..."
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            aria-autocomplete="list"
            aria-expanded={open}
          />
          {open && filtered.length > 0 && (
            <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-md border bg-popover shadow-lg">
              {filtered.map((skill) => (
                <button
                  key={skill.id}
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => addSkill(skill.id)}
                >
                  {skill.name}
                </button>
              ))}
            </div>
          )}
          {open && query && filtered.length === 0 && (
            <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg px-3 py-2 text-sm text-muted-foreground">
              No skills found
            </div>
          )}
        </div>

        {selectedSkills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedSkills.map((skill) => (
              <Badge key={skill.id} variant="default" className="gap-1 pr-1">
                {skill.name}
                <button
                  type="button"
                  className="ml-1 rounded-full hover:bg-primary-foreground/20 p-0.5"
                  onClick={() => removeSkill(skill.id)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          {selectedSkillIds.length} skill{selectedSkillIds.length !== 1 ? 's' : ''} selected
        </div>
      </div>
    </div>
  );
}
