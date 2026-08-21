import React, { useEffect, useState, useId, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import MediaRow from '../../componenets/MediaRow/MediaRow';
import { PowerButton } from '../../componenets/Sliders/PowerSlider/PowerSlider.jsx';
import axiosInstance from '../../constants/axios.config.js';

import './HomePage.css';
import { cata1, cata4, cata5 } from '../../assets/cata_images.js';
import sbs_logo from '../../assets/sbs_logo.svg';
import logo_new from '../../assets/logo_new.png';
import instructionsPdf from '../../assets/instructions.pdf';
import audio1 from '../../assets/sounds/matched1.mp3';
import audio2 from '../../assets/sounds/matched2.mp3';
import chevronIcon from '../../assets/chevron-right.png';

// הקובץ אינו נמצא ב-repo; יש להניח אותו ב-public/assets כדי שהנגן יעבוד
const exampleVideo = '/assets/file_example.mp4';

// ==========================================
// BATTERY COMPONENTS (Figma Design)
// ==========================================

/* SVG Component for Battery */
function BatteryIcon({ percent = 0, charging = false, showPercent = true, clipId, unavailable = false }) {
    const w = Math.max(0, Math.min(28, Math.round((percent / 100) * 28)));
    let color = '#22c55e'; // Green
    if (percent < 20) color = '#ef4444'; // Red
    else if (percent < 50) color = '#f59e0b'; // Orange
    if (unavailable) color = '#9ca3af'; // Gray

    const label = unavailable ? '־' : `${Math.round(percent)}%`;

    return (
        <div className="battery-container">
            {/* הותאם למידות ולצבעים מה-Figma (30x20 עם סקייל קל לנראות) */}
            <svg viewBox="0 0 36 18" width="42" height="22" aria-hidden="true">
                {/* מסגרת הסוללה - צבע מדויק מפיגמה #354052 */}
                <rect x="1" y="3" width="30" height="12" rx="2" ry="2" fill="transparent" stroke="#354052" strokeWidth="2" />
                {/* קצה הסוללה (פלוס) */}
                <rect x="32" y="6" width="3" height="6" rx="1" ry="1" fill="#354052" />

                <clipPath id={clipId}>
                    <rect x="2" y="4" width={unavailable ? 28 : w} height="10" rx="1" ry="1" />
                </clipPath>

                {/* מילוי הסוללה */}
                <rect x="2" y="4" width="28" height="10" rx="1" ry="1" fill={color} clipPath={`url(#${clipId})`} />

                {/* ברק טעינה */}
                {!unavailable && charging && (
                    <path d="M15 5 l-3 5 h3 l-1 5 l4-7 h-3 l2-3 z" fill="#fff" opacity="0.9" />
                )}
            </svg>

            {/* טקסט האחוזים בחוץ וברור */}
            {showPercent && (
                <span className="battery-percent-text">{label}</span>
            )}
        </div>
    );
}

/* Smart Battery Button */
function BatteryButton() {
    const [stateIndex, setStateIndex] = useState(0);
    const clipId = useId?.() || 'bat-clip-fixed';

    // מערך של מצבי סוללה שונים להדגמה
    const demoStates = [
        { hasBattery: true, percent: 100, isCharging: false }, // ירוק מלא
        { hasBattery: true, percent: 65, isCharging: false },  // ירוק חלקי
        { hasBattery: true, percent: 35, isCharging: false },  // כתום
        { hasBattery: true, percent: 12, isCharging: false },  // אדום 
        { hasBattery: true, percent: 8, isCharging: true },    // אדום + ברק טעינה
        { hasBattery: false, percent: null, isCharging: false } // אפור - לא זמין
    ];

    useEffect(() => {
        // טיימר שמעביר למצב הבא כל 3000 אלפיות שנייה (3 שניות)
        const id = setInterval(() => {
            setStateIndex((prev) => (prev + 1) % demoStates.length);
        }, 3000);
        return () => clearInterval(id);
    }, []);

    const bat = demoStates[stateIndex];
    const hasBattery = bat?.hasBattery === true;
    const percent = typeof bat?.percent === 'number' ? bat.percent : 0;
    const unavailable = !hasBattery || bat?.percent == null;
    const title = unavailable ? 'סוללה: לא זמין' : `סוללה: ${percent}%${bat?.isCharging ? ' (בטעינה)' : ''}`;

    return (
        <div title={title} aria-label={title}>
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

// ==========================================
// Top Bar
// ==========================================
const TopBar = ({ userName }) => (
    <header className="hp-top-bar">
        <div className="hp-header-left">
            <PowerButton />
            <BatteryButton />
        </div>
        <div className="hp-header-right">
            <h1 className="hp-greeting-text">שלום {userName}</h1>
            <div className="hp-logo-group">
                <img src={logo_new} alt="atid" className="hp-atid-logo" />
                <img src={sbs_logo} alt="sbs" className="hp-sbs-logo" />
            </div>
        </div>
    </header>
);

// Section Header: Grouped Icon/Title (Right) | Arrow (Left)
const SectionHeader = ({ title, iconClass }) => (
    <div className="row-header-figma">
        <div className="header-right-group">
            <span className={`row-icon ${iconClass}`}></span>
            <h2 className="row-title-text">{title}</h2>
        </div>
        <div className="nav-arrow-box">
            <img src={chevronIcon} alt="arrow" className="figma-chevron-img" />
        </div>
    </div>
);

// ==========================================
// Audio Card
// ==========================================
const AudioCard = ({ title, audioUrl, isPlaying, onPlay, currentAudioObj }) => {
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        const lastPos = localStorage.getItem(`audio_pos_${audioUrl}`);
        if (lastPos) setCurrentTime(parseFloat(lastPos));
    }, [audioUrl]);

    useEffect(() => {
        let interval;
        if (isPlaying && currentAudioObj) {
            if (currentAudioObj.duration) setDuration(currentAudioObj.duration);

            interval = setInterval(() => {
                const current = currentAudioObj.currentTime;
                const total = currentAudioObj.duration;
                setCurrentTime(current);

                if (total) {
                    setDuration(total);
                    if (current >= total - 0.5) {
                        localStorage.setItem(`audio_pos_${audioUrl}`, 0);
                        setCurrentTime(0);
                    } else {
                        localStorage.setItem(`audio_pos_${audioUrl}`, current);
                    }
                }
            }, 500);
        } else {
            const lastPos = localStorage.getItem(`audio_pos_${audioUrl}`);
            if (lastPos) setCurrentTime(parseFloat(lastPos));
        }
        return () => clearInterval(interval);
    }, [isPlaying, currentAudioObj, audioUrl]);

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className={`audio-card-container ${isPlaying ? 'playing' : ''}`}>
            <div className="audio-visual-box">
                <div className="audio-time-display">
                    {isPlaying ? (
                        <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                    ) : (
                        currentTime > 0 ? <span>עצר ב-{formatTime(currentTime)}</span> : <span>0:00</span>
                    )}
                </div>
                <div className="audio-play-hotspot" onClick={(e) => { e.stopPropagation(); onPlay(); }}>
                    <div className="audio-play-overlay">
                        {isPlaying ? (
                            <svg width="30" height="30" fill="white" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                        ) : (
                            <svg width="30" height="30" fill="white" viewBox="0 0 24 24" style={{ marginRight: '-4px' }}><path d="M8 5v14l11-7z" /></svg>
                        )}
                    </div>
                </div>
                <div className="audio-progress-track">
                    <div className="audio-progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
            <div className="hp-card-label">{title}</div>
        </div>
    );
};

