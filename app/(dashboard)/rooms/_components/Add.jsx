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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RoomsForm } from "./roomsForm"

export function Addroom() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Add Room</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add roome</DialogTitle>
        </DialogHeader>
        <RoomsForm/>
      </DialogContent>
    </Dialog>
  )
}
