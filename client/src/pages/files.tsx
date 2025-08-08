import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, FileText, Image, Folder, HardDrive, Grid, List, Search, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ExportDialog from "@/components/dialogs/export-dialog";
import type { File } from "@shared/schema";

export default function Files() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: files, isLoading } = useQuery({
    queryKey: ['/api/files'],
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => {
      return fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
      toast({ title: "File uploaded successfully" });
    },
    onError: () => {
      toast({ title: "Failed to upload file", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/files/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
      toast({ title: "File deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete file", variant: "destructive" });
    },
  });

  const filteredFiles = files?.filter((file: File) => {
    const matchesSearch = file.originalName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || file.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  }) || [];

  // Calculate file stats
  const stats = {
    total: files?.length || 0,
    documents: files?.filter((f: File) => f.category === 'documents').length || 0,
    images: files?.filter((f: File) => f.category === 'images').length || 0,
    totalSize: files?.reduce((sum, f: File) => sum + f.fileSize, 0) || 0,
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-8 h-8 text-purple-600" />;
    return <FileText className="w-8 h-8 text-blue-600" />;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'documents'); // Default category

    uploadMutation.mutate(formData);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length === 0) return;

    const formData = new FormData();
    formData.append('file', files[0]);
    formData.append('category', 'documents');

    uploadMutation.mutate(formData);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this file?")) {
      deleteMutation.mutate(id);
    }
  };

  const categories = [
    { key: "all", label: "All", count: stats.total },
    { key: "documents", label: "Documents", count: stats.documents },
    { key: "reports", label: "Reports", count: 0 },
    { key: "images", label: "Images", count: stats.images },
    { key: "contracts", label: "Contracts", count: 0 },
    { key: "other", label: "Other", count: 0 },
  ];

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading files...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">File Manager</h3>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={() => setShowExportDialog(true)}
            data-testid="export-files-button"
          >
            <Download className="w-4 h-4 mr-2" />
            Export List
          </Button>
          <Button 
            onClick={() => fileInputRef.current?.click()}
            data-testid="upload-files-button"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            multiple
          />
        </div>
      </div>

      {/* File Upload Area */}
      <Card
        className="border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="p-12 text-center">
          <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h4 className="text-lg font-medium text-gray-800 mb-2">Upload Files</h4>
          <p className="text-gray-600 mb-4">Drag and drop files here, or <span className="text-primary font-medium">browse to upload</span></p>
          <p className="text-sm text-gray-500">Supports: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, ZIP and more</p>
        </CardContent>
      </Card>

      {/* File Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Files</p>
                <p className="text-2xl font-bold text-gray-800" data-testid="total-files">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Documents</p>
                <p className="text-2xl font-bold text-green-600" data-testid="total-documents">{stats.documents}</p>
              </div>
              <FileText className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Images</p>
                <p className="text-2xl font-bold text-purple-600" data-testid="total-images">{stats.images}</p>
              </div>
              <Image className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Size</p>
                <p className="text-2xl font-bold text-orange-600" data-testid="total-size">{formatFileSize(stats.totalSize)}</p>
              </div>
              <HardDrive className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* File Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.key}
                variant={categoryFilter === category.key ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter(category.key)}
                data-testid={`filter-${category.key}`}
              >
                {category.label} ({category.count})
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Files List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">All Files</CardTitle>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                  data-testid="search-files"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("grid")}
                data-testid="grid-view"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("list")}
                data-testid="list-view"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredFiles.length > 0 ? (
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-2"}>
              {filteredFiles.map((file: File) => (
                <div
                  key={file.id}
                  className={`border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${
                    viewMode === "list" ? "flex items-center justify-between" : ""
                  }`}
                  data-testid={`file-item-${file.id}`}
                >
                  <div className={`flex items-center ${viewMode === "list" ? "flex-1" : "mb-3"}`}>
                    {getFileIcon(file.fileType)}
                    <div className="ml-3">
                      <h4 className="font-medium text-gray-900">{file.originalName}</h4>
                      <p className="text-sm text-gray-500">{formatFileSize(file.fileSize)}</p>
                      {viewMode === "grid" && (
                        <Badge variant="secondary" className="mt-1">
                          {file.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {viewMode === "list" && (
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{file.category}</Badge>
                      <span className="text-sm text-gray-500">{file.uploadDate}</span>
                    </div>
                  )}
                  <div className={`flex items-center space-x-2 ${viewMode === "grid" ? "mt-3" : ""}`}>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(file.id)}
                      data-testid={`delete-file-${file.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Folder className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No files uploaded</h3>
              <p className="text-gray-500 mb-6">Upload your first document to get started</p>
              <Button 
                onClick={() => fileInputRef.current?.click()}
                data-testid="upload-first-file"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Dialog */}
      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        onExport={(format) => {
          toast({ title: `File list exported in ${format.toUpperCase()} format` });
          setShowExportDialog(false);
        }}
        title="Export File List"
        isLoading={false}
      />
    </div>
  );
}