// Media/Learning Card
const MediaCard = ({ img, label, progress = "70%", onClick }) => (
    <div className="hp-media-card" onClick={onClick}>
        <div className="card-top-row">
            {/* 1. צד ימין: תמונה */}
            <div className="card-thumb-container">
                <img src={img} alt={label} className="card-thumb-img" />
            </div>

            {/* 2. צד שמאל: אחוזים */}
            <div className="card-progress-container">
                <span className="progress-status-text">הושלמו</span>
                <span className="progress-value-text">{progress}</span>
            </div>
        </div>

        {/* 3. חלק תחתון: כותרת הקובץ */}
        <div className="card-footer">
            <span className="card-title-text">{label}</span>
        </div>
    </div>
);

// Video Card
const VideoCard = ({ img, label, onClick }) => (
    <div className="hp-video-card" onClick={onClick}>
        <div className="video-thumb-container">
            <img src={img} alt={label} className="video-thumb-img" />
        </div>
        <div className="video-footer">
            <span className="video-title-text">{label}</span>
        </div>
    </div>
);

// Article/PDF Card
const ArticleCard = ({ title, pdfUrl, onOpenModal }) => (
    <div className="hp-article-card" onClick={() => pdfUrl && onOpenModal(pdfUrl)}>
        {/* אזור עליון: תצוגה מקדימה של ה-PDF */}
        <div className="article-preview-container">
            {pdfUrl ? (
                <div className="pdf-preview-wrapper">
                    <iframe
                        src={`${pdfUrl}#page=1&toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                        title={title}
                        className="article-iframe"
                        scrolling="no"
                    />
                    <div className="article-click-shield"></div>
                </div>
            ) : (
                <span className="pdf-tag-red">PDF</span>
            )}
        </div>

        {/* חלק תחתון: כותרת הקובץ */}
        <div className="article-footer">
            <span className="article-title-text">{title}</span>
        </div>
    </div>
);

function HomePage({ setPageDirection }) {
    const userState = useSelector(state => state.user);
    const levelState = useSelector(state => state.level['regular']);
    const dispatch = useDispatch();

    // Audio States
    const [currentAudio, setCurrentAudio] = useState(null);
    const [playingUrl, setPlayingUrl] = useState(null);

    // Modal PDF State
    const [activePdfUrl, setActivePdfUrl] = useState(null);

    // Modal Video State
    const [activeVideoUrl, setActiveVideoUrl] = useState(null);

    const videoData = [
        { id: '4', label: 'יללוסטון.mp4', img: cata4 },
        { id: '5', label: 'המתנקשת.mp4', img: cata5 }
    ];

    const audioData = [
        { title: "שמע 1.mp3", url: audio1 },
        { title: "שמע 2.mp3", url: audio2 }
    ];

    const handleCategoryClick = (id) => {
        setPageDirection(false);
        dispatch({ type: 'PICK_CATEGORY', page: 'welcome', id });
    };

    const handlePlayAudio = (url) => {
        if (playingUrl === url) {
            currentAudio.pause(); setCurrentAudio(null); setPlayingUrl(null);
            return;
        }
        if (currentAudio) currentAudio.pause();

        const audio = new Audio(url);
        const savedPos = localStorage.getItem(`audio_pos_${url}`);

        audio.onloadedmetadata = () => {
            if (savedPos && parseFloat(savedPos) < audio.duration - 0.5) {
                audio.currentTime = parseFloat(savedPos);
            } else {
                audio.currentTime = 0;
                localStorage.setItem(`audio_pos_${url}`, 0);
            }
            audio.play();
        };

        if (audio.readyState >= 1) {
            if (savedPos && parseFloat(savedPos) < audio.duration - 0.5) {
                audio.currentTime = parseFloat(savedPos);
            } else {
                audio.currentTime = 0;
            }
            audio.play();
        }

        setCurrentAudio(audio);
        setPlayingUrl(url);

        audio.onended = () => {
            setPlayingUrl(null);
            localStorage.setItem(`audio_pos_${url}`, 0);
        };
    };

    // PDF Modal Handlers
    const handleOpenPdf = (url) => {
        if (currentAudio) { currentAudio.pause(); setCurrentAudio(null); setPlayingUrl(null); }
        setActivePdfUrl(url);
    };
    const handleClosePdf = () => setActivePdfUrl(null);

    // Video Modal Handlers
    const handleOpenVideo = (url) => {
        if (currentAudio) { currentAudio.pause(); setCurrentAudio(null); setPlayingUrl(null); }
        setActiveVideoUrl(url);
    };
    const handleCloseVideo = () => setActiveVideoUrl(null);

    // נעילת גלילה כשמודאל וידאו פתוח (מונע scrollbar ורקע בצד)
    useEffect(() => {
        if (activeVideoUrl) {
            document.body.classList.add('video-modal-open');
            return () => document.body.classList.remove('video-modal-open');
        }
    }, [activeVideoUrl]);

    return (
        <div className="hp-wrapper figma-namespace">
            <div className="watermark-bg"></div>

            <TopBar userName={userState.fullName || 'ישראל ישראלי'} />

            <main className="hp-main-content">
                {levelState && Object.keys(levelState).length > 0 && (
                    <div className="section-container">
                        <SectionHeader title="למידה" iconClass="icon-edit" />
                        <MediaRow>
                            {Object.keys(levelState).map(id => (
                                <MediaCard key={id} img={cata1} label={levelState[id].name} onClick={() => handleCategoryClick(id)} />
                            ))}
                        </MediaRow>
                    </div>
                )}

                <div className="section-container">
                    <SectionHeader title="קריאה" iconClass="icon-book" />
                    <MediaRow>
                        <ArticleCard title="מאמר 1" pdfUrl={instructionsPdf} onOpenModal={handleOpenPdf} />
                        <ArticleCard title="מאמר 2" pdfUrl={instructionsPdf} onOpenModal={handleOpenPdf} />
                        <ArticleCard title="מאמר 2" pdfUrl={instructionsPdf} onOpenModal={handleOpenPdf} />
                        <ArticleCard title="מאמר 2" pdfUrl={instructionsPdf} onOpenModal={handleOpenPdf} />
                        <ArticleCard title="מאמר 2" pdfUrl={instructionsPdf} onOpenModal={handleOpenPdf} />
                        <ArticleCard title="מאמר 2" pdfUrl={instructionsPdf} onOpenModal={handleOpenPdf} />
                        <ArticleCard title="מאמר 2" pdfUrl={instructionsPdf} onOpenModal={handleOpenPdf} />
                        <ArticleCard title="מאמר 2" pdfUrl={instructionsPdf} onOpenModal={handleOpenPdf} />
                        <ArticleCard title="מאמר 2" pdfUrl={instructionsPdf} onOpenModal={handleOpenPdf} />
                        <ArticleCard title="מאמר 2" pdfUrl={instructionsPdf} onOpenModal={handleOpenPdf} />


                    </MediaRow>
                </div>

                <div className="section-container">
                    <SectionHeader title="צפייה" iconClass="icon-video" />
                    <MediaRow>
                        <VideoCard img={cata4} label="סרטון 1.mp4" onClick={() => handleOpenVideo(exampleVideo)} />
                        {videoData.map(v => (
                            <VideoCard key={v.id} img={v.img} label={v.label} onClick={() => handleOpenVideo(exampleVideo)} />
                        ))}
                    </MediaRow>
                </div>

                <div className="section-container">
                    <SectionHeader title="האזנה" iconClass="icon-music" />
                    <MediaRow>
                        {audioData.map((audio, index) => (
                            <AudioCard
                                key={index} title={audio.title} audioUrl={audio.url}
                                isPlaying={playingUrl === audio.url}
                                onPlay={() => handlePlayAudio(audio.url)}
                                currentAudioObj={playingUrl === audio.url ? currentAudio : null}
                            />
                        ))}
                    </MediaRow>
                </div>
            </main>

            {/* FIXED PDF Modal Reader */}
            {activePdfUrl && (
                <div className="pdf-modal-overlay" onClick={handleClosePdf}>
                    <div className="pdf-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="pdf-close-btn" onClick={handleClosePdf}>✖</button>
                        <iframe
                            src={`${activePdfUrl}#view=FitH&navpanes=0&toolbar=0&scrollbar=0&statusbar=0&messages=0`}
                            title="PDF Reader"
                            className="pdf-reader-iframe"
                        />
                        {/* חוסם הלחיצות וההסתרה של תוסף Adobe Acrobat */}
                        <div className="pdf-adobe-blocker"></div>
                    </div>
                </div>
            )}

            {/* Video Modal Player – overlay ייעודי למסך מלא */}
            {activeVideoUrl && (
                <div className="video-modal-overlay" onClick={handleCloseVideo}>
                    <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="pdf-close-btn" onClick={handleCloseVideo}>✖</button>
                        <video
                            src={activeVideoUrl}
                            controls
                            autoPlay
                            className="video-player-element"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default HomePage;