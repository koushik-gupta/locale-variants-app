import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
// No more axios import

// Import UI Components
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// --- The Fix: We hardcode the URL here ---
const API_BASE_URL = "https://locale-variants-app-production.up.railway.app";

export default function LocaleManager() {
  const { groupId } = useParams();
  const [locales, setLocales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [newLocaleName, setNewLocaleName] = useState('');
  const [fallbackId, setFallbackId] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchLocales = () => {
    setIsLoading(true);
    fetch(`${API_BASE_URL}/api/locales/${groupId}`)
      .then(response => {
        if (!response.ok) throw new Error(`Network response was not ok. Status: ${response.status}`);
        return response.json();
      })
      .then(data => setLocales(data))
      .catch(err => {
        console.error(`Failed to fetch locales for group ${groupId}:`, err);
        setError("Failed to load data.");
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchLocales();
  }, [groupId]);

  const handleCreateLocale = () => {
    fetch(`${API_BASE_URL}/api/locales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        variant_group_id: groupId,
        name: newLocaleName,
        fallback_to: fallbackId || null,
      }),
    })
    .then(response => {
      if (!response.ok) throw new Error(`Network response was not ok. Status: ${response.status}`);
      return response.json();
    })
    .then(() => {
      setIsDialogOpen(false);
      setNewLocaleName('');
      setFallbackId('');
      fetchLocales();
    })
    .catch(err => {
      console.error("Failed to create locale:", err);
      alert("Failed to create locale. See console for details.");
    });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-4">
        <Link to="/" className="text-sm text-primary hover:underline">
          &larr; Back to Variant Groups
        </Link>
        <div className="flex justify-between items-center mt-2">
          <h1 className="text-3xl font-bold">Locale Manager</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild><Button>Create New Locale</Button></DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-xl">Create Locale</DialogTitle>
                <DialogDescription className="text-base">Add a new locale to this variant group.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input id="name" value={newLocaleName} onChange={(e) => setNewLocaleName(e.target.value)} className="col-span-3" placeholder="e.g., mr-IN"/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="fallback" className="text-right">Fallback ID</Label>
                  <Input id="fallback" value={fallbackId} onChange={(e) => setFallbackId(e.target.value)} className="col-span-3" placeholder="Optional: ID of another locale"/>
                </div>
              </div>
              <DialogFooter><Button type="submit" onClick={handleCreateLocale}>Save Locale</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="border rounded-lg">
        <Table>
          <TableCaption>A list of locales in this variant group.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Locale Name</TableHead>
              <TableHead>Fallback To (ID)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan="3" className="text-center h-24">Loading...</TableCell></TableRow>
            ) : error ? (
              <TableRow><TableCell colSpan="3" className="text-center h-24 text-red-500">{error}</TableCell></TableRow>
            ) : locales.length === 0 ? (
                <TableRow><TableCell colSpan="3" className="text-center h-24">No locales found for this group.</TableCell></TableRow>
            ) : (
              locales.map((locale) => (
                <TableRow key={locale.id}>
                  <TableCell className="font-medium">{locale.id}</TableCell>
                  <TableCell>{locale.name}</TableCell>
                  <TableCell>{locale.fallback_to || 'None'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}