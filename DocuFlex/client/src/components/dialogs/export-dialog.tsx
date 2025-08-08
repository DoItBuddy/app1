import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FileText, FileSpreadsheet, FileImage, Download, Calendar } from "lucide-react";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (format: string, dateRange?: { from: string; to: string }) => void;
  title: string;
  isLoading: boolean;
}

export default function ExportDialog({ 
  open, 
  onOpenChange, 
  onExport, 
  title, 
  isLoading 
}: ExportDialogProps) {
  const [format, setFormat] = useState("pdf");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const handleExport = () => {
    const dateRange = dateFrom && dateTo ? { from: dateFrom, to: dateTo } : undefined;
    onExport(format, dateRange);
  };

  const formatOptions = [
    {
      value: "pdf",
      label: "PDF Document",
      icon: FileText,
      color: "text-red-600",
      description: "Portable Document Format - Great for reports and presentations"
    },
    {
      value: "excel",
      label: "Excel Spreadsheet",
      icon: FileSpreadsheet,
      color: "text-green-600",
      description: "Microsoft Excel format - Perfect for data analysis"
    },
    {
      value: "word",
      label: "Word Document",
      icon: FileImage,
      color: "text-blue-600",
      description: "Microsoft Word format - Ideal for formatted documents"
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" data-testid="export-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Download className="w-5 h-5" />
            <span>{title}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-4">
            <Label className="text-sm font-medium text-gray-700">Export Format</Label>
            <RadioGroup value={format} onValueChange={setFormat} className="space-y-3">
              {formatOptions.map((option) => (
                <div key={option.value} className="flex items-start space-x-3">
                  <RadioGroupItem 
                    value={option.value} 
                    id={option.value}
                    className="mt-1"
                    data-testid={`format-${option.value}`}
                  />
                  <div className="flex-1">
                    <Label 
                      htmlFor={option.value} 
                      className="flex items-center space-x-3 cursor-pointer"
                    >
                      <option.icon className={`w-5 h-5 ${option.color}`} />
                      <div>
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-500 mt-1">{option.description}</div>
                      </div>
                    </Label>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Date Range Selection */}
          <div className="space-y-4">
            <Label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Date Range (Optional)</span>
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="date-from" className="text-sm text-gray-600">From</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="mt-1"
                  data-testid="export-date-from"
                />
              </div>
              <div>
                <Label htmlFor="date-to" className="text-sm text-gray-600">To</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="mt-1"
                  data-testid="export-date-to"
                />
              </div>
            </div>
          </div>

          {/* Export Info */}
          <div className="bg-cream rounded-lg p-4 border border-desert-sand">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Download className="w-4 h-4 text-primary" />
              </div>
              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-800 mb-1">Export Information</p>
                <p>
                  Your {format.toUpperCase()} file will be generated and downloaded automatically. 
                  {dateFrom && dateTo && (
                    <span> Data will be filtered from {dateFrom} to {dateTo}.</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              data-testid="cancel-export"
            >
              Cancel
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleExport}
              disabled={isLoading}
              data-testid="confirm-export"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export {format.toUpperCase()}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
