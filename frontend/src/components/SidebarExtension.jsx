import React from 'react';
import { Badge } from "@/components/ui/badge"; // Import the new Badge component

// This is temporary mock data. We will replace this with a live API call later.
const mockLocales = [
  { name: 'English (United States)', code: 'en-US', status: 'Translated' },
  { name: 'Marathi (India)', code: 'mr-IN', status: 'Missing' },
  { name: 'Hindi (India)', code: 'hi-IN', status: 'Missing' },
];

export default function SidebarExtension() {
  return (
    <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Locale Variants</h3>
        <p className="text-sm text-muted-foreground">
          Translation status for this entry.
        </p>
      </div>

      <div className="space-y-4">
        {mockLocales.map((locale) => (
          <div key={locale.code} className="flex items-center justify-between">
            <div>
              <p className="font-medium">{locale.name}</p>
              <p className="text-xs text-muted-foreground">{locale.code}</p>
            </div>
            <Badge 
              // This logic changes the badge color based on its status
              variant={locale.status === 'Translated' ? 'default' : 'secondary'}
            >
              {locale.status}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}