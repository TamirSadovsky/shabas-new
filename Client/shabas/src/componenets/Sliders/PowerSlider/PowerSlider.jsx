import { useState } from 'react';
import './PowerSlider.css';
import axios from '../../../constants/axios.config';
import powerOnIcon from '../../../PowerOn.png';

/* אייקון הכיבוי (SVG למודאל/סליידר) */
function PowerIcon({ size = 22, className }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={className}>
            <path d="M12 2.5v8" />
            <path d="M6.2 6.9a7.5 7.5 0 1 0 11.6 0" />
        </svg>
    );
}

/* רכיב מודאל האישור – משותף ל-PowerSlider ול-PowerButton */
function ShutdownConfirmModal({ open, onClose }) {
    const handleConfirm = async () => {
        onClose();
        try {
            const { data } = await axios.post('/api/shutdown');
            if (!data?.ok) alert('כיבוי נכשל');
        } catch (e) {
            alert(e?.response?.status === 403 ? 'כיבוי זמין רק מהמחשב המקומי' : 'כיבוי דרך השרת נכשל');
        }
    };
    if (!open) return null;
    return (
        <div className="shutdown-modal-overlay" onClick={onClose}>
            <div className="shutdown-modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="shutdown-modal-title-bar">
                    <span>Electron</span>
                    <button className="shutdown-modal-close-x" onClick={onClose}>×</button>
                </div>
                <div className="shutdown-modal-body">
                    <div className="shutdown-modal-question">האם לכבות את הטאבלט?</div>
                    <div className="shutdown-modal-actions">
                        <button className="btn-confirm-shutdown" onClick={handleConfirm}>כבה טאבלט</button>
                        <button className="btn-cancel-shutdown" onClick={onClose}>ביטול</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/** כפתור כיבוי קומפקטי לשימוש ב-Header / TopBar (ליד הסוללה) */
export function PowerButton() {
    const [showConfirm, setShowConfirm] = useState(false);
    return (
        <>
            <button
                type="button"
                className="power-btn-in-header"
                onClick={() => setShowConfirm(true)}
                title="כבה טאבלט"
                aria-label="כבה טאבלט"
            >
                <img src={powerOnIcon} alt="" className="power-btn-in-header-icon" />
            </button>
            <ShutdownConfirmModal open={showConfirm} onClose={() => setShowConfirm(false)} />
        </>
    );
}

const PowerSlider = () => {
    const [showConfirm, setShowConfirm] = useState(false);

    return (
        <>
            <div className="power-costum-slider" onClick={() => setShowConfirm(true)}>
                <div className="power-slider-icon-wrapper">
                    <PowerIcon />
                </div>
                <div className='power_slider_text'>כבה טאבלט</div>
            </div>
            <ShutdownConfirmModal open={showConfirm} onClose={() => setShowConfirm(false)} />
        </>
    );
};

export default PowerSlider;