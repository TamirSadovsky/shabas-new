import { useEffect, useState } from 'react';
import axiosInstance from './axios.config';

const POLL_MS = 30000;
const unavailableBattery = {
    hasBattery: false,
    percent: null,
    isCharging: false,
    acConnected: false
};

const fromNavigatorBattery = (battery) => ({
    hasBattery: true,
    percent: Math.round(Number(battery.level) * 100),
    isCharging: !!battery.charging,
    acConnected: !!battery.charging
});

export default function useBattery() {
    const [battery, setBattery] = useState(null);

    useEffect(() => {
        let cancelled = false;
        let pollId;
        let unsubscribeElectron;
        let navigatorBattery;
        let onNavigatorChange;

        const apply = (next) => {
            if (!cancelled) {
                setBattery(next);
            }
        };

        const readServerBattery = async () => {
            const { data } = await axiosInstance.get('/api/battery');
            apply(data);
        };

        const watchNavigatorBattery = async () => {
            if (typeof navigator === 'undefined' || typeof navigator.getBattery !== 'function') {
                apply(unavailableBattery);
                return;
            }

            navigatorBattery = await navigator.getBattery();
            if (cancelled) {
                return;
            }

            onNavigatorChange = () => apply(fromNavigatorBattery(navigatorBattery));
            onNavigatorChange();
            navigatorBattery.addEventListener('levelchange', onNavigatorChange);
            navigatorBattery.addEventListener('chargingchange', onNavigatorChange);
        };

        const start = async () => {
            if (typeof window !== 'undefined' && window.electronAPI?.getBattery) {
                try {
                    apply(await window.electronAPI.getBattery());
                } catch {
                    apply(unavailableBattery);
                }
                unsubscribeElectron = window.electronAPI.subscribeBattery?.((next) => apply(next));
                return;
            }

            try {
                await readServerBattery();
                if (cancelled) {
                    return;
                }
                pollId = setInterval(() => {
                    readServerBattery().catch(() => {});
                }, POLL_MS);
            } catch {
                await watchNavigatorBattery().catch(() => apply(unavailableBattery));
            }
        };

        start();

        return () => {
            cancelled = true;
            if (pollId) {
                clearInterval(pollId);
            }
            if (unsubscribeElectron) {
                unsubscribeElectron();
            }
            if (navigatorBattery && onNavigatorChange) {
                navigatorBattery.removeEventListener('levelchange', onNavigatorChange);
                navigatorBattery.removeEventListener('chargingchange', onNavigatorChange);
            }
        };
    }, []);

    return battery;
}
