import { useEffect, useState, useId } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import MediaRow from '../../componenets/MediaRow/MediaRow';
import { PowerButton } from '../../componenets/Sliders/PowerSlider/PowerSlider.jsx';
import axiosInstance from '../../constants/axios.config.js';
import { resolveMediaUrl } from '../../constants/mediaUrl.js';

import './HomePage.css';
import { cata1, cata4, cata5 } from '../../assets/cata_images.js';
import sbs_logo from '../../assets/sbs_logo.svg';
import logo_new from '../../assets/logo_new.png';
import chevronIcon from '../../assets/chevron-right.png';

const fallbackBook = {
    id: 1,
    name: 'המשפחה',
    image: null
};
const emptyHomeMedia = {
    articles: [],
    audios: [],
    videos: []
};
const missingTabletFileMessage = 'הקובץ אינו זמין במכשיר זה, ולכן לא ניתן לפתוח אותו.';

const ensureMediaFileExists = async (url) => {
    if (!url) {
        return false;
    }

    try {
        const headResponse = await fetch(url, { method: 'HEAD' });
        if (headResponse.ok) {
            return true;
        }

        if (headResponse.status === 405 || headResponse.status === 501) {
            const rangeResponse = await fetch(url, {
                method: 'GET',
                headers: { Range: 'bytes=0-0' }
            });
            return rangeResponse.ok || rangeResponse.status === 206;
        }

        return false;
    } catch {
        return false;
    }
};
const batteryDemoStates = [
    { hasBattery: true, percent: 100, isCharging: false },
    { hasBattery: true, percent: 65, isCharging: false },
    { hasBattery: true, percent: 35, isCharging: false },
    { hasBattery: true, percent: 12, isCharging: false },
    { hasBattery: true, percent: 8, isCharging: true },
    { hasBattery: false, percent: null, isCharging: false }
];

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

    useEffect(() => {
        // טיימר שמעביר למצב הבא כל 3000 אלפיות שנייה (3 שניות)
        const id = setInterval(() => {
            setStateIndex((prev) => (prev + 1) % batteryDemoStates.length);
        }, 3000);
        return () => clearInterval(id);
    }, []);

    const bat = batteryDemoStates[stateIndex];
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
const TopBar = ({ userName, onSbsLogoClick }) => (
    <header className="hp-top-bar">
        <div className="hp-header-left">
            <PowerButton />
            <BatteryButton />
        </div>
        <div className="hp-header-right">
            <h1 className="hp-greeting-text">שלום {userName}</h1>
            <div className="hp-logo-group">
                <img src={logo_new} alt="atid" className="hp-atid-logo" />
                <img
                    src={sbs_logo}
                    alt="sbs"
                    className="hp-sbs-logo"
                    data-sbs-exit-logo="true"
                    onClick={onSbsLogoClick}
                />
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

const ThumbnailImage = ({ src, fallback, alt, className }) => {
    const [imageSource, setImageSource] = useState(src || fallback);

    useEffect(() => {
        setImageSource(src || fallback);
    }, [src, fallback]);

    if (!imageSource) return null;

    return (
        <img
            src={imageSource}
            alt={alt}
            className={className}
            onError={() => {
                if (fallback && imageSource !== fallback) {
                    setImageSource(fallback);
                }
            }}
        />
    );
};

// ==========================================
// Audio Card
// ==========================================
const AudioCard = ({ title, audioUrl, iconUrl, isPlaying, onPlay, currentAudioObj }) => {
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
                {iconUrl && (
                    <ThumbnailImage
                        src={iconUrl}
                        fallback={cata5}
                        alt={title}
                        className="audio-thumb-img"
                    />
                )}
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
const MediaCard = ({ img, label, progress, onClick }) => (
    <div className="hp-media-card" onClick={onClick}>
        <div className="card-top-row">
            {/* 1. צד ימין: תמונה */}
            <div className="card-thumb-container">
                <ThumbnailImage
                    src={img}
                    fallback={cata1}
                    alt={label}
                    className="card-thumb-img"
                />
            </div>

            {/* 2. צד שמאל: אחוזים */}
            {progress && (
                <div className="card-progress-container">
                    <span className="progress-status-text">הושלמו</span>
                    <span className="progress-value-text">{progress}</span>
                </div>
            )}
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
            <ThumbnailImage
                src={img}
                fallback={cata4}
                alt={label}
                className="video-thumb-img"
            />
        </div>
        <div className="video-footer">
            <span className="video-title-text">{label}</span>
        </div>
    </div>
);

// Article/PDF Card
const ArticleCard = ({ title, pdfUrl, iconUrl, onOpenModal }) => (
    <div className="hp-article-card" onClick={() => onOpenModal(pdfUrl)}>
        {/* אזור עליון: תצוגה מקדימה של ה-PDF */}
        <div className="article-preview-container">
            {iconUrl ? (
                <ThumbnailImage
                    src={iconUrl}
                    fallback={cata1}
                    alt={title}
                    className="article-icon-img"
                />
            ) : pdfUrl ? (
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
    const dispatch = useDispatch();
    const [books, setBooks] = useState(null);
    const [homeMedia, setHomeMedia] = useState(emptyHomeMedia);
    const [mediaLoadState, setMediaLoadState] = useState('loading');

    // Audio States
    const [currentAudio, setCurrentAudio] = useState(null);
    const [playingUrl, setPlayingUrl] = useState(null);

    // Modal PDF State
    const [activePdfUrl, setActivePdfUrl] = useState(null);

    // Modal Video State
    const [activeVideoUrl, setActiveVideoUrl] = useState(null);
    const [sbsLogoClicks, setSbsLogoClicks] = useState(0);

    useEffect(() => {
        const resetExitClicks = (event) => {
            if (event.target.closest('[data-sbs-exit-logo]')) {
                return;
            }
            setSbsLogoClicks(0);
        };

        document.addEventListener('click', resetExitClicks, true);
        return () => document.removeEventListener('click', resetExitClicks, true);
    }, []);

    const handleBookClick = (book) => {
        setPageDirection(false);
        dispatch({
            type: 'PICK_BOOK',
            bookId: Number(book.id),
            bookName: book.name,
            bookImage: book.image
        });
    };

    useEffect(() => {
        let cancelled = false;

        const fetchBooks = async () => {
            try {
                const results = await axiosInstance.get('/books');
                const activeBooks = Array.isArray(results.data?.data)
                    ? results.data.data
                    : [];

                if (!cancelled) {
                    setBooks(activeBooks);
                }
            } catch (error) {
                console.error('Error loading books:', error);
                if (!cancelled) {
                    setBooks([fallbackBook]);
                }
            }
        };

        fetchBooks();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        const fetchHomeMedia = async () => {
            setMediaLoadState('loading');
            try {
                const results = await axiosInstance.get('/home_media', {
                    signal: controller.signal
                });
                const loadedMedia = results.data?.data;

                setHomeMedia({
                    articles: Array.isArray(loadedMedia?.articles)
                        ? loadedMedia.articles
                        : [],
                    audios: Array.isArray(loadedMedia?.audios)
                        ? loadedMedia.audios
                        : [],
                    videos: Array.isArray(loadedMedia?.videos)
                        ? loadedMedia.videos
                        : []
                });
                setMediaLoadState('ready');
            } catch (error) {
                if (error.code === 'ERR_CANCELED') return;
                console.error('Error loading home media:', error);
                setHomeMedia(emptyHomeMedia);
                setMediaLoadState('error');
            }
        };

        fetchHomeMedia();
        return () => controller.abort();
    }, []);

    useEffect(() => () => {
        if (currentAudio) currentAudio.pause();
    }, [currentAudio]);

    const handlePlayAudio = async (url) => {
        if (playingUrl === url) {
            currentAudio?.pause(); setCurrentAudio(null); setPlayingUrl(null);
            return;
        }

        const mediaExists = await ensureMediaFileExists(url);
        if (!mediaExists) {
            alert(missingTabletFileMessage);
            return;
        }

        if (currentAudio) currentAudio.pause();

        const audio = new Audio(url);
        const savedPos = localStorage.getItem(`audio_pos_${url}`);
        let playbackStarted = false;

        const clearFailedAudio = () => {
            alert(missingTabletFileMessage);
            setCurrentAudio(activeAudio => (
                activeAudio === audio ? null : activeAudio
            ));
            setPlayingUrl(activeUrl => (
                activeUrl === url ? null : activeUrl
            ));
        };

        const startPlayback = () => {
            if (playbackStarted) return;
            playbackStarted = true;

            if (savedPos && parseFloat(savedPos) < audio.duration - 0.5) {
                audio.currentTime = parseFloat(savedPos);
            } else {
                audio.currentTime = 0;
                localStorage.setItem(`audio_pos_${url}`, 0);
            }
            audio.play().catch(clearFailedAudio);
        };

        audio.onloadedmetadata = startPlayback;
        audio.onerror = clearFailedAudio;

        if (audio.readyState >= 1) {
            startPlayback();
        }

        setCurrentAudio(audio);
        setPlayingUrl(url);

        audio.onended = () => {
            setCurrentAudio(activeAudio => (
                activeAudio === audio ? null : activeAudio
            ));
            setPlayingUrl(activeUrl => (
                activeUrl === url ? null : activeUrl
            ));
            localStorage.setItem(`audio_pos_${url}`, 0);
        };
    };

    // PDF Modal Handlers
    const handleOpenPdf = async (url) => {
        const mediaExists = await ensureMediaFileExists(url);
        if (!mediaExists) {
            alert(missingTabletFileMessage);
            return;
        }

        if (currentAudio) { currentAudio.pause(); setCurrentAudio(null); setPlayingUrl(null); }
        setActivePdfUrl(url);
    };
    const handleClosePdf = () => setActivePdfUrl(null);

    // Video Modal Handlers
    const handleOpenVideo = async (url) => {
        const mediaExists = await ensureMediaFileExists(url);
        if (!mediaExists) {
            alert(missingTabletFileMessage);
            return;
        }

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

            <TopBar
                userName={userState.fullName || 'ישראל ישראלי'}
                onSbsLogoClick={() => {
                    const nextCount = sbsLogoClicks + 1;
                    setSbsLogoClicks(nextCount);
                    if (nextCount === 6) {
                        setSbsLogoClicks(0);
                        axiosInstance.post('/kill_server');
                    }
                }}
            />

            <main className="hp-main-content">
                <div className="section-container">
                    <SectionHeader title="למידה" iconClass="icon-edit" />
                    {books === null && (
                        <div className="media-state-message">טוען ספרים…</div>
                    )}
                    {books?.length === 0 && (
                        <div className="media-state-message">אין ספרים זמינים</div>
                    )}
                    {books?.length > 0 && (
                        <MediaRow>
                            {books.map(book => (
                                <MediaCard
                                    key={book.id}
                                    img={resolveMediaUrl(book.image)}
                                    label={book.name}
                                    onClick={() => handleBookClick(book)}
                                />
                            ))}
                        </MediaRow>
                    )}
                </div>

                <div className="section-container">
                    <SectionHeader title="קריאה" iconClass="icon-book" />
                    {mediaLoadState === 'loading' && (
                        <div className="media-state-message">טוען מאמרים…</div>
                    )}
                    {mediaLoadState === 'error' && (
                        <div className="media-state-message">לא ניתן לטעון מאמרים</div>
                    )}
                    {mediaLoadState === 'ready' && homeMedia.articles.length === 0 && (
                        <div className="media-state-message">אין מאמרים זמינים</div>
                    )}
                    {mediaLoadState === 'ready' && homeMedia.articles.length > 0 && (
                        <MediaRow>
                            {homeMedia.articles.map(article => (
                                <ArticleCard
                                    key={article.id}
                                    title={article.name}
                                    pdfUrl={resolveMediaUrl(article.contentUrl)}
                                    iconUrl={resolveMediaUrl(article.iconUrl)}
                                    onOpenModal={handleOpenPdf}
                                />
                            ))}
                        </MediaRow>
                    )}
                </div>

                <div className="section-container">
                    <SectionHeader title="צפייה" iconClass="icon-video" />
                    {mediaLoadState === 'loading' && (
                        <div className="media-state-message">טוען סרטונים…</div>
                    )}
                    {mediaLoadState === 'error' && (
                        <div className="media-state-message">לא ניתן לטעון סרטונים</div>
                    )}
                    {mediaLoadState === 'ready' && homeMedia.videos.length === 0 && (
                        <div className="media-state-message">אין סרטונים זמינים</div>
                    )}
                    {mediaLoadState === 'ready' && homeMedia.videos.length > 0 && (
                        <MediaRow>
                            {homeMedia.videos.map(video => {
                                const videoUrl = resolveMediaUrl(video.contentUrl);
                                return (
                                    <VideoCard
                                        key={video.id}
                                        img={resolveMediaUrl(video.iconUrl)}
                                        label={video.name}
                                        onClick={() => handleOpenVideo(videoUrl)}
                                    />
                                );
                            })}
                        </MediaRow>
                    )}
                </div>

                <div className="section-container">
                    <SectionHeader title="האזנה" iconClass="icon-music" />
                    {mediaLoadState === 'loading' && (
                        <div className="media-state-message">טוען קטעי שמע…</div>
                    )}
                    {mediaLoadState === 'error' && (
                        <div className="media-state-message">לא ניתן לטעון קטעי שמע</div>
                    )}
                    {mediaLoadState === 'ready' && homeMedia.audios.length === 0 && (
                        <div className="media-state-message">אין קטעי שמע זמינים</div>
                    )}
                    {mediaLoadState === 'ready' && homeMedia.audios.length > 0 && (
                        <MediaRow>
                            {homeMedia.audios.map(audio => {
                                const audioUrl = resolveMediaUrl(audio.contentUrl);
                                return (
                                    <AudioCard
                                        key={audio.id}
                                        title={audio.name}
                                        audioUrl={audioUrl}
                                        iconUrl={resolveMediaUrl(audio.iconUrl)}
                                        isPlaying={playingUrl === audioUrl}
                                        onPlay={() => handlePlayAudio(audioUrl)}
                                        currentAudioObj={playingUrl === audioUrl ? currentAudio : null}
                                    />
                                );
                            })}
                        </MediaRow>
                    )}
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