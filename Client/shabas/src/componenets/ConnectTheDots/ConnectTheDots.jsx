import React, { useEffect, useState } from 'react';
import ConnectTheDotsElement from './ConnectTheDotsElement';
import './ConnectTheDots.css'
import Xarrow from "react-xarrows";
import AudioPlayer from '../AudioPlayer/AudioPlayer';
import SubmitButton from '../SubmitButton/SubmitButton';
import x_mark from '../../assets/x_mark.svg'
import check_mark from '../../assets/check-empty.svg'
import { getNumberFromString } from '../../constants/utils';
import { useSelector } from 'react-redux';
import logServiceInstance from '../../logService';
import { Position } from 'react-flow-renderer';

const convertCorrectAnswers = (correctAnswers) => {
    return correctAnswers.map(answer => {
        console.log("entries", Object.entries(answer))
      const [leftId , rightId] = Object.entries(answer)[0];
      return {
        start: `element-right-${parseInt(rightId)}`,
        end: `element-left-${parseInt(leftId)}`
      };
    });
};

const ConnectTheDots = ({pageId, nextLevel, completeLevel, setQuestions, questionInfo, questionId, increaseLevel}) => {
    const userState = useSelector(state => state.user)
    const [lines, setLines] = useState(questionInfo.lines || []);
    const [currentStart, setCurrentStart] = useState(null);
    const [renderArrows, setRenderArrows] = useState(false)
    const [submitted, setSubmitted] = useState(questionInfo.done || false);
    const [isCorrect, setIsCorrect] = useState(questionInfo.correct || '');
    const [correctAnswers, setCorrectAnswers] = useState(questionInfo.correctAnswers || [])
    let convertedAnswers

    useEffect(()=>{
        // Check if the question has already been answered
        if (questionInfo.done) {
            console.log("questionInfo ", questionInfo.isCorrect)
            const correctArray = []
            convertedAnswers = convertCorrectAnswers(questionInfo.correctAnswerId);
            setCorrectAnswers(convertedAnswers)
            setLines(convertedAnswers)
            setIsCorrect('fully-correct');  // Mark as fully correct
            setSubmitted(true); // Mark it as already submitted
            // setRenderArrows(true)
        }
        // setRenderArrows(true)
    }, [questionInfo]);

    const handleCircleClick = (id) => {
        if (submitted) return;
        console.log("lines", lines)
        const startIndex = currentStart?.split('-')[1] || '';

        const endIndex = id.split('-')[1] || '';
        let currentLines;
        console.log("Start: ", id, " End:", currentStart)
        
        // && endIndex != 'left'
        if (currentStart === null ) {
            setCurrentStart(id);
            document.getElementById(id + '_wrap')?.classList.add('active')
            return;
        } else {
            document.getElementById(id  + '_wrap')?.classList.add('active')
            const lineExists = lines.some(line =>
                (line.start === currentStart || line.end === id) ||
                (line.start === id || line.end === currentStart)
            );
            const newLines = lines.filter(line => (
                (line.start != currentStart &&  line.end != id) && (line.start != id && line.end != currentStart)
            ))
            if (((startIndex == 'right' && endIndex == "left") || (startIndex == 'left' && endIndex == "right")) ) {
                currentLines = [...newLines, { start: currentStart, end: id}]
                setLines([...newLines, { start: currentStart, end: id }]);
            }
            setCurrentStart(null);
        }

        const strippedArray = currentLines.flatMap(item => [item.start, item.end]);
        Array.from(document.getElementsByClassName('CTD-element_wrapper')).map(element => {
            console.log("element wrapper ", element)
            let exists;
            strippedArray.forEach(line => {
                console.log("element", line, element.id)
                if(line == element.id.replace('_wrap', '')){
                    exists = true
                }
            })
            if(!exists){
                document.getElementById(element.id)?.classList.remove('active')
            }
        });
    };

    const handleReset = ()=>{
        setLines([]);
        setSubmitted(false)
        setCorrectAnswers([])
        Array.from(document.getElementsByClassName('CTD-element_wrapper')).forEach(element => {
            document.getElementById(element.id).classList.remove('active')
        });
        setQuestions(prev => ({
            ...prev,
            [questionId]:{
                ...prev[questionId],
                lines:[],
            }
        }))
        setIsCorrect(null)
    };

    const handleSubmit = () => {
        if(submitted){
            setCorrectAnswers([])
            setSubmitted(false)
            setIsCorrect('')
            return;
        }
        
        setSubmitted(true);
        // Create a list of correct answers for comparison
        const questionAnswers = questionInfo.correctAnswerId.flatMap(obj => 
            Object.entries(obj).map(([key, value]) => ({
                start: `element-left-${key}`,
                end: `element-right-${value}`
            }))
        );
        

        // Count correct connections
        let correctCount = 0;
        const correctArray = []
        lines.forEach(line => {
            questionAnswers.forEach(correct => {
                console.log("correct, ", correct);
                if ((line.start === correct.start && line.end === correct.end ) || (line.start === correct.end && line.end === correct.start)) {
                    console.log("Correct??")
                    correctArray.push({start: line.start, end: line.end})
                    correctCount++;
                }
            });
        });
        setCorrectAnswers(correctArray)
        // Determine the correctness
        let correctStatus;
        if (correctCount === questionAnswers.length) {
            correctStatus = 'fully-correct';
            completeLevel();
        } else if (correctCount > 0) {
            correctStatus = 'partly-correct';
        } else {
            correctStatus = 'incorrect';
        }
        setIsCorrect(correctStatus);
        console.log("lines on submit, ",lines );
        setQuestions(prev => ({
            ...prev, 
            [questionId]:{
                ...prev[questionId],
                lines:lines,
                correctAnswers:correctArray,
                done:correctStatus != 'fully-correct' ? false : true,
            }
        }))
        const data = {
            userId: userState.id,
            categoryId:pageId,
            questionId:questionInfo.id,
            isQuestion:1,
            isCorrect:correctStatus != 'fully-correct' ? 0 : 1,
            answer:JSON.stringify(correctArray)
        }
        // sendToLog(data)
        logServiceInstance.log(data)
        
    };

    const isCorrectLine = (start,end)=>{
       return correctAnswers.some(answer => start === answer.start && end === answer.end);
    }
    const leftElements = Object.values(questionInfo.options).filter(option => option.side == 1);
    const rightElements = Object.values(questionInfo.options).filter(option => option.side == 0);
    return (
        <>
            <div className='CTD-page'>
                <header className='CTD-header'>
                    <h3>מתח קווים בין המשפטים למושגים המתאימים</h3>
                </header>
                <div className='CTD_wrapper'>
                    <div className='image-area'> </div>
                    {rightElements.map((element, index) => {
                        return(
                            <div style={{display:"flex", flexDirection: "row-reverse", alignItems: "center", gap: "6px",   gridColumn: 2, gridRow: index + 1, justifyContent:'flex-end' }}>
                                <ConnectTheDotsElement
                                    key={`element-left-${index}`}
                                    id={`element-left-${element.id}`}
                                    text={element.label}
                                    onCircleClick={handleCircleClick}
                                    style={{ gridColumn: 2, gridRow: index + 1, justifySelf:'flex-start'}}
                                    correctAnswers={correctAnswers}
                                    submitted={submitted}
                                />
                                <AudioPlayer key={`voice-right-${index}`} audioName={element.audio}></AudioPlayer>
                            </div>
                        )
                    })}
                    {leftElements.map((element, index) => (
                        <div style={{display:"flex", flexDirection: "row-reverse", alignItems: "center", gap: "6px",  gridColumn: 3, gridRow: index + 1 }}>
                            <AudioPlayer key={`voice-left-${index}`} audioName={element.audio}></AudioPlayer>
                            <ConnectTheDotsElement
                                key={`element-right-${index}`}
                                id={`element-right-${element.id}`}
                                text={element.label}
                                onCircleClick={handleCircleClick}
                                className={'last-column-item'}
                                style={{minWidth:'80%', paddingLeft:'8px'}}
                                correctAnswers={correctAnswers}
                                submitted={submitted}
                            />
                        </div>
                    ))}
            
                        {lines?.map((line, index) => {
                            const isCorrect = isCorrectLine(line.start, line.end);
                            const color = isCorrect ? '#72C770' : '#3072AF'
                            const dash = isCorrect ? false : { strokeLen: 10, nonStrokeLen: 3, animation: 1 }
                            console.log('lines ', line.start, line.end)
                            console.log(document.getElementById(line.start), document.getElementById(line.end));

                            return (
                                <Xarrow 
                                    key={`arrow-${index}`} 
                                    start={line.start} 
                                    end={line.end}
                                    color={color}
                                    strokeWidth={2}
                                    headSize={1}
                                    curveness={0}
                                    animateDrawing={0.2}
                                    className={`xarrow-container`}
                                    dashness={dash}
                                    startAnchor="middle"
                                    endAnchor="middle"
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
                        // hide={hide}
                        increaseLevel={increaseLevel}
                    />
                </div>
            </div>
        </>
    );
};


export default ConnectTheDots;
