import React, { useEffect, useState } from 'react';
import ContentstackSDK from '@contentstack/ui-extensions-sdk';
import { Badge } from "@/components/ui/badge";

const API_BASE_URL = "https://locale-variants-app-production.up.railway.app";

// --- FIX ---
// The placeholder has been replaced with the UID from your dashboard screenshot.
const VARIANT_GROUP_UID = "cs056f4a66358360ad"; 

export default function SidebarExtension() {
  const [statuses, setStatuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    ContentstackSDK.init()
      .then((sdk) => {
        const entry = sdk.entry;
        const contentType = sdk.contentType.uid;
        
        // This check ensures a valid UID is set before fetching.
        if (!VARIANT_GROUP_UID || VARIANT_GROUP_UID === "PASTE_YOUR_UID_HERE") {
            throw new Error("Variant Group UID is not set. Please edit SidebarExtension.jsx");
        }

        const apiUrl = `${API_BASE_URL}/api/translations/status?variantUid=${VARIANT_GROUP_UID}&entryUid=${entry.uid}&contentType=${contentType}`;
        
        return fetch(apiUrl);
      })
      .then(async response => {
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API Error: ${response.status} - ${errorText}`);
        }
        return response.json();
      })
      .then(data => {
        setStatuses(data);
      })
      .catch(err => {
        console.error("Error in Sidebar:", err);
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <div className="p-4">Loading statuses...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500 text-xs">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-3">Translation Status</h3>
      <div className="space-y-2">
        {statuses.length > 0 ? (
          statuses.map((item) => (
            <div key={item.code} className="flex justify-between items-center">
              <span>{item.name} ({item.code})</span>
              <Badge variant={item.status === 'Translated' ? 'default' : 'destructive'}>
                {item.status}
              </Badge>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No locale rules are defined for this variant group yet.</p>
        )}
      </div>
    </div>
  );
}