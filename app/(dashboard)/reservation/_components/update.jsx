"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useUser, useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useMutate } from "@/hooks/useMutate";
import Loading from "@/components/Loading";

// ✅ Schema
const FormSchema = z.object({
  fullname: z.string().optional(),
  phone: z.string().optional(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  guests: z.string().optional(),
  roomType: z.string().optional(),
  status: z.string().optional(),
});

export function Update({ reservation }) {
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      fullname: reservation?.fullName || "",
      phone: reservation?.phoneNumber || "",
      checkIn: reservation?.checkIn?.slice(0, 10) || "", // Assume ISO string
      checkOut: reservation?.checkOut?.slice(0, 10) || "",
      guests: reservation?.guests?.toString() || "",
      roomType: reservation?.roomType?.toLowerCase() || "",
      status: reservation?.status?.toUpperCase() || "",
    },
  });

  const queryClient = useQueryClient();
  const { mutate } = useMutate(`/api/reservation/update/${reservation.id}`, ["reservation"], {
    method: "PUT",
  });

  const { user: reduxUser, status: reduxStatus } = useSelector((state) => state.user);
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const { isLoaded: isAuthLoaded } = useAuth();

  const [finalUser, setFinalUser] = useState(null);

  useEffect(() => {
    if (reduxUser && reduxStatus === "succeeded") {
      setFinalUser(reduxUser);
    } else if (clerkUser) {
      setFinalUser({
        id: clerkUser.id,
        name: clerkUser.fullName || `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
        email: clerkUser.emailAddresses[0]?.emailAddress,
        image: clerkUser.imageUrl,
        role: clerkUser.publicMetadata?.role || "USER",
      });
    }
  }, [reduxUser, reduxStatus, clerkUser]);

  if (!isAuthLoaded || !isClerkLoaded || (reduxStatus === "loading" && !clerkUser)) {
    return <Loading />;
  }

  if (!finalUser) {
    return (
      <div className="text-center text-destructive mt-4">
        User not found. Please sign in again.
      </div>
    );
  }

  function onSubmit(data) {
    mutate(data, {
      onSuccess: () => {
        toast.success("Reservation updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["reservation"] });
        form.reset();
      },
      onError: () => {
        toast.error("Failed to update reservation.");
      },
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <p className="px-2 cursor-pointer text-blue-600 hover:underline">Update</p>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Reservation</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-4">
            <FormField
              control={form.control}
              name="fullname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="checkIn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Check-In</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="checkOut"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Check-Out</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="guests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guests</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select guests" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Guests</SelectLabel>
                          {[1, 2, 3, 4, 5].map((g) => (
                            <SelectItem key={g} value={g.toString()}>
                              {g} Guest{g > 1 && "s"}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="roomType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Type</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select room type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Room Type</SelectLabel>
                          <SelectItem value="single">SINGLE</SelectItem>
                          <SelectItem value="double">DOUBLE</SelectItem>
                          <SelectItem value="suite">SUITE</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Reservation Status</SelectLabel>
                          <SelectItem value="PENDING">PENDING</SelectItem>
                          <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
                          <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                          <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Update Reservation
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
