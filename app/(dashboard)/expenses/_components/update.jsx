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
import { useFetch } from "@/hooks/useFetch"

const FormSchema = z.object({
  description: z.string().min(2, {
    message: "Must be at least 2 characters long",
  }),
  amount: z.string().min(1, {
    message: "Must be at least 2 characters long",
  }),
  category: z.string()
})
export function Update({ expenses }) {
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      description: expenses.description || '',
      amount: expenses?.amount || '',
      category: expenses?.category || '',
    },
  })

  const { execute } = useMutate(`/api/expense/update/${expenses.id}`, ['expenses'], { method: 'PUT' });

  function onSubmit(data) {
    execute(data)
  }

  const { data: categories } = useFetch("/api/expense/category", ['categories']);

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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input placeholder="amount" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {

                          categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))

                        }
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Update Expense</Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
