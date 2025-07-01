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
import { OrderForm } from "./newOrderForm"

export function NewOrder() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Add Table</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Order</DialogTitle>
        </DialogHeader>
        <OrderForm/>
      </DialogContent>
    </Dialog>
  )
}
