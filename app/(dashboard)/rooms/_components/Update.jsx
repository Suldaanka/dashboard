"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useMutate } from "@/hooks/useMutate"
import { useQueryClient } from "@tanstack/react-query"

const FormSchema = z.object({
  number: z.coerce.number().min(1, {
    message: "Must be a valid room number",
  }),
  price: z.coerce.number().min(2, {
    message: "Must be a valid room price",
  }),
  type: z.enum(["SINGLE", "DOUBLE", "FAMILY"], {
    message: "Must select a valid room type",
  }),
  status: z.enum(["AVAILABLE", "OCCUPIED", "MAINTENANCE"], {
    message: "Must select a valid room status",
  }),
})

export function Update({ room }) {
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      number: room?.number || 0,
      price: room?.price || 0,
      type: room?.type || "",
      status: room?.status || "",
    },
  })

  const { mutate } = useMutate(
    `/api/rooms/update/${room.id}`,
    ['rooms'],  
    { 
      method: 'PUT'     
    }
  )

  function onSubmit(data) {
    mutate(data, {
      onSuccess: () => {
        toast.success("Room updated successfully!")
        queryClient.invalidateQueries({ queryKey: ["rooms"] })
        setIsOpen(false)
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update room")
      },
    })
  }

  const handleOpenChange = (open) => {
    setIsOpen(open)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <p className="px-2 cursor-pointer" onClick={(e) => {
          e.stopPropagation()
          setIsOpen(true)
        }}>Edit</p>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Room</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Number</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select room type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SINGLE">SINGLE</SelectItem>
                        <SelectItem value="DOUBLE">DOUBLE</SelectItem>
                        <SelectItem value="FAMILY">FAMILY</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select room status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="AVAILABLE">AVAILABLE</SelectItem>
                        <SelectItem value="OCCUPIED">OCCUPIED</SelectItem>
                        <SelectItem value="MAINTENANCE">MAINTENANCE</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-between gap-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit">Update Room</Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}