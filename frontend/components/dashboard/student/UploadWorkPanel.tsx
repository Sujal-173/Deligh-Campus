"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud } from "lucide-react";
import { studentAssessmentService } from "@/services/student/assessment.service";

export default function UploadWorkPanel({
  assessmentId,
}: {
  assessmentId: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit() {
    if (!file) {
      toast.error("Choose a file before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      await studentAssessmentService.submitWork(assessmentId, file, comments);
      toast.success("Your work was submitted.");
      setFile(null);
      setComments("");
    } catch {
      toast.error("Couldn't submit your work — try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <p className="mb-1 font-semibold text-primary">Upload Your Work</p>
        <p className="mb-3 text-xs text-grey-50">
          Drag and drop your file or click to browse
        </p>
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const dropped = e.dataTransfer.files?.[0];
            if (dropped) setFile(dropped);
          }}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-grey-30 bg-grey-10 px-4 py-8 text-center hover:border-secondary"
        >
          <UploadCloud className="h-7 w-7 text-grey-50" />
          <p className="mt-2 text-sm text-grey-60">
            {file ? file.name : "Drag and drop your file here, or"}
          </p>
          {!file && (
            <Button variant="outline" size="sm" className="mt-3" type="button">
              Browse Files
            </Button>
          )}
          <p className="mt-2 text-[11px] text-grey-50">
            Supported formats: PDF, DOCX, ZIP (MAX 50MB)
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.zip"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
      </Card>

      <Card className="p-5">
        <p className="mb-1 font-semibold text-primary">
          Additional Comments (Optional)
        </p>
        <p className="mb-2 text-xs text-grey-50">
          Add any notes for your instructor
        </p>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={3}
          placeholder="Enter any additional information or note about your submission…"
          className="w-full rounded-lg border border-grey-20 px-3 py-2 text-sm text-primary placeholder:text-grey-50 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-10"
        />
        <Button
          className="mt-3 w-full"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Submitting…" : "Submit"}
        </Button>
      </Card>
    </div>
  );
}
