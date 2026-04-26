export type CameraStatus = "normal" | "monitoring" | "alert";

export type Camera = {
  id: string;
  label: string;
  zone: string;
  store: string;
  videoSrc: string | null;
  poster: string | null;
  status: CameraStatus;
  threat: number;
  fps: number;
  resolution: string;
  uptimeHours: number;
  lastEvent: string;
};

export const CAMERAS: Camera[] = [];

const _CAMERAS_UNUSED: Camera[] = [
  {
    id: "CAM-01",
    label: "Aisle 4 — Cosmetics",
    zone: "North Wing",
    store: "Target #4421 — Cambridge",
    videoSrc: "/videos/cam-01.mp4",
    poster: null,
    status: "alert",
    threat: 0.94,
    fps: 24,
    resolution: "1080p",
    uptimeHours: 312,
    lastEvent: "Concealment detected",
  },
  {
    id: "CAM-02",
    label: "Self-Checkout B",
    zone: "Front End",
    store: "Target #4421 — Cambridge",
    videoSrc: "/videos/cam-02.mp4",
    poster: null,
    status: "monitoring",
    threat: 0.61,
    fps: 24,
    resolution: "1080p",
    uptimeHours: 312,
    lastEvent: "Loitering > 90s",
  },
  {
    id: "CAM-03",
    label: "Electronics — TVs",
    zone: "South Wing",
    store: "Target #4421 — Cambridge",
    videoSrc: "/videos/cam-03.mp4",
    poster: null,
    status: "normal",
    threat: 0.08,
    fps: 30,
    resolution: "4K",
    uptimeHours: 312,
    lastEvent: "Routine traffic",
  },
  {
    id: "CAM-04",
    label: "Pharmacy Counter",
    zone: "Center",
    store: "Target #4421 — Cambridge",
    videoSrc: "/videos/cam-04.mp4",
    poster: null,
    status: "normal",
    threat: 0.04,
    fps: 24,
    resolution: "1080p",
    uptimeHours: 312,
    lastEvent: "Customer assisted",
  },
  {
    id: "CAM-05",
    label: "Entrance — North",
    zone: "Perimeter",
    store: "Target #4421 — Cambridge",
    videoSrc: "/videos/cam-05.mp4",
    poster: null,
    status: "monitoring",
    threat: 0.42,
    fps: 30,
    resolution: "1080p",
    uptimeHours: 312,
    lastEvent: "Group entry",
  },
  {
    id: "CAM-06",
    label: "Apparel — Denim",
    zone: "East Wing",
    store: "Target #4421 — Cambridge",
    videoSrc: "/videos/cam-06.mp4",
    poster: null,
    status: "alert",
    threat: 0.87,
    fps: 24,
    resolution: "1080p",
    uptimeHours: 312,
    lastEvent: "Tag tampering",
  },
  {
    id: "CAM-07",
    label: "Loading Dock",
    zone: "Back of House",
    store: "Target #4421 — Cambridge",
    videoSrc: "/videos/cam-07.mp4",
    poster: null,
    status: "normal",
    threat: 0.11,
    fps: 24,
    resolution: "1080p",
    uptimeHours: 312,
    lastEvent: "Truck arrival",
  },
  {
    id: "CAM-08",
    label: "Liquor Aisle",
    zone: "West Wing",
    store: "Target #4421 — Cambridge",
    videoSrc: "/videos/cam-08.mp4",
    poster: null,
    status: "monitoring",
    threat: 0.55,
    fps: 24,
    resolution: "1080p",
    uptimeHours: 312,
    lastEvent: "Bottle handled 4×",
  },
  {
    id: "CAM-09",
    label: "Parking Lot — South",
    zone: "Perimeter",
    store: "Target #4421 — Cambridge",
    videoSrc: "/videos/cam-09.mp4",
    poster: null,
    status: "normal",
    threat: 0.06,
    fps: 15,
    resolution: "1080p",
    uptimeHours: 312,
    lastEvent: "Routine traffic",
  },
];

export function getCamera(id: string): Camera | undefined {
  return CAMERAS.find((c) => c.id === id);
}

export function statusTone(status: CameraStatus): {
  label: string;
  text: string;
  bg: string;
  ring: string;
  dot: string;
} {
  switch (status) {
    case "alert":
      return {
        label: "ALERT",
        text: "text-red-300",
        bg: "bg-red-500/15",
        ring: "ring-red-500/40",
        dot: "bg-red-400",
      };
    case "monitoring":
      return {
        label: "MONITORING",
        text: "text-amber-300",
        bg: "bg-amber-500/15",
        ring: "ring-amber-500/40",
        dot: "bg-amber-400",
      };
    default:
      return {
        label: "NORMAL",
        text: "text-emerald-300",
        bg: "bg-emerald-500/15",
        ring: "ring-emerald-500/40",
        dot: "bg-emerald-400",
      };
  }
}
