import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ContentstackSDK from '@contentstack/ui-extensions-sdk';
import { Badge } from "@/components/ui/badge";

export default function SidebarExtension() {
  const [statuses, setStatuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ContentstackSDK.init().then((sdk) => {
      // This SDK object allows us to talk to Contentstack
      const entry = sdk.entry;
      const contentType = sdk.contentType.uid;
      
      // For the demo, we will hardcode the Variant Group ID to '1'.
      // A full application would have a settings page for this.
      const variantGroupId = 1;

      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/translations/${variantGroupId}/${entry.uid}?contentType=${contentType}`;

      // Call our own backend API
      axios.get(apiUrl)
        .then(res => {
          setStatuses(res.data);
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