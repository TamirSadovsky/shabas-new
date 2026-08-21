import { useEffect, useState } from 'react';

export default function BatteryWidget() {
  const [battery, setBattery] = useState({ hasBattery:false, percent:null, isCharging:false, acConnected:false, timeRemaining:null });

  useEffect(() => {
    let unsub = null;
    if (window.electronAPI?.subscribeBattery) {
      unsub = window.electronAPI.subscribeBattery(setBattery);
    } else if (window.electronAPI?.getBattery) {
      window.electronAPI.getBattery().then(setBattery);
    }
    return () => { if (unsub) unsub(); };
  }, []);

  if (!battery.hasBattery) return <div>אין סוללה מזוהה</div>;

  const t = battery.timeRemaining;
  const time = typeof t === 'number' && t >= 0 ? `${Math.floor(t/60)}ש׳ ${t%60}ד׳` : null;

  return (
    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
      <span>סוללה: {battery.percent ?? '—'}%</span>
      <span>{battery.isCharging ? '״בטעינה״' : battery.acConnected ? '״מחובר לחשמל״' : '״על סוללה״'}</span>
      {time && <span>זמן נותר: {time}</span>}
    </div>
  );
}
