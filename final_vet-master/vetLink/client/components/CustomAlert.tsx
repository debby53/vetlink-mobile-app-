import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LucideIcon } from "lucide-react";

export interface CustomAlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  icon?: LucideIcon;
  iconColor?: string;
  actionLabel?: string;
  actionColor?: string;
  onAction?: () => void;
  cancelLabel?: string;
  showCancel?: boolean;
}

export function CustomAlert({
  open,
  onOpenChange,
  title,
  description,
  icon: Icon,
  iconColor = "text-blue-500",
  actionLabel = "OK",
  actionColor = "bg-blue-600 hover:bg-blue-700",
  onAction,
  cancelLabel = "Cancel",
  showCancel = false,
}: CustomAlertProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {Icon && <Icon className={`w-5 h-5 ${iconColor}`} />}
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-3 justify-end pt-4">
          {showCancel && <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>}
          <AlertDialogAction
            onClick={() => {
              onAction?.();
              onOpenChange(false);
            }}
            className={actionColor}
          >
            {actionLabel}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
