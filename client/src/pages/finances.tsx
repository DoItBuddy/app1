import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Download, Edit, Trash2, TrendingUp, TrendingDown, DollarSign, Receipt, PieChart } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import TransactionDialog from "@/components/dialogs/transaction-dialog";
import ExportDialog from "@/components/dialogs/export-dialog";
import type { Transaction } from "@shared/schema";

export default function Finances() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const { toast } = useToast();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['/api/transactions'],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/transactions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({ title: "Transaction deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete transaction", variant: "destructive" });
    },
  });

  const exportMutation = useMutation({
    mutationFn: (format: string) => apiRequest('POST', '/api/export/transactions', { format }),
    onSuccess: (response) => {
      toast({ title: "Export completed successfully" });
    },
    onError: () => {
      toast({ title: "Export failed", variant: "destructive" });
    },
  });

  const filteredTransactions = (transactions as Transaction[] | undefined)?.filter((transaction: Transaction) => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || transaction.type === typeFilter;
    
    return matchesSearch && matchesType;
  }) || [];

  // Calculate financial stats
  const income = (transactions as Transaction[] | undefined)?.filter((t: Transaction) => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount as string), 0) || 0;
  
  const expenses = (transactions as Transaction[] | undefined)?.filter((t: Transaction) => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount as string), 0) || 0;
  
  const netProfit = income - expenses;

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowTransactionDialog(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleExport = (format: string) => {
    exportMutation.mutate(format);
    setShowExportDialog(false);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading financial data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Financial Tracking</h3>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={() => setShowExportDialog(true)}
            data-testid="export-finances-button"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={() => setShowTransactionDialog(true)} data-testid="add-transaction-button">
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-600">Total Income</h4>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600" data-testid="total-income">${income.toFixed(2)}</p>
            <p className="text-sm text-gray-600 mt-2">This month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-600">Total Expenses</h4>
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-red-600" data-testid="total-expenses">${expenses.toFixed(2)}</p>
            <p className="text-sm text-gray-600 mt-2">This month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-600">Net Profit</h4>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className={`text-3xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} data-testid="net-profit">
              ${netProfit.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600 mt-2">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Income by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <PieChart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No income recorded yet</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <PieChart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No expenses recorded yet</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
            <div className="flex space-x-3">
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
                data-testid="search-transactions"
              />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48" data-testid="type-filter">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredTransactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction: Transaction) => (
                  <TableRow key={transaction.id} data-testid={`transaction-row-${transaction.id}`}>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.type === 'income' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type === 'income' ? (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        {transaction.type}
                      </span>
                    </TableCell>
                    <TableCell className="capitalize">{transaction.category}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell className={`font-medium ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEdit(transaction)}
                          data-testid={`edit-transaction-${transaction.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(transaction.id)}
                          data-testid={`delete-transaction-${transaction.id}`}
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
              <Receipt className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions recorded</h3>
              <p className="text-gray-500 mb-6">Start by adding your first financial record</p>
              <Button onClick={() => setShowTransactionDialog(true)} data-testid="add-first-transaction">
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <TransactionDialog
        open={showTransactionDialog}
        onOpenChange={(open) => {
          setShowTransactionDialog(open);
          if (!open) setEditingTransaction(null);
        }}
        transaction={editingTransaction}
      />
      
      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        onExport={handleExport}
        title="Export Financial Report"
        isLoading={exportMutation.isPending}
      />
    </div>
  );
}
