import React, { useEffect, useState } from 'react';
// No more axios import
import ContentstackSDK from '@contentstack/ui-extensions-sdk';
import { Badge } from "@/components/ui/badge";

// --- The Fix: We hardcode the URL here ---
const API_BASE_URL = "https://locale-variants-app-production.up.railway.app";

export default function SidebarExtension() {
  const [statuses, setStatuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ContentstackSDK.init().then((sdk) => {
      const entry = sdk.entry;
      const contentType = sdk.contentType.uid;
      
      // For the demo, we hardcode the Variant Group ID to '1'.
      const variantGroupId = 1;

      const apiUrl = `${API_BASE_URL}/api/translations/${variantGroupId}/${entry.uid}?contentType=${contentType}`;

      // Call our own backend API using fetch
      fetch(apiUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Network response was not ok. Status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          setStatuses(data);
        })
        .catch(err => console.error("Failed to get translation statuses", err))
        .finally(() => setIsLoading(false));
    });
  }, []);


  return (
    <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Locale Variants</h3>
        <p className="text-sm text-muted-foreground">
          Translation status for this entry.
        </p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <p>Loading status...</p>
        ) : (
          statuses.map((locale) => (
            <div key={locale.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{locale.name}</p>
              </div>
              <Badge 
                variant={locale.status === 'Translated' ? 'default' : 'secondary'}
              >
                {locale.status}
              </Badge>
            </div>
          ))
        )}
      </div>
    </div>
  );
}