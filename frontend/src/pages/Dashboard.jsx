import { useEffect, useState } from 'react';

// NOTE: This is a temporary debugging component.
export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('Attempting to fetch...');

  useEffect(() => {
    console.log("Starting fetch to public test API: JSONPlaceholder...");
    fetch('https://jsonplaceholder.typicode.com/users/1')
      .then(response => {
        console.log("Received response from server:", response);
        if (!response.ok) {
          throw new Error(`Network response was not ok. Status: ${response.status}`);
        }
        return response.json();
      })
      .then(json => {
        console.log("Fetch successful!", json);
        setStatus('Success! Data Received:');
        setData(json);
      })
      .catch(error => {
        console.error('Fetch error:', error);
        setStatus('Fetch failed. See console for details.');
        setError(error.toString());
      });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Network Debug Test</h1>
      <div className="mt-4 p-4 border rounded-lg bg-card">
        <h2 className="font-bold">{status}</h2>
        {error && <pre className="mt-2 text-sm text-red-500">{error}</pre>}
        {data && (
          <pre className="mt-2 text-sm">{JSON.stringify(data, null, 2)}</pre>
        )}
      </div>
    </div>
  );
}