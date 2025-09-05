import React, { useEffect, useState } from 'react';
import ContentstackSDK from '@contentstack/ui-extensions-sdk';
import { Badge } from "@/components/ui/badge";

const API_BASE_URL = "https://locale-variants-app-production.up.railway.app";

export default function SidebarExtension() {
  const [statuses, setStatuses] = useState([]);
  // New state to hold our debug messages
  const [debugInfo, setDebugInfo] = useState({
    step: 'Initializing...',
    url: '',
    error: '',
    data: null
  });

  useEffect(() => {
    ContentstackSDK.init()
      .then((sdk) => {
        setDebugInfo(prev => ({ ...prev, step: 'SDK Initialized. Getting entry data.' }));
        const entry = sdk.entry;
        const contentType = sdk.contentType.uid;
        const variantGroupId = 1; // We are hardcoding this

        const apiUrl = `${API_BASE_URL}/api/translations/status?variantGroupId=${variantGroupId}&entryUid=${entry.uid}&contentType=${contentType}`;
        setDebugInfo(prev => ({ ...prev, step: 'Making API call...', url: apiUrl }));

        return fetch(apiUrl);
      })
      .then(async response => {
        setDebugInfo(prev => ({ ...prev, step: `API response received with status: ${response.status}` }));
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API returned ${response.status}. Body: ${errorText}`);
        }
        return response.json();
      })
      .then(data => {
        setDebugInfo(prev => ({ ...prev, step: 'Success! Fetched data.', data: data }));
        setStatuses(data);
      })
      .catch(err => {
        console.error("Error in Sidebar:", err);
        setDebugInfo(prev => ({ ...prev, step: 'An error occurred.', error: err.message }));
      });
  }, []);

  // This component will now render a detailed debug view
  return (
    <div className="p-4 text-xs font-mono">
      <h3 className="font-bold mb-2 underline">Debug Information</h3>
      <p><span className="font-semibold">Step:</span> {debugInfo.step}</p>
      {debugInfo.url && <p className="mt-2"><span className="font-semibold">API URL Called:</span> <code className="break-all">{debugInfo.url}</code></p>}
      {debugInfo.error && <p className="mt-2 text-red-500"><span className="font-semibold">Error Message:</span> {debugInfo.error}</p>}
      {debugInfo.data && (
        <div className="mt-4">
          <p className="font-semibold">Data Received:</p>
          <pre className="text-xs bg-muted p-2 rounded">{JSON.stringify(debugInfo.data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}