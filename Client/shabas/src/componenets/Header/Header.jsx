  import { useEffect, useState, useId } from 'react';
  import './Header.css';
  import { useDispatch, useSelector } from 'react-redux';
  import PriamryButton from '../PrimaryButton/PrimaryButton';
  import user_icon from '../../assets/user_icon.svg';
  import logServiceInstance from '../../logService';

  // ===== Icons =====
  function PowerIcon() {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path d="M12 2.5v8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M6.2 6.9a7.5 7.5 0 1 0 11.6 0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    );
  }

  function BatteryIcon({ percent = 0, charging = false, showPercent = true, clipId, unavailable = false }) {
    // width for the fill (0..28)
    const w = Math.max(0, Math.min(28, Math.round((percent / 100) * 28)));

    // color logic
    let color = '#16a34a'; // green
    if (percent < 20) color = '#dc2626'; // red
    else if (percent < 50) color = '#f59e0b'; // orange
    if (unavailable) color = '#9ca3af'; // grey when unavailable

    // label inside battery
    const label = unavailable ? '־' : String(Math.round(percent)); // ״־״ (מקף עברי) כמצב N/A

    return (
      <svg viewBox="0 0 36 18" width="26" height="14" aria-hidden="true">
        {/* Outline */}
        <rect x="1" y="3" width="30" height="12" rx="3" ry="3" fill="none" stroke="#444" strokeWidth="2" />
        {/* Pin */}
        <rect x="32" y="6" width="3" height="6" rx="1" ry="1" fill="#444" />
        {/* Level (clip for fill) */}
        <clipPath id={clipId}>
          <rect x="2" y="4" width={unavailable ? 28 : w} height="10" rx="2" ry="2" />
        </clipPath>
        <rect x="2" y="4" width="28" height="10" rx="2" ry="2" fill={color} clipPath={`url(#${clipId})`} />
        {/* Charging bolt */}
        {!unavailable && charging && (
          <path d="M15 5 l-3 5 h3 l-1 5 l4-7 h-3 l2-3 z" fill="#fff" opacity="0.9" />
        )}
        {/* Numeric percent or dash */}
        {showPercent && (
          <text x="16" y="12" textAnchor="middle" fontSize="7" fontWeight="700" fill="#111">
            {label}
          </text>
        )}
      </svg>
    );
  }

  // ===== Battery (always visible) =====
  function BatteryButton() {
    const [bat, setBat] = useState(null);
    const clipId = useId?.() || 'bat-clip-fixed';

    useEffect(() => {
      let unsub;
      (async () => {
        if (!window.electronAPI) {
          // No Electron → still show widget as unavailable
          setBat({ hasBattery: false, percent: null, isCharging: false, acConnected: false });
          return;
        }
        try {
          const initial = await window.electronAPI.getBattery();
          setBat(initial);
        } catch {
          setBat({ hasBattery: false, percent: null, isCharging: false, acConnected: false });
        }
        unsub = window.electronAPI.subscribeBattery((b) => setBat(b));
      })();
      return () => { if (unsub) unsub(); };
    }, []);

    const hasAPI = !!window.electronAPI;
    const hasBattery = bat?.hasBattery === true;
    const percent = typeof bat?.percent === 'number' ? bat.percent : 0;
    const unavailable = !hasAPI || !hasBattery || bat?.percent == null;

    const title = unavailable
      ? 'סוללה: לא זמין'
      : `סוללה: ${percent}%${bat?.isCharging ? ' (בטעינה)' : ''}`;

    return (
      <div
        title={title}
        aria-label={title}
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          width: 36,
          height: 36,
          borderRadius: 10,
          background: 'rgba(255,255,255,0.95)',
          border: '1px solid rgba(0,0,0,0.15)',
          display: 'grid',
          placeItems: 'center',
          boxShadow: '0 4px 14px rgba(0,0,0,0.10)',
          zIndex: 60,
          pointerEvents: 'none', // לא חוסם קליקים על הלוגו שמתחת
        }}
      >
        <BatteryIcon
          percent={percent}
          charging={!!bat?.isCharging}
          showPercent={true}
          clipId={clipId}
          unavailable={unavailable}
        />
      </div>
    );
  }

function Header({ setPageDirection }) {
  const dispatch = useDispatch();
  const userState = useSelector((state) => state.user);
  const categoryState = useSelector((state) => state.level);
  const pageState = useSelector((state) => state.page);

  const handleExitButton = () => {
    console.log('[Header] יציאה נלחץ', {
      pageStateBefore: pageState,
      userId: userState.id,
    });

    const data = {
      userId: userState.id,
      categoryId: 0,
      questionId: 0,
      isQuestion: 0,
      isCorrect: 0,
      answer: 'exit',
    };

    logServiceInstance.log(data);

    setPageDirection(true);

    dispatch({ type: 'PICK_CATEGORY', page: 'welcome', id: '0' });

    console.log('[Header] dispatch PICK_CATEGORY בוצע', {
      page: 'welcome',
      id: '0',
    });
  };

    const onPowerClick = async () => {
      if (!window.electronAPI) return;
      const ok = await window.electronAPI.confirmShutdown();
      if (ok) window.electronAPI.shutdownNow();
    };

    const RIGHT_OFFSET_PX = 150;
    const isWelcome = pageState.page === 'welcome';
    const canShowPower = typeof window !== 'undefined' && window.electronAPI && isWelcome;

    return (
      <>
        <header className="header" style={{ position: 'relative' }}>
          {/* Battery at top-left — ALWAYS visible */}
          <BatteryButton />

          {/* Power button — only on the welcome page */}
          {canShowPower && (
            <button
              onClick={onPowerClick}
              title="כבה מחשב"
              aria-label="כבה מחשב"
              style={{
                position: 'absolute',
                top: 53,
                right: RIGHT_OFFSET_PX,
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(255,255,255,0.95)',
                border: '1px solid rgba(0,0,0,0.15)',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,0,0,0.10)',
                transition: 'transform 120ms ease, background 120ms ease',
                color: '#d11a2a',
                zIndex: 50,
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <PowerIcon />
            </button>
          )}

          {isWelcome && 'יחידות לימוד ללמידה עצמית'}

          {!isWelcome && (
            <div className="header_content">
              <PriamryButton
                text="יציאה"
                width="81px"
                height="48px"
                backgroundColor="rgba(237, 247, 254, 0.6)"
                textColor="#3072AF"
                fontSize="20px"
                onClick={handleExitButton}
                wrapperStyle={{ transform: 'translateX(40px)' }} // הזזה עדינה ימינה
              />

              {pageState.page !== 'final_work' &&
                categoryState['regular'] &&
                categoryState['regular'][pageState.id] && (
                  <div className="header_title">
                    יחידת לימוד: {categoryState['regular'][pageState.id].name}
                  </div>
                )}

              {pageState.page === 'final_work' &&
                categoryState['finalWork'] &&
                categoryState['finalWork'][pageState.id] && (
                  <div className="header_title">
                    פרויקט גמר: {categoryState['finalWork'][pageState.id].name}
                  </div>
                )}

              <div className="user_info">
                <p className="user_name">{userState.fullName}</p>
                <p>:משתמש</p>
                <img src={user_icon} style={{ height: '21px' }} />
              </div>
            </div>
          )}
        </header>
      </>
    );
  }

  export default Header;
