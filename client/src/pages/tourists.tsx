import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Download, Edit, Trash2, Users, CheckCircle, Clock, XCircle } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import TouristDialog from "@/components/dialogs/tourist-dialog";
import ExportDialog from "@/components/dialogs/export-dialog";
import type { Tourist } from "@shared/schema";

export default function Tourists() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showTouristDialog, setShowTouristDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [editingTourist, setEditingTourist] = useState<Tourist | null>(null);
  const { toast } = useToast();

  const { data: tourists, isLoading } = useQuery({
    queryKey: ['/api/tourists'],
  });

  const { data: tours } = useQuery({
    queryKey: ['/api/tours'],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/tourists/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tourists'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({ title: "Tourist deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete tourist", variant: "destructive" });
    },
  });

  const exportMutation = useMutation({
    mutationFn: (format: string) => apiRequest('POST', '/api/export/tourists', { format }),
    onSuccess: (response) => {
      toast({ title: "Export completed successfully" });
    },
    onError: () => {
      toast({ title: "Export failed", variant: "destructive" });
    },
  });

  const filteredTourists = (tourists as Tourist[] | undefined)?.filter((tourist: Tourist) => {
    const matchesSearch = tourist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (tourist.email && tourist.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || tourist.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  // Calculate stats
  const stats = {
    total: (tourists as Tourist[] | undefined)?.length || 0,
    confirmed: (tourists as Tourist[] | undefined)?.filter((t: Tourist) => t.status === 'confirmed').length || 0,
    pending: (tourists as Tourist[] | undefined)?.filter((t: Tourist) => t.status === 'pending').length || 0,
    cancelled: (tourists as Tourist[] | undefined)?.filter((t: Tourist) => t.status === 'cancelled').length || 0,
  };

  const getTourName = (tourId: string | null) => {
    if (!tourId) return "N/A";
    const tour = tours?.find((t: any) => t.id === tourId);
    return tour?.name || "Unknown Tour";
  };

  const handleEdit = (tourist: Tourist) => {
    setEditingTourist(tourist);
    setShowTouristDialog(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this tourist record?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleExport = (format: string) => {
    exportMutation.mutate(format);
    setShowExportDialog(false);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading tourists...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Tourist Records</h3>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={() => setShowExportDialog(true)}
            data-testid="export-tourists-button"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button onClick={() => setShowTouristDialog(true)} data-testid="add-tourist-button">
            <Plus className="w-4 h-4 mr-2" />
            Add Tourist
          </Button>
        </div>
      </div>

      {/* Tourist Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tourists</p>
                <p className="text-2xl font-bold text-gray-800" data-testid="total-tourists">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-green-600" data-testid="confirmed-tourists">{stats.confirmed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600" data-testid="pending-tourists">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-red-600" data-testid="cancelled-tourists">{stats.cancelled}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
                data-testid="search-tourists"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48" data-testid="status-filter">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tourists Table */}
      <Card>
        <CardContent className="p-0">
          {filteredTourists.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tourist</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Nationality</TableHead>
                  <TableHead>Tour</TableHead>
                  <TableHead>Booking Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTourists.map((tourist: Tourist) => (
                  <TableRow key={tourist.id} data-testid={`tourist-row-${tourist.id}`}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          <Users className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{tourist.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm text-gray-900">{tourist.email}</div>
                        <div className="text-sm text-gray-500">{tourist.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>{tourist.nationality || "N/A"}</TableCell>
                    <TableCell>{getTourName(tourist.tourId)}</TableCell>
                    <TableCell>{tourist.bookingDate}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={tourist.status === 'confirmed' ? 'default' : 'secondary'}
                        className={
                          tourist.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          tourist.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }
                      >
                        {tourist.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEdit(tourist)}
                          data-testid={`edit-tourist-${tourist.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(tourist.id)}
                          data-testid={`delete-tourist-${tourist.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tourists found</h3>
              <p className="text-gray-500 mb-6">Start by adding your first tourist record</p>
              <Button onClick={() => setShowTouristDialog(true)} data-testid="add-first-tourist">
                <Plus className="w-4 h-4 mr-2" />
                Add Tourist
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <TouristDialog
        open={showTouristDialog}
        onOpenChange={(open) => {
          setShowTouristDialog(open);
          if (!open) setEditingTourist(null);
        }}
        tourist={editingTourist}
      />
      
      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        onExport={handleExport}
        title="Export Tourists"
        isLoading={exportMutation.isPending}
      />
    </div>
  );
}
