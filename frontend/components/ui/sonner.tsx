"use client";

// Re-export so app code can `import { toast } from "@/components/ui/sonner"`
// and stay consistent with the shadcn/ui convention. The <Toaster /> itself
// is mounted once in app/layout.tsx.
export { toast } from "sonner";
