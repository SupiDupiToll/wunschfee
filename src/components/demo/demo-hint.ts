import { toast } from "sonner";

export const DEMO_MESSAGE = "Demo-Modus: Hier ist nichts veränderbar.";

export function demoHint() {
  toast.info(DEMO_MESSAGE);
}
