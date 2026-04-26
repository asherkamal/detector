export type AlertStatus = "abnormal" | "normal" | "resolved" | "false-positive";
export type AlertAction =
  | "Called 911"
  | "Notified Manager"
  | "SMS to Owner"
  | "Auto-locked Doors"
  | "Dispatched LP Officer"
  | "Logged & Ignored"
  | "Escalated to Regional";

export type Alert = {
  id: string;
  timestamp: string;
  cameraId: string;
  cameraLabel: string;
  store: string;
  status: AlertStatus;
  confidence: number;
  classification: string;
  action: AlertAction;
  responder: string;
  durationSec: number;
  notes: string;
};

export const ALERTS: Alert[] = [];

export function alertStatusTone(status: AlertStatus): {
  text: string;
  bg: string;
  ring: string;
} {
  switch (status) {
    case "abnormal":
      return { text: "text-red-300", bg: "bg-red-500/15", ring: "ring-red-500/40" };
    case "resolved":
      return { text: "text-sky-300", bg: "bg-sky-500/15", ring: "ring-sky-500/40" };
    case "false-positive":
      return { text: "text-zinc-300", bg: "bg-zinc-500/15", ring: "ring-zinc-500/40" };
    default:
      return { text: "text-emerald-300", bg: "bg-emerald-500/15", ring: "ring-emerald-500/40" };
  }
}
