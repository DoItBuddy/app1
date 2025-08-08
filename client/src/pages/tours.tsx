import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Download, Eye, Edit, Trash2, MapPin, Calendar, Users, DollarSign, Route } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import TourDialog from "@/components/dialogs/tour-dialog";
import ExportDialog from "@/components/dialogs/export-dialog";
import type { Tour } from "@shared/schema";

export default function Tours() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [showTourDialog, setShowTourDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const { toast } = useToast();

  const { data: tours, isLoading } = useQuery({
    queryKey: ['/api/tours'],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/tours/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tours'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({ title: "Tour deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete tour", variant: "destructive" });
    },
  });

  const exportMutation = useMutation({
    mutationFn: (format: string) => apiRequest('POST', '/api/export/tours', { format }),
    onSuccess: (response) => {
      const data = response.json();
      toast({ title: "Export completed successfully" });
    },
    onError: () => {
      toast({ title: "Export failed", variant: "destructive" });
    },
  });

  const filteredTours = tours?.filter((tour: Tour) => {
    const matchesSearch = tour.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tour.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || tour.status === statusFilter;
    const matchesLocation = locationFilter === "all" || tour.location === locationFilter;
    
    return matchesSearch && matchesStatus && matchesLocation;
  }) || [];

  const locations = [...new Set(tours?.map((tour: Tour) => tour.location) || [])];

  const handleEdit = (tour: Tour) => {
    setEditingTour(tour);
    setShowTourDialog(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this tour?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleExport = (format: string) => {
    exportMutation.mutate(format);
    setShowExportDialog(false);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading tours...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Tour Management</h3>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={() => setShowExportDialog(true)}
            data-testid="export-tours-button"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button onClick={() => setShowTourDialog(true)} data-testid="add-tour-button">
            <Plus className="w-4 h-4 mr-2" />
            Add New Tour
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search tours..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="search-tours"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger data-testid="status-filter">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger data-testid="location-filter">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="date" data-testid="date-filter" />
          </div>
        </CardContent>
      </Card>

      {/* Tours Table */}
      <Card>
        <CardContent className="p-0">
          {filteredTours.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tour</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTours.map((tour: Tour) => (
                  <TableRow key={tour.id} data-testid={`tour-row-${tour.id}`}>
                    <TableCell>
                      <div className="flex items-center">
                        <img 
                          src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40" 
                          alt="Tour thumbnail" 
                          className="w-10 h-10 rounded-lg object-cover mr-3"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{tour.name}</div>
                          <div className="text-sm text-gray-500">{tour.description}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{tour.location}</TableCell>
                    <TableCell>{tour.startDate} - {tour.endDate}</TableCell>
                    <TableCell>{tour.capacity} people</TableCell>
                    <TableCell className="font-medium">${tour.price}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={tour.status === 'active' ? 'default' : 'secondary'}
                        className={tour.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {tour.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" data-testid={`view-tour-${tour.id}`}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEdit(tour)}
                          data-testid={`edit-tour-${tour.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(tour.id)}
                          data-testid={`delete-tour-${tour.id}`}
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
              <Route className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tours found</h3>
              <p className="text-gray-500 mb-6">Start by adding your first tour to get started</p>
              <Button onClick={() => setShowTourDialog(true)} data-testid="add-first-tour">
                <Plus className="w-4 h-4 mr-2" />
                Add New Tour
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <TourDialog
        open={showTourDialog}
        onOpenChange={(open) => {
          setShowTourDialog(open);
          if (!open) setEditingTour(null);
        }}
        tour={editingTour}
      />
      
      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        onExport={handleExport}
        title="Export Tours"
        isLoading={exportMutation.isPending}
      />
    </div>
  );
}
