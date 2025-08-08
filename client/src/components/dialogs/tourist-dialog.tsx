import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertTouristSchema, type Tourist } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TouristDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tourist?: Tourist | null;
}

export default function TouristDialog({ open, onOpenChange, tourist }: TouristDialogProps) {
  const { toast } = useToast();
  const isEdit = !!tourist;

  const { data: tours } = useQuery({
    queryKey: ['/api/tours'],
  });

  const form = useForm({
    resolver: zodResolver(insertTouristSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      nationality: "",
      tourId: "",
      bookingDate: new Date().toISOString().split('T')[0],
      status: "pending" as const,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/tourists', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tourists'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({ title: "Tourist added successfully" });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to add tourist", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiRequest('PUT', `/api/tourists/${tourist?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tourists'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({ title: "Tourist updated successfully" });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to update tourist", variant: "destructive" });
    },
  });

  useEffect(() => {
    if (tourist) {
      form.reset({
        name: tourist.name,
        email: tourist.email,
        phone: tourist.phone || "",
        nationality: tourist.nationality || "",
        tourId: tourist.tourId || "",
        bookingDate: tourist.bookingDate,
        status: tourist.status as "confirmed" | "pending" | "cancelled",
      });
    } else {
      form.reset({
        name: "",
        email: "",
        phone: "",
        nationality: "",
        tourId: "",
        bookingDate: new Date().toISOString().split('T')[0],
        status: "pending",
      });
    }
  }, [tourist, form]);

  const onSubmit = (data: any) => {
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" data-testid="tourist-dialog">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Tourist" : "Add New Tourist"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} data-testid="tourist-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email" {...field} data-testid="tourist-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} data-testid="tourist-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nationality</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter nationality" {...field} data-testid="tourist-nationality" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tourId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tour</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="tourist-tour">
                          <SelectValue placeholder="Select a tour" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tours?.map((tour: any) => (
                          <SelectItem key={tour.id} value={tour.id}>
                            {tour.name} - {tour.location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bookingDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Booking Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="tourist-booking-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="tourist-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                data-testid="cancel-tourist"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="save-tourist"
              >
                {isEdit ? "Update Tourist" : "Add Tourist"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
