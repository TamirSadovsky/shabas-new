import { useDispatch } from 'react-redux';
import './BackToHomeSlider.css';

function HomeIcon() {
    return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    );
}

const BackToHomeSlider = ({ setPageDirection }) => {
    const dispatch = useDispatch();

    const handleClick = () => {
        if (typeof setPageDirection === 'function') setPageDirection(true);
        dispatch({ type: 'PICK_CATEGORY', page: 'home', id: null });
    };

    return (
        <div className="back-to-home-slider" onClick={handleClick}>
            <div className="back-to-home-slider-icon-wrapper">
                <HomeIcon />
            </div>
            <div className="back-to-home-slider-text">למסך הבית</div>
        </div>
    );
};

export default BackToHomeSlider;
