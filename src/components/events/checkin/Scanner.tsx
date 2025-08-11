import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ScannerProps {
  eventId: string;
  onCheckIn?: (result: { registration_id: string; checkin_id: string | null }) => void;
}

const Scanner: React.FC<ScannerProps> = ({ eventId, onCheckIn }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [reader] = useState(() => new BrowserMultiFormatReader());
  const [active, setActive] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState<string | undefined>(undefined);

  useEffect(() => {
    (async () => {
      try {
        const devs = await navigator.mediaDevices.enumerateDevices();
        const cams = devs.filter((d) => d.kind === 'videoinput');
        setDevices(cams);
        if (cams[0] && !deviceId) setDeviceId(cams[0].deviceId);
      } catch {}
    })();
  }, [deviceId]);

  const start = async () => {
    if (!videoRef.current || !deviceId) return;
    setActive(true);
    try {
      await reader.decodeFromVideoDevice(deviceId, videoRef.current, async (res, err) => {
        if (res) {
          try {
            const txt = res.getText();
            const parsed = JSON.parse(txt);
            const token = parsed?.token as string;
            if (!token) return;
            const { data, error } = await supabase.rpc('rpc_check_in_by_token', { p_event: eventId, p_token: token });
            if (error) throw error;
            toast.success('Checked in');
            onCheckIn?.(data as any);
          } catch (e: any) {
            toast.error(typeof e?.message === 'string' ? e.message : 'Invalid token');
          }
        }
      });
    } catch (e) {
      setActive(false);
    }
  };

  const stop = () => {
    try { (reader as any).reset?.(); (reader as any).stopContinuousDecode?.(); } catch {}
    setActive(false);
  };
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <select className="border rounded px-2 py-1 text-sm" value={deviceId} onChange={(e) => setDeviceId(e.target.value)}>
          {devices.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>{d.label || 'Camera'}</option>
          ))}
        </select>
        {!active ? (
          <Button onClick={start}>Start scanner</Button>
        ) : (
          <Button variant="outline" onClick={stop}>Stop</Button>
        )}
      </div>
      <video ref={videoRef} className="w-full max-w-md rounded border" muted playsInline />
    </div>
  );
};

export default Scanner;
