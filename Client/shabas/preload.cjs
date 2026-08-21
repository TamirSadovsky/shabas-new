const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  shutdownNow: () => ipcRenderer.send('shutdown-now'),
  confirmShutdown: () => ipcRenderer.invoke('confirm-shutdown'),
  getBattery: () => ipcRenderer.invoke('get-battery'),
  subscribeBattery: (cb) => {
    ipcRenderer.send('subscribe-battery');
    const listener = (_e, payload) => cb(payload);
    ipcRenderer.on('battery-update', listener);
    return () => {
      ipcRenderer.removeListener('battery-update', listener);
      ipcRenderer.send('unsubscribe-battery');
    };
  },
});
