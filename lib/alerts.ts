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

export const ALERTS: Alert[] = [
  {
    id: "ALR-2041",
    timestamp: "2026-04-25 21:42:11",
    cameraId: "CAM-01",
    cameraLabel: "Aisle 4 — Cosmetics",
    store: "Target #4421 — Cambridge",
    status: "abnormal",
    confidence: 0.94,
    classification: "Concealment / Shoplifting",
    action: "Called 911",
    responder: "CPD Dispatch",
    durationSec: 38,
    notes: "Subject concealed two fragrance boxes in tote. Audio ping triggered to nearest LP.",
  },
  {
    id: "ALR-2040",
    timestamp: "2026-04-25 20:17:54",
    cameraId: "CAM-06",
    cameraLabel: "Apparel — Denim",
    store: "Target #4421 — Cambridge",
    status: "abnormal",
    confidence: 0.87,
    classification: "Tag Tampering",
    action: "Dispatched LP Officer",
    responder: "M. Alvarez",
    durationSec: 22,
    notes: "Two security tags removed at fitting room entrance. LP intercepted at exit.",
  },
  {
    id: "ALR-2039",
    timestamp: "2026-04-25 18:03:09",
    cameraId: "CAM-08",
    cameraLabel: "Liquor Aisle",
    store: "Target #4421 — Cambridge",
    status: "abnormal",
    confidence: 0.78,
    classification: "Suspicious Loitering",
    action: "Notified Manager",
    responder: "K. Patel",
    durationSec: 71,
    notes: "Subject handled premium bottle 4× without selecting. Manager floor-walked aisle.",
  },
  {
    id: "ALR-2038",
    timestamp: "2026-04-25 16:47:31",
    cameraId: "CAM-02",
    cameraLabel: "Self-Checkout B",
    store: "Target #4421 — Cambridge",
    status: "false-positive",
    confidence: 0.61,
    classification: "Skip-Scan (False Positive)",
    action: "Logged & Ignored",
    responder: "Auto-Triage",
    durationSec: 14,
    notes: "Reweigh confirmed item scanned. Model logged for retraining.",
  },
  {
    id: "ALR-2037",
    timestamp: "2026-04-25 14:22:08",
    cameraId: "CAM-05",
    cameraLabel: "Entrance — North",
    store: "Target #4421 — Cambridge",
    status: "abnormal",
    confidence: 0.83,
    classification: "Group Entry / Flash Mob Pattern",
    action: "Auto-locked Doors",
    responder: "System",
    durationSec: 9,
    notes: "Six subjects entered simultaneously matching ORC pattern. Vestibule auto-locked, recorded plates.",
  },
  {
    id: "ALR-2036",
    timestamp: "2026-04-25 12:11:44",
    cameraId: "CAM-01",
    cameraLabel: "Aisle 4 — Cosmetics",
    store: "Target #4421 — Cambridge",
    status: "resolved",
    confidence: 0.72,
    classification: "Concealment / Shoplifting",
    action: "SMS to Owner",
    responder: "R. Cho (Owner)",
    durationSec: 28,
    notes: "Owner SMS confirmed retrieval. Items recovered at exit.",
  },
  {
    id: "ALR-2035",
    timestamp: "2026-04-25 09:58:02",
    cameraId: "CAM-06",
    cameraLabel: "Apparel — Denim",
    store: "Target #4421 — Cambridge",
    status: "abnormal",
    confidence: 0.91,
    classification: "Repeat Offender Match",
    action: "Escalated to Regional",
    responder: "Regional LP",
    durationSec: 44,
    notes: "Face-similarity match against prior incident #ALR-1908 (Somerville).",
  },
  {
    id: "ALR-2034",
    timestamp: "2026-04-24 23:14:55",
    cameraId: "CAM-07",
    cameraLabel: "Loading Dock",
    store: "Target #4421 — Cambridge",
    status: "resolved",
    confidence: 0.68,
    classification: "Unauthorized Access",
    action: "Notified Manager",
    responder: "K. Patel",
    durationSec: 33,
    notes: "Vendor outside delivery window. Verified via badge swipe.",
  },
  {
    id: "ALR-2033",
    timestamp: "2026-04-24 19:39:17",
    cameraId: "CAM-03",
    cameraLabel: "Electronics — TVs",
    store: "Target #4421 — Cambridge",
    status: "abnormal",
    confidence: 0.88,
    classification: "Box Tampering",
    action: "Dispatched LP Officer",
    responder: "M. Alvarez",
    durationSec: 19,
    notes: "Subject opened sealed PS5 box on shelf. Item recovered, individual trespassed.",
  },
  {
    id: "ALR-2032",
    timestamp: "2026-04-24 17:02:48",
    cameraId: "CAM-08",
    cameraLabel: "Liquor Aisle",
    store: "Target #4421 — Cambridge",
    status: "abnormal",
    confidence: 0.81,
    classification: "Concealment / Shoplifting",
    action: "Called 911",
    responder: "CPD Dispatch",
    durationSec: 41,
    notes: "Subject placed two bottles in jacket. Refused to stop on contact.",
  },
  {
    id: "ALR-2031",
    timestamp: "2026-04-24 13:48:21",
    cameraId: "CAM-05",
    cameraLabel: "Entrance — North",
    store: "Target #4421 — Cambridge",
    status: "false-positive",
    confidence: 0.55,
    classification: "Group Entry (False Positive)",
    action: "Logged & Ignored",
    responder: "Auto-Triage",
    durationSec: 11,
    notes: "Verified family unit. Added negative sample to training queue.",
  },
  {
    id: "ALR-2030",
    timestamp: "2026-04-24 11:29:04",
    cameraId: "CAM-02",
    cameraLabel: "Self-Checkout B",
    store: "Target #4421 — Cambridge",
    status: "resolved",
    confidence: 0.74,
    classification: "Skip-Scan",
    action: "Notified Manager",
    responder: "K. Patel",
    durationSec: 26,
    notes: "Three items unscanned. Customer paid difference at service desk.",
  },
];

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
