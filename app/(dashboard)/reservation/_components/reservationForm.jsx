"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useAuth, useUser } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
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

import Loading from "@/components/Loading";
import { useMutate } from "@/hooks/useMutate";

// ✅ Schema
const FormSchema = z.object({
  fullname: z.string().min(2, { message: "Name must be at least 2 characters" }),
  phone: z.string().min(2, { message: "Phone must be at least 2 characters" }),
  checkIn: z.string().min(2, { message: "Check-in date is required" }),
  checkOut: z.string().min(2, { message: "Check-out date is required" }),
  guests: z.string().min(1, { message: "Select number of guests" }),
  roomType: z.string().min(1, { message: "Select a room type" }),
});

export function ReservationForm() {
  const { user: reduxUser, status: reduxStatus } = useSelector((state) => state.user);
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const { isLoaded: isAuthLoaded } = useAuth();

  const [finalUser, setFinalUser] = useState(null);

  // 💡 Hydrate user like Orders Page
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

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      fullname: "",
      phone: "",
      checkIn: "",
      checkOut: "",
      guests: "",
      roomType: "",
    },
  });

  const { mutate } = useMutate("/api/reservation/add", ["reservation"]);

  // 🧠 Submit
  function onSubmit(data) {
    if (!finalUser) {
      toast.error("User not found. Please sign in again.");
      return;
    }

    mutate(
      { user: finalUser.id, ...data },
      {
        onSuccess: () => {
          toast.success("Reservation created successfully!");
          form.reset();
        },
        onError: () => {
          toast.error("Failed to create reservation or no room available");
        },
      }
    );
  }

  // 🔁 Wait for auth state
  if (!isAuthLoaded || !isClerkLoaded || (reduxStatus === "loading" && !clerkUser)) {
    return <Loading />;
  }

  if (!finalUser) {
    return (
      <div className="text-center text-destructive mt-6">
        User not found. Please log in again.
      </div>
    );
  }

  // ✅ Render Form
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <FormField
          control={form.control}
          name="fullname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your full name" {...field} />
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
                <Input placeholder="Enter your phone number" {...field} />
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
                <Input type="datetime-local" {...field} />
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
                <Input type="datetime-local" {...field} />
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
                  <SelectTrigger>
                    <SelectValue placeholder="Select number of guests" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Guests</SelectLabel>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} Guest{num > 1 && "s"}
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
                  <SelectTrigger>
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Room Types</SelectLabel>
                      {["single", "double", "family"].map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.toUpperCase()}
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

        <Button type="submit" className="w-full">
          Submit Reservation
        </Button>
      </form>
    </Form>
  );
}
