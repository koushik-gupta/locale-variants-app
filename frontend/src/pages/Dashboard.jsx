import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// Import the UI components
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Dashboard() {
  const [variantGroups, setVariantGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newGroupName, setNewGroupName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // This is now the single source for fetching data
  const fetchVariantGroups = () => {
    // Log the variable to be 100% sure
    console.log("Using API Base URL:", import.meta.env.VITE_API_BASE_URL);
    
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/variants`;
    
    setIsLoading(true);
    axios.get(apiUrl)
      .then(res => {
        setVariantGroups(res.data);
      })
      .catch(err => {
        console.error("Failed to fetch variant groups:", err);
        setError("Failed to load data. Please check the console for details.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // The useEffect hook now simply calls our main fetch function
  useEffect(() => {
    fetchVariantGroups();
  }, []);

  const handleCreateGroup = () => {
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/variants`;
    axios.post(apiUrl, { name: newGroupName })
      .then(res => {
        setIsDialogOpen(false);
        setNewGroupName("");
        fetchVariantGroups(); // Re-fetch after creating
      })
      .catch(err => {
        console.error("Failed to create variant group:", err);
        alert("Failed to create group. See console for details.");
      });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Variant Manager!</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create New Group</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl">Create Variant Group</DialogTitle>
              <DialogDescription className="text-base">
                Enter a name for your new variant group (e.g., "Region - Americas").
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input
                  id="name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g. Marathi Fallback"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleCreateGroup}>Save Group</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableCaption>A list of your configured variant groups.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan="3" className="text-center h-24">Loading...</TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan="3" className="text-center h-24 text-red-500">{error}</TableCell>
              </TableRow>
            ) : variantGroups.length === 0 ? (
              <TableRow>
                <TableCell colSpan="3" className="text-center h-24">No variant groups found. Create one to get started!</TableCell>
              </TableRow>
            ) : (
              variantGroups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">{group.id}</TableCell>
                  <TableCell>
                    <Link to={`/group/${group.id}`} className="font-medium text-primary underline-offset-4 hover:underline">
                      {group.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">{new Date(group.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}