import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useMutate } from "@/hooks/useMutate"
import { useSelector } from "react-redux"
const FormSchema = z.object({
  fullname: z.string().min(0, {
    message: "Must be at least 2 characters long",
  }),
  phone: z.string().min(0, {
    message: "Must be at least 2 characters long",
  }),
  checkIn: z.string().min(0, {
    message: "Must be at least 2 characters long",
  }),
  checkOut: z.string().min(0, {
    message: "Must be at least 2 characters long",
  }),
  guests: z.string().min(0, {
    message: "Please select number of guests"
  }),
  roomType: z.string().min(0, {
    message: "Please select room type"
  }),
  status: z.string().min(0, {
    message: "Please select status"
  })
})
export function Update({ reservation }) {
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      fullname: reservation?.fullName || '',
      phone: reservation?.phoneNumber || '',
      checkIn:  '',
      checkOut:  '',
      guests: reservation?.guests?.toString() || '',
      roomType: reservation?.roomType?.toLowerCase() || '',
      status: reservation?.status?.toUpperCase() || '',
    },
  })

  const { mutate } = useMutate(
    `/api/reservation/update/${reservation.id}`,
    ['reservation'],  
    { 
      method: 'PUT'     
    }
  );
 
   function onSubmit(data) {
    mutate(data, {
      onSuccess: () => {
        toast.success("Updated successfully!")
        queryClient.invalidateQueries({ queryKey: ["reservation"] });
        form.reset()
      },
      onError: (error) => {
        
      },
    })
   }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <p className="px-2 cursor-all-scroll">Update</p>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Expenses</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
              <FormField
                control={form.control}
                name="fullname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder={reservation.fullName} {...field} />
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
                      <Input placeholder={reservation?.phoneNumber || "This user has no phone number"} {...field} />
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
                    <FormLabel>Check-in Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={reservation.checkIn}
                        {...field}
                      />
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
                    <FormLabel>Check-out Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                      />
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
                            <SelectLabel>Number of Guests</SelectLabel>
                            <SelectItem value="1">1 Guest</SelectItem>
                            <SelectItem value="2">2 Guests</SelectItem>
                            <SelectItem value="3">3 Guests</SelectItem>
                            <SelectItem value="4">4 Guests</SelectItem>
                            <SelectItem value="5">5 Guests</SelectItem>
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
                            <SelectLabel>Select room type</SelectLabel>
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
                    <FormLabel>Select Status</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select room type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Update Status</SelectLabel>
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
              <Button type="submit">Update Reservation</Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
