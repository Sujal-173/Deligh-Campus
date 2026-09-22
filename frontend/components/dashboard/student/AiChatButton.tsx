"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MessageCircleQuestion } from "lucide-react";

export default function AiChatButton() {
  return (
    <Button
      size="lg"
      variant="outline"
      onClick={() =>
        toast.info(
          "The AI assistant is not enabled in the current product release.",
        )
      }
    >
      <MessageCircleQuestion className="h-4 w-4" />
      AI Chat
    </Button>
  );
}
