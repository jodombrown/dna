-- Update Annual Remittances label
UPDATE public.stat_citations
SET label = 'Annual Remittances to Africa'
WHERE key = 'annual_remittances';

-- Update Annual Remittances source name
UPDATE public.stat_citations
SET source_name = 'World Bank, Africa'
WHERE key = 'annual_remittances';

-- Update African Union source name with non-breaking spaces for alignment
UPDATE public.stat_citations
SET source_name = 'African Union,     '
WHERE key = 'diaspora_population';

-- Update education rate scope population and label
UPDATE public.stat_citations
SET scope_population = 'Diaspora age 25 & older',
    scope_geography = 'in the United State',
    scope_period = NULL
WHERE key = 'education_rate';