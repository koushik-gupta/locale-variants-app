import React, { useEffect, useState } from 'react';
import ContentstackSDK from '@contentstack/ui-extensions-sdk';
import { Badge } from "@/components/ui/badge";

const API_BASE_URL = "https://locale-variants-app-production.up.railway.app";

// --- IMPORTANT ---
// PASTE THE UID OF YOUR VARIANT GROUP HERE.
// You can find this on the main dashboard of your app. It starts with "cs...".
const VARIANT_GROUP_UID = "PASTE_YOUR_UID_HERE"; 
// For example: "cs05f4fa66358368ad"

export default function SidebarExtension() {
  const [statuses, setStatuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    ContentstackSDK.init()
      .then((sdk) => {
        const entry = sdk.entry;
        const contentType = sdk.contentType.uid;
        
        if (!VARIANT_GROUP_UID || VARIANT_GROUP_UID === "cs05f4fa66358368ad") {
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