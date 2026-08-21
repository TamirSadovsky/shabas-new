import React, { useRef, useState, useEffect, useCallback } from 'react';
import './MediaRow.css';

const SCROLL_EPS = 2;

const MediaRow = ({ title, children }) => {
    const scrollRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    const updateScrollState = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        const hasOverflow = el.scrollWidth > el.clientWidth + SCROLL_EPS;
        if (!hasOverflow) {
            setShowLeftArrow(false);
            setShowRightArrow(false);
            return;
        }
        const { scrollLeft, scrollWidth, clientWidth } = el;
        const maxScroll = scrollWidth - clientWidth;
        if (maxScroll <= 0) {
            setShowLeftArrow(false);
            setShowRightArrow(false);
            return;
        }
        const isRtl = getComputedStyle(el).direction === 'rtl';
        let atRightEnd, atLeftEnd;
        if (isRtl) {
            atRightEnd = scrollLeft >= -SCROLL_EPS;
            atLeftEnd = scrollLeft <= -maxScroll + SCROLL_EPS;
        } else {
            atRightEnd = scrollLeft <= SCROLL_EPS;
            atLeftEnd = scrollLeft >= maxScroll - SCROLL_EPS;
        }
        setShowRightArrow(!atRightEnd);
        setShowLeftArrow(!atLeftEnd);
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        updateScrollState();
        const ro = new ResizeObserver(updateScrollState);
        ro.observe(el);
        el.addEventListener('scroll', updateScrollState, { passive: true });
        return () => {
            ro.disconnect();
            el.removeEventListener('scroll', updateScrollState);
        };
    }, [updateScrollState, children]);

    const handleScroll = (dir) => {
        if (scrollRef.current) {
            const amount = dir === 'right' ? 210 : -210;
            scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
        }
    };

    return (
        <div className="row-outer">
            {title && <h2 className="row-title-figma">{title}</h2>}

            <div className="row-inner-wrapper">
                {showRightArrow && (
                    <button className="row-nav-figma right" onClick={() => handleScroll('right')} aria-label="גלול ימינה">
                        <span className="figma-chevron right"></span>
                    </button>
                )}

                <div className="row-scroll-area" ref={scrollRef}>
                    {children}
                </div>

                {showLeftArrow && (
                    <button className="row-nav-figma left" onClick={() => handleScroll('left')} aria-label="גלול שמאלה">
                        <span className="figma-chevron left"></span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default MediaRow;