import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ReservationForm,} from "./reservationForm"

export function Addreservation() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Add Reservation</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add reservation</DialogTitle>
        </DialogHeader>
        <ReservationForm/>
      </DialogContent>
    </Dialog>
  )
}
