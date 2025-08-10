import React, { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';

interface AttendeeQRCodeProps {
  eventId: string;
  joinToken: string;
  size?: number;
  label?: string;
}

const AttendeeQRCode: React.FC<AttendeeQRCodeProps> = ({ eventId, joinToken, size = 192, label }) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  const payload = useMemo(() => ({ t: 'checkin', event: eventId, token: joinToken }), [eventId, joinToken]);

  useEffect(() => {
    const gen = async () => {
      try {
        const url = await QRCode.toDataURL(JSON.stringify(payload), {
          width: size,
          margin: 1,
          color: { dark: '#000000', light: '#ffffff' },
        });
        setDataUrl(url);
      } catch (e) {
        setDataUrl('');
      }
    };
    gen();
  }, [payload, size]);

  if (!joinToken) return null;

  return (
    <div className="flex flex-col items-center gap-2">
      {label && <div className="text-sm text-muted-foreground">{label}</div>}
      {dataUrl ? (
        <img src={dataUrl} width={size} height={size} alt={`QR code for event check-in token ${joinToken}`} />
      ) : (
        <div className="w-[192px] h-[192px] bg-muted" />
      )}
      <code className="text-xs text-muted-foreground">{joinToken}</code>
    </div>
  );
};

export default AttendeeQRCode;
