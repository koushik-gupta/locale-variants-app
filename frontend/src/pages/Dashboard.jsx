import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as contentstack from '@contentstack/management';

// Import UI Components
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// --- FINAL CORRECTED INITIALIZATION ---
// The API key must be provided when the client is created to access all features.
const client = contentstack.client({
  host: "eu-app.contentstack.com",
  api_key: import.meta.env.VITE_CONTENTSTACK_API_KEY, // <-- This was the missing piece
  management_token: import.meta.env.VITE_CONTENTSTACK_MANAGEMENT_TOKEN,
});
// ------------------------------------

export default function Dashboard() {
  const [variantGroups, setVariantGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchVariantGroups = () => {
    setIsLoading(true);
    // CORRECTED METHOD: Use .query().find() to get all items
    client.personalize.variant().query().find()
      .then((response) => {
        setVariantGroups(response.items);
      })
      .catch((err) => {
        console.error("Failed to fetch variants from Contentstack:", err);
        setError("Failed to load data from Contentstack.");
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchVariantGroups();
  }, []);

  const handleCreateGroup = () => {
    const variantData = {
      name: newGroupName,
    };
    // The .create() method is correct, but was failing due to bad initialization
    client.personalize.variant().create({ variant: variantData })
      .then(() => {
        setIsDialogOpen(false);
        setNewGroupName("");
        fetchVariantGroups();
      })
      .catch((err) => {
        console.error("Failed to create variant in Contentstack:", err);
        alert("Failed to create group. See console for details.");
      });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Variant Manager</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button>Create New Group</Button></DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl">Create Variant Group</DialogTitle>
              <DialogDescription className="text-base">This will create a new Variant in Contentstack Personalize.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} className="col-span-3" placeholder="e.g. Marathi Fallback"/>
              </div>
            </div>
            <DialogFooter><Button type="submit" onClick={handleCreateGroup}>Save Group</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableCaption>A list of your Variants from Contentstack Personalize.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>UID</TableHead>
              <TableHead className="text-right">Last Modified</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan="3" className="text-center h-24">Loading...</TableCell></TableRow>
            ) : error ? (
              <TableRow><TableCell colSpan="3" className="text-center h-24 text-red-500">{error}</TableCell></TableRow>
            ) : variantGroups.length === 0 ? (
              <TableRow><TableCell colSpan="3" className="text-center h-24">No variants found in Contentstack.</TableCell></TableRow>
            ) : (
              variantGroups.map((group) => (
                <TableRow key={group.uid}>
                  <TableCell>
                    <span className="font-medium">{group.name}</span>
                  </TableCell>
                  <TableCell><code className="text-xs">{group.uid}</code></TableCell>
                  <TableCell className="text-right">{new Date(group.updated_at).toLocaleString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}