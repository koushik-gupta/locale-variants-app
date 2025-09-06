import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const API_BASE_URL = "https://locale-variants-app-production.up.railway.app";

export default function Dashboard() {
  const [variantGroups, setVariantGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // This function fetches the variant groups that were automatically created
  // by the "Experiences" feature in Contentstack Personalize.
  const fetchVariantGroups = () => {
    setIsLoading(true);
    fetch(`${API_BASE_URL}/api/variants`)
      .then(response => {
        if (!response.ok) throw new Error(`Network response was not ok`);
        return response.json();
      })
      .then(data => setVariantGroups(data))
      .catch(err => {
        console.error("Failed to fetch variant groups:", err);
        setError("Failed to load data. Please check the console for details.");
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchVariantGroups();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Variant Manager!!</h1>
        {/* "Create New Group" button has been removed as per the correct workflow */}
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableCaption>A list of Variant Groups from Contentstack Personalize.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>UID</TableHead>
              <TableHead>Last Modified</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan="4" className="text-center h-24">Loading...</TableCell></TableRow>
            ) : error ? (
              <TableRow><TableCell colSpan="4" className="text-center h-24 text-red-500">{error}</TableCell></TableRow>
            ) : variantGroups.length === 0 ? (
              <TableRow><TableCell colSpan="4" className="text-center h-24">No variants found. Please create an "Experience" in Contentstack Personalize first.</TableCell></TableRow>
            ) : (
              variantGroups.map((group) => (
                <TableRow key={group.uid}>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell><code className="text-xs">{group.uid}</code></TableCell>
                  <TableCell>{new Date(group.updated_at).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Link to={`/manage/${group.uid}`}>
                      <Button variant="outline">Manage</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}