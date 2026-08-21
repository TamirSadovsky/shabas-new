export default function PowerButtons() {
  if (!window.electronAPI) return null;

  const onShutdown = async () => {
    const ok = await window.electronAPI.confirmShutdown();
    if (ok) window.electronAPI.shutdownNow();
  };

  return (
    <div style={{ display:'flex', gap:10 }}>
      <button onClick={onShutdown}>כבה טאבלט</button>
    </div>
  );
}
