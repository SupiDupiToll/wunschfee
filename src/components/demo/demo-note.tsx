import { Info } from "lucide-react";

interface DemoNoteProps {
  text: string;
}

export function DemoNote({ text }: DemoNoteProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary">
      <Info className="h-3.5 w-3.5 flex-shrink-0" />
      {text}
    </div>
  );
}
