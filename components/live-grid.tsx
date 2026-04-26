"use client";

import { useCallback, useMemo, useState } from "react";
import { AlertBannerStack, type LiveAlert } from "@/components/alert-banner";
import { LiveTile, type LiveVerdict } from "@/components/live-tile";
import { ToastStack, type Toast } from "@/components/action-toast";
import type { Camera } from "@/lib/cameras";
import type { DatasetClip } from "@/lib/dataset";

export type LiveEvent = {
  uid: string;
  cameraId: string;
  cameraLabel: string;
  classification: string;
  confidence: number;
  abnormal: boolean;
  at: number;
  action?: string;
};

const ALERT_THRESHOLD = 0.5;

type SlotType = "normal" | "abnormal";
type Slot = { type: SlotType; clip: DatasetClip };

// Deterministic abnormal slot index for first paint (avoids SSR/CSR mismatch).
const INITIAL_ABNORMAL_SLOT = 4;

export function LiveGrid({
  cameras,
  clips,
  onEvent,
}: {
  cameras: Camera[];
  clips: DatasetClip[];
  onEvent?: (evt: LiveEvent) => void;
}) {
  const { normalPool, abnormalPool, fallbackClip } = useMemo(() => {
    const normalPool = clips.filter((c) => c.prediction === "normal");
    const abnormalPool = clips.filter((c) => c.prediction === "shoplifting");
    return { normalPool, abnormalPool, fallbackClip: clips[0] };
  }, [clips]);

  const initialSlots = useMemo<Slot[]>(() => {
    return cameras.map((_, i) => {
      const type: SlotType = i === INITIAL_ABNORMAL_SLOT ? "abnormal" : "normal";
      const pool = type === "abnormal" ? abnormalPool : normalPool;
      const clip = pool[i % Math.max(pool.length, 1)] ?? fallbackClip;
      return { type, clip };
    });
  }, [cameras, normalPool, abnormalPool, fallbackClip]);

  const [slots, setSlots] = useState<Slot[]>(initialSlots);
  const [alerts, setAlerts] = useState<LiveAlert[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const onEventRef = useMemo(() => ({ fn: onEvent }), [onEvent]);
  onEventRef.fn = onEvent;

  const handleVerdict = useCallback(
    (v: LiveVerdict) => {
      const abnormal =
        v.clip.prediction === "shoplifting" && v.clip.confidence >= ALERT_THRESHOLD;
      const evt: LiveEvent = {
        uid: `${v.camera.id}-${v.at}`,
        cameraId: v.camera.id,
        cameraLabel: v.camera.label,
        classification:
          v.clip.category === "Shoplifting" ? "Concealment / Shoplifting" : "Routine Activity",
        confidence: v.clip.confidence,
        abnormal,
        at: v.at,
      };
      onEventRef.fn?.(evt);

      if (abnormal) {
        setAlerts((prev) => {
          const recent = prev.find(
            (a) => a.camera.id === v.camera.id && Date.now() - a.at < 4000,
          );
          if (recent) return prev;
          return [
            { uid: evt.uid, camera: v.camera, clip: v.clip, at: v.at },
            ...prev,
          ];
        });
      }
    },
    [onEventRef],
  );

  // When a tile finishes its cycle, swap in a new clip of the same type so
  // the grid stays at 8 normal + 1 abnormal at all times.
  const handleEnded = useCallback(
    (slotIdx: number) => {
      setSlots((prev) => {
        const slot = prev[slotIdx];
        if (!slot) return prev;
        const pool = slot.type === "abnormal" ? abnormalPool : normalPool;
        if (pool.length === 0) return prev;
        const candidates = pool.length > 1 ? pool.filter((c) => c.id !== slot.clip.id) : pool;
        const next = candidates[Math.floor(Math.random() * candidates.length)];
        const copy = prev.slice();
        copy[slotIdx] = { ...slot, clip: next };
        return copy;
      });
    },
    [normalPool, abnormalPool],
  );

  const dismissAlert = useCallback((uid: string) => {
    setAlerts((prev) => prev.filter((a) => a.uid !== uid));
  }, []);

  const onAction = useCallback((label: string, alert: LiveAlert) => {
    const tone: Toast["tone"] =
      label === "Call 911" ? "red" : label === "Notify Manager" ? "sky" : "emerald";
    const body =
      label === "Call 911"
        ? `Dispatch contacted · ${alert.camera.label} · ${alert.camera.id}`
        : label === "Notify Manager"
        ? `Manager pinged · ${alert.camera.label}`
        : `SMS sent to owner on file · ${alert.camera.id}`;
    setToasts((prev) => [
      { uid: `${alert.uid}-${label}`, label: `${label} — confirmed`, body, tone },
      ...prev,
    ]);
  }, []);

  const dismissToast = useCallback((uid: string) => {
    setToasts((prev) => prev.filter((t) => t.uid !== uid));
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cameras.map((cam, i) => (
          <LiveTile
            key={cam.id}
            camera={cam}
            clip={slots[i].clip}
            index={i}
            onVerdict={handleVerdict}
            onEnded={() => handleEnded(i)}
          />
        ))}
      </div>
      <AlertBannerStack alerts={alerts} onDismiss={dismissAlert} onAction={onAction} />
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
