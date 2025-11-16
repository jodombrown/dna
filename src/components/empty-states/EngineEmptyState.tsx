import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface CrossSuggestion {
  label: string;
  description: string;
  route: string;
  icon: LucideIcon;
}

interface EngineEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    route: string;
    icon?: LucideIcon;
  };
  crossSuggestions: CrossSuggestion[];
}

export function EngineEmptyState({
  icon: Icon,
  title,
  description,
  primaryAction,
  crossSuggestions,
}: EngineEmptyStateProps) {
  const navigate = useNavigate();

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="rounded-full bg-primary/10 p-4 mb-4">
          <Icon className="h-12 w-12 text-primary" />
        </div>
        
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-md">{description}</p>

        {primaryAction && (
          <Button
            onClick={() => navigate(primaryAction.route)}
            size="lg"
            className="mb-6"
          >
            {primaryAction.icon && <primaryAction.icon className="mr-2 h-4 w-4" />}
            {primaryAction.label}
          </Button>
        )}

        <div className="w-full max-w-md">
          <p className="text-sm font-medium text-muted-foreground mb-3">
            Or explore these options:
          </p>
          <div className="grid gap-3">
            {crossSuggestions.map((suggestion, idx) => {
              const SuggestionIcon = suggestion.icon;
              return (
                <Button
                  key={idx}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3"
                  onClick={() => navigate(suggestion.route)}
                >
                  <div className="flex items-start gap-3">
                    <SuggestionIcon className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{suggestion.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {suggestion.description}
                      </div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
