import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

// UI Components
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const API_BASE_URL = "https://locale-variants-app-production.up.railway.app";

export default function LocaleManager() {
  const { groupId } = useParams();
  const [variantGroup, setVariantGroup] = useState(null); // Store the whole group
  const [locales, setLocales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [newLocaleCode, setNewLocaleCode] = useState('');
  const [newLocaleName, setNewLocaleName] = useState('');
  const [fallbackCode, setFallbackCode] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch locales for this variant group
  const fetchLocales = () => {
    setIsLoading(true);
    fetch(`${API_BASE_URL}/api/variants/${groupId}`)
      .then(res => {
        if (!res.ok) throw new Error(`Network response not ok. Status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setVariantGroup(data);
        // CORRECT: Read locales from the 'metadata' property
        setLocales(data.metadata?.locales || []);
        setError(null);
      })
      .catch(err => {
        console.error(`Failed to fetch locales for group ${groupId}:`, err);
        setError("Failed to load locales.");
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchLocales();
  }, [groupId]);

  // Add a new locale
  const handleCreateLocale = () => {
    if (!newLocaleCode || !newLocaleName) {
      alert("Please provide both code and name for the locale.");
      return;
    }

    const updatedLocales = [
      ...locales,
      {
        code: newLocaleCode,
        name: newLocaleName,
        fallback_locale: fallbackCode || null // Use null if no fallback
      }
    ];

    fetch(`${API_BASE_URL}/api/variants/${groupId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locales: updatedLocales })
    })
    .then(res => {
      if (!res.ok) throw new Error(`Network response not ok. Status: ${res.status}`);
      return res.json();
    })
    .then(() => {
      // Refetch data from the server to ensure consistency
      fetchLocales();
      setIsDialogOpen(false);
      setNewLocaleCode('');
      setNewLocaleName('');
      setFallbackCode('');
    })
    .catch(err => {
      console.error('Failed to update locales:', err);
      alert("Failed to add locale. Check console for details.");
    });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-4">
        <Link to="/" className="text-sm text-primary hover:underline">
          &larr; Back to Variant Groups
        </Link>
        <div className="flex justify-between items-center mt-2">
          <h1 className="text-3xl font-bold">
            Locale Manager for <span className="text-primary">{variantGroup?.name}</span>
          </h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild><Button>Add New Locale</Button></DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-xl">Add Locale</DialogTitle>
                <DialogDescription className="text-base">
                  Add a new locale and its fallback rule to this variant group.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="localeCode" className="text-right">Locale Code</Label>
                  <Input id="localeCode" value={newLocaleCode} onChange={(e) => setNewLocaleCode(e.target.value)} className="col-span-3" placeholder="e.g., mr-IN"/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="localeName" className="text-right">Name</Label>
                  <Input id="localeName" value={newLocaleName} onChange={(e) => setNewLocaleName(e.target.value)} className="col-span-3" placeholder="e.g., Marathi"/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="fallbackCode" className="text-right">Fallback Code</Label>
                  <Input id="fallbackCode" value={fallbackCode} onChange={(e) => setFallbackCode(e.target.value)} className="col-span-3" placeholder="Optional: e.g., hi-IN"/>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleCreateLocale}>Save Locale</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableCaption>List of locale fallback rules for this variant group.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Fallback</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan="3" className="text-center h-24">Loading...</TableCell></TableRow>
            ) : error ? (
              <TableRow><TableCell colSpan="3" className="text-center h-24 text-red-500">{error}</TableCell></TableRow>
            ) : locales.length === 0 ? (
              <TableRow><TableCell colSpan="3" className="text-center h-24">No locales defined. Click "Add New Locale" to begin.</TableCell></TableRow>
            ) : (
              locales.map(locale => (
                <TableRow key={locale.code}>
                  <TableCell className="font-medium">{locale.code}</TableCell>
                  <TableCell>{locale.name}</TableCell>
                  <TableCell>{locale.fallback_locale || 'None'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}