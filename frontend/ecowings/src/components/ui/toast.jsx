import * as ToastPrimitive from "@radix-ui/react-toast";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

const ToastProvider = ToastPrimitive.Provider;
const ToastViewport = ({ className, ...props }) => (
  <ToastPrimitive.Viewport
    className={cn("fixed bottom-4 right-4 z-[100] flex max-h-screen w-full max-w-sm flex-col gap-2", className)}
    {...props}
  />
);

function Toast({ className, variant = "default", ...props }) {
  return (
    <ToastPrimitive.Root
      className={cn(
        "group relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-xl border p-4 shadow-lg transition-all",
        variant === "destructive"
          ? "border-red-200 bg-red-50 text-red-900"
          : "border-slate-200 bg-white text-slate-900",
        className
      )}
      {...props}
    />
  );
}

function ToastTitle({ className, ...props }) {
  return <ToastPrimitive.Title className={cn("text-sm font-semibold", className)} {...props} />;
}
function ToastDescription({ className, ...props }) {
  return <ToastPrimitive.Description className={cn("text-sm opacity-90", className)} {...props} />;
}
function ToastClose({ className, ...props }) {
  return (
    <ToastPrimitive.Close
      className={cn("absolute right-2 top-2 rounded-md p-1 opacity-0 hover:opacity-100 group-hover:opacity-100", className)}
      {...props}
    >
      <X className="h-4 w-4" />
    </ToastPrimitive.Close>
  );
}
const ToastAction = ToastPrimitive.Action;

export { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, ToastAction };
