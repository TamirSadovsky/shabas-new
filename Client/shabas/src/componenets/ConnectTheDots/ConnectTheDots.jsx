import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import ConnectTheDotsElement from './ConnectTheDotsElement';
import './ConnectTheDots.css'
import Xarrow from "react-xarrows";
import AudioPlayer from '../AudioPlayer/AudioPlayer';
import SubmitButton from '../SubmitButton/SubmitButton';
import x_mark from '../../assets/x_mark.svg'
import check_mark from '../../assets/check-empty.svg'
import { shouldHideInstructionTitle } from '../../constants/utils';
import { useSelector } from 'react-redux';
import logServiceInstance from '../../logService';
import {
    WORD_PREFIX,
    CATEGORY_PREFIX,
    makeLine,
    lineKey,
    normaliseLines,
    correctPairsToLines,
    toggleLine,
    scoreLines,
} from './connectLines';

const BADGE_COLLISION_PX = 18;
const BADGE_SPREAD_PX = 30;

const ConnectTheDots = ({pageId, completeLevel, setQuestions, questionInfo, questionId, nextLevel, increaseLevel}) => {
    const userState = useSelector(state => state.user)
    const [lines, setLines] = useState(() => normaliseLines(questionInfo.lines));
    const [selected, setSelected] = useState(null);
    const [submitted, setSubmitted] = useState(questionInfo.done || false);
    const [isCorrect, setIsCorrect] = useState(questionInfo.correct || '');
    const [correctAnswers, setCorrectAnswers] = useState(() => normaliseLines(questionInfo.correctAnswers));
    const [hoveredKey, setHoveredKey] = useState(null);
    const [badgeOffsets, setBadgeOffsets] = useState({});

    const isOneToOne = Number(questionInfo.connectMode) === 1;
    const correctPairs = useMemo(() => correctPairsToLines(questionInfo.correctAnswerId), [questionInfo.correctAnswerId]);
    const correctKeys = useMemo(() => new Set(correctPairs.map(lineKey)), [correctPairs]);
    const checkedKeys = useMemo(() => new Set(correctAnswers.map(lineKey)), [correctAnswers]);

    useEffect(() => {
        if (questionInfo.done) {
            setCorrectAnswers(correctPairs);
            setLines(correctPairs);
            setIsCorrect('fully-correct');
            setSubmitted(true);
        }
    }, [questionInfo.done, correctPairs]);

    const saveLines = (nextLines, extra = {}) => {
        setQuestions(prev => ({
            ...prev,
            [questionId]: {
                ...prev[questionId],
                lines: nextLines,
                ...extra,
            }
        }));
    };

    const applyToggle = (line) => {
        const nextLines = toggleLine(lines, line, isOneToOne);
        setLines(nextLines);
        saveLines(nextLines);
    };

    const removeLine = (key) => {
        if (submitted) return;
        const nextLines = lines.filter(l => lineKey(l) !== key);
        setLines(nextLines);
        saveLines(nextLines);
        setHoveredKey(null);
    };

    const handleCircleClick = (id) => {
        if (submitted) return;
        if (selected === null) {
            setSelected(id);
            return;
        }
        if (selected === id) {
            setSelected(null);
            return;
        }
        const line = makeLine(selected, id);
        if (!line) {
            setSelected(id);
            return;
        }
        applyToggle(line);
        setSelected(null);
    };

    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.key === 'Escape') setSelected(null);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    const handlePageClick = (event) => {
        if (!event.target.closest('.CTD-element_wrapper, .CTD-delete-badge')) {
            setSelected(null);
        }
    };

    const computeBadgeOffsets = useCallback(() => {
        const points = lines.map(line => {
            const startEl = document.getElementById(line.start);
            const endEl = document.getElementById(line.end);
            if (!startEl || !endEl) return null;
            const a = startEl.getBoundingClientRect();
            const b = endEl.getBoundingClientRect();
            const ax = a.left + a.width / 2;
            const ay = a.top + a.height / 2;
            const bx = b.left + b.width / 2;
            const by = b.top + b.height / 2;
            const length = Math.hypot(bx - ax, by - ay) || 1;
            return {
                key: lineKey(line),
                x: (ax + bx) / 2,
                y: (ay + by) / 2,
                ux: (bx - ax) / length,
                uy: (by - ay) / length,
            };
        }).filter(Boolean);

        const groups = [];
        points.forEach(point => {
            const group = groups.find(g =>
                Math.abs(g[0].x - point.x) < BADGE_COLLISION_PX &&
                Math.abs(g[0].y - point.y) < BADGE_COLLISION_PX
            );
            if (group) group.push(point);
            else groups.push([point]);
        });

        const offsets = {};
        groups.forEach(group => {
            if (group.length < 2) return;
            group.forEach((point, index) => {
                const shift = (index - (group.length - 1) / 2) * BADGE_SPREAD_PX;
                offsets[point.key] = { dx: point.ux * shift, dy: point.uy * shift };
            });
        });
        setBadgeOffsets(offsets);
    }, [lines]);

    useLayoutEffect(() => {
        computeBadgeOffsets();
        window.addEventListener('resize', computeBadgeOffsets);
        return () => window.removeEventListener('resize', computeBadgeOffsets);
    }, [computeBadgeOffsets]);

    const handleReset = () => {
        setLines([]);
        setSelected(null);
        setSubmitted(false);
        setCorrectAnswers([]);
        setIsCorrect(null);
        saveLines([]);
    };

    const handleSubmit = () => {
        if (submitted) {
            setCorrectAnswers([]);
            setSubmitted(false);
            setIsCorrect('');
            return;
        }

        setSelected(null);
        setSubmitted(true);

        const { status: correctStatus, correctLines } = scoreLines(lines, correctKeys);
        setCorrectAnswers(correctLines);
        if (correctStatus === 'fully-correct') {
            completeLevel();
        }
        setIsCorrect(correctStatus);

        saveLines(lines, {
            correctAnswers: correctLines,
            done: correctStatus === 'fully-correct',
        });

        logServiceInstance.log({
            userId: userState.id,
            categoryId: pageId,
            questionId: questionInfo.id,
            isQuestion: 1,
            isCorrect: correctStatus === 'fully-correct' ? 1 : 0,
            answer: JSON.stringify(lines.map(line => ({
                start: line.start,
                end: line.end,
                correct: correctKeys.has(lineKey(line)),
            })))
        });
    };

    const dotState = (id) => {
        const touching = lines.filter(line => line.start === id || line.end === id);
        const hasWrong = submitted && touching.some(line => !checkedKeys.has(lineKey(line)));
        return {
            active: touching.length > 0 || selected === id,
            selected: selected === id,
            correct: submitted && touching.length > 0 && !hasWrong,
        };
    };

    const lineStyle = (line) => {
        const key = lineKey(line);
        if (submitted) {
            return checkedKeys.has(key)
                ? { color: '#72C770', strokeWidth: 2, dashness: false }
                : { color: '#D03E3E', strokeWidth: 2, dashness: { strokeLen: 6, nonStrokeLen: 4 } };
        }
        if (hoveredKey === key) {
            return { color: '#D03E3E', strokeWidth: 4, dashness: false };
        }
        return { color: '#3072AF', strokeWidth: 2, dashness: { strokeLen: 10, nonStrokeLen: 3, animation: 1 } };
    };

    const renderDeleteBadge = (line) => {
        const key = lineKey(line);
        const offset = badgeOffsets[key] || { dx: 0, dy: 0 };
        return (
            <button
                type="button"
                className={`CTD-delete-badge ${hoveredKey === key ? 'hovered' : ''}`}
                style={{ transform: `translate(${offset.dx}px, ${offset.dy}px)` }}
                aria-label="מחיקת קו"
                title="מחיקת קו"
                onMouseEnter={() => setHoveredKey(key)}
                onMouseLeave={() => setHoveredKey(prev => (prev === key ? null : prev))}
                onClick={(event) => {
                    event.stopPropagation();
                    removeLine(key);
                }}
            >
                ×
            </button>
        );
    };

    const leftElements = Object.values(questionInfo.options).filter(option => option.side == 1);
    const rightElements = Object.values(questionInfo.options).filter(option => option.side == 0);
    return (
        <>
            <div className='CTD-page' onClick={handlePageClick}>
                {!shouldHideInstructionTitle(questionInfo) && (
                    <header className='CTD-header'>
                        <h3>מתח קווים בין המשפטים למושגים המתאימים</h3>
                    </header>
                )}
                <div className='CTD_wrapper'>
                    <div className='image-area'> </div>
                    {rightElements.map((element, index) => {
                        const id = `${WORD_PREFIX}${element.id}`;
                        return(
                            <div key={id} style={{display:"flex", flexDirection: "row-reverse", alignItems: "center", gap: "6px",   gridColumn: 2, gridRow: index + 1, justifyContent:'flex-end' }}>
                                <ConnectTheDotsElement
                                    id={id}
                                    text={element.label}
                                    onCircleClick={handleCircleClick}
                                    style={{ gridColumn: 2, gridRow: index + 1, justifySelf:'flex-start'}}
                                    {...dotState(id)}
                                />
                                <AudioPlayer audioName={element.audio}></AudioPlayer>
                            </div>
                        )
                    })}
                    {leftElements.map((element, index) => {
                        const id = `${CATEGORY_PREFIX}${element.id}`;
                        return (
                            <div key={id} style={{display:"flex", flexDirection: "row-reverse", alignItems: "center", gap: "6px",  gridColumn: 3, gridRow: index + 1 }}>
                                <AudioPlayer audioName={element.audio}></AudioPlayer>
                                <ConnectTheDotsElement
                                    id={id}
                                    text={element.label}
                                    onCircleClick={handleCircleClick}
                                    className={'last-column-item'}
                                    style={{minWidth:'80%', paddingLeft:'8px'}}
                                    {...dotState(id)}
                                />
                            </div>
                        );
                    })}

                    {lines.map(line => {
                        const style = lineStyle(line);
                        return (
                            <Xarrow
                                key={lineKey(line)}
                                start={line.start}
                                end={line.end}
                                color={style.color}
                                strokeWidth={style.strokeWidth}
                                headSize={1}
                                curveness={0}
                                animateDrawing={0.2}
                                dashness={style.dashness}
                                startAnchor="middle"
                                endAnchor="middle"
                                labels={submitted ? undefined : { middle: renderDeleteBadge(line) }}
                            />
                        )
                    })}
                </div>
                <div className='CTD-button_section'>
                    <div className='indication'>
                        {submitted && ((isCorrect === 'fully-correct' && <div className={`correct-text`}><img className='multiple-check_mark' src={check_mark}></img>תשובות נכונות</div> ) ||
                            (isCorrect === 'partly-correct' && <div className={`partly-correct-text`}> - תשובה חלקית</div>)) ||
                            (isCorrect === 'incorrect' && <div className={`incorrect-text`}><img className='yesno-x_mark' src={x_mark} alt="x mark"/>תשובה שגויה</div>)
                        }
                    </div>
                    <SubmitButton
                        nextLevel={nextLevel}
                        completeLevel={()=>completeLevel(isCorrect)}
                        handleReset={handleReset}
                        selectedOptions={lines || {}}
                        handleSubmit={handleSubmit}
                        submitted={submitted}
                        isCorrect={isCorrect}
                        questionInfo={questionInfo}
                        increaseLevel={increaseLevel}
                    />
                </div>
            </div>
        </>
    );
};


export default ConnectTheDots;
