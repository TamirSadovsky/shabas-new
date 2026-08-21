import React, { useEffect, useState } from 'react';
import './DragNDrop.css';  // Make sure to create a CSS file with the styles provided below
import AudioPlayer from '../AudioPlayer/AudioPlayer';
import x_mark from '../../assets/x_mark.svg'
import check_mark from '../../assets/check-empty.svg'
import arrow from '../../assets/arrow.svg'
import { Draggable } from './DragabbleProps/Dragable';
import { DndContext, useSensor, TouchSensor,MouseSensor, useSensors } from '@dnd-kit/core';
import { Droppable } from './DragabbleProps/Dropable';
import SubmitButton from '../SubmitButton/SubmitButton';
import { useSelector } from 'react-redux';
import logServiceInstance from '../../logService';

const DragNDrop = ({nextLevel, completeLevel, setQuestions, questionInfo, questionId, pageId, increaseLevel}) => {
    // const [selectedOption, setSelectedOption] = useState(undefined);
    const userState = useSelector(state => state.user)
    const [correctIds, setCorrectIds] = useState(Object.assign({}, ...questionInfo.correctAnswerId) || []);
    const [submitted, setSubmitted] = useState(questionInfo?.correct);
    const [isCorrect, setIsCorrect] = useState(questionInfo?.correct)
    const [parent, setParent] = useState(questionInfo.selectedOptions || {})
    const [isDragStart, setDragStart] = useState(false);
    const [hide, setIsHide] = useState(false)
    console.log("obj", Object.assign({}, ...questionInfo.correctAnswerId))
    useEffect(() => {
        // Check if the question has already been answered
        if (questionInfo.done) {
            const prefilledParent = {};
    
            // Iterate through the correctAnswerId array to populate parent
            questionInfo.correctAnswerId.forEach(correctAnswer => {
                const [leftId, rightId] = Object.entries(correctAnswer)[0]; // Get the left and right match
                prefilledParent[`${leftId}_drop`] = `${rightId}_drag`; // Pre-fill parent with the correct answer
            });
    
            // Set the parent with prefilled answers
            setParent(prefilledParent);
            setCorrectIds(Object.values(prefilledParent));
            setIsCorrect('fully-correct');  // Mark as fully correct
            setSubmitted(true); // Mark it as already submitted
            setIsHide(true)
        }
    }, [questionInfo]);
    
    function handleDragEnd({over, active}) {
        setDragStart(false);
        if(!over.id) return;
        setParent(prev=>({
            ...prev,
            [over.id]:active.id
        }))
    }

    const transformedData = Object.values(questionInfo.options).reduce((acc, item) => {
        if (item.side == 0) {
            acc.right[item.id] = {
              ...item
            };
          } else {
            acc.left[item.id] = {
              ...item
            };
          }
          return acc;
    }, { right: {}, left: {} });

    const handleSubmit = () => {
        if (Object.keys(parent).length > 0 && !submitted) {
            setSubmitted(true);
            let correctSelections = [];

            Object.keys(parent).forEach(key => {
                const droppedId = parent[key];
                const elementId = parseInt(key.split('_')[0]);
                const correctAnswer = questionInfo.correctAnswerId.find(correct => correct[elementId]);

                if (correctAnswer && correctAnswer[elementId] === parseInt(droppedId.split('_')[0])) {
                    correctSelections.push(droppedId);
                }
            });

            let correctStatus = '';
            if (correctSelections.length > 0) {
                setCorrectIds(correctSelections);
            }

            if (correctSelections.length === Object.keys(transformedData.left).length) {
                correctStatus = 'fully-correct';
                setIsCorrect(correctStatus);
            } else if (correctSelections.length > 0) {
                correctStatus = 'partly-correct';
                setIsCorrect(correctStatus);
            } else {
                correctStatus = 'incorrect';
                setIsCorrect(correctStatus);
            }

            setQuestions(prev => ({
                ...prev,
                [questionId]:{
                    ...prev[questionId],
                    selectedOptions:parent,
                    correct:correctStatus,
                    done: correctStatus === 'fully-correct' ? true : false
                }
            }))

            const data = {
                userId: userState.id,
                categoryId: pageId,
                questionId: questionInfo.id,
                isQuestion: 1,
                isCorrect: correctStatus !== 'fully-correct' ? 0 : 1,
                answer: JSON.stringify(correctSelections)
            };

            logServiceInstance.log(data);

        } else if (Object.keys(parent).length > 0 && submitted) {
            const newParent = {};
            Object.values(correctIds).forEach(id => {
                const key = Object.keys(parent).find(k => parent[k] === id);
                if (key) {
                    newParent[key] = id;
                }
            });
            setParent(newParent);
            setIsCorrect(undefined);
            setSubmitted(false);
        }
    };
    
    const handleReset = () => {
        if (Object.keys(parent).length > 0) {
            setSubmitted(false);
            setParent({});
            setIsCorrect(undefined)
        }
    };

    const touchSensor = useSensor(TouchSensor)
    const mouseSensor = useSensor(MouseSensor)
    const sensors = useSensors(mouseSensor, touchSensor)
    

    const handleDragStart = ()=>{
        setDragStart(true);
    }

    const leftElements = Object.values(questionInfo.options).filter(option => option.side == 1);
    const rightElements = {...Object.values(questionInfo.options).filter(option => option.side == 0)}
    
    console.log(transformedData)
    return (
        <>
            <DndContext sensors={sensors} onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
                <div className='dnd-wrapper'>
                    <div className='inputs-dnd'>
                        <span className='dnd-title'>גרור ממחסן המילים את המושג המתאים לכל משפט</span>
                        {Object.values(transformedData.left).map((element, index) => (
                            <div className='dropable-row'>
                                <AudioPlayer audioName={element.audio}></AudioPlayer>
                                <div className='dnd-input-group'>
                                    <div className='label-wrapper'>
                                        <div className='dropable-input-label'>{index + 1}. {element.label}</div>
                                    </div>
                                    <Droppable id={`${element.id}_drop`} submitted={submitted}>
                                        <div className={`dropable-input ${ isDragStart && !parent[`${element.id}_drop`] ? 'available_drop_input' : '' }`}>
                                            {   
                                                parent[`${element.id}_drop`] && 
                                                <div className={
                                                        `dragable-select ${submitted && Object.values(correctIds)?.includes(parent[`${element.id}_drop`]) ? 'dnd_correct' : ''}`
                                                    }>
                                                    {transformedData.right[parseInt(parent[`${element.id}_drop`])].label}
                                                </div> 
                                            }
                                        </div>
                                    </Droppable>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className='options-dnd'>
                        <h3 className='dnd-title'>מחסן מושגים</h3>
                        {Object.values(transformedData.right).map(element => (
                                <div className='dragable-row'>
                                    <AudioPlayer audioName={element.audio}></AudioPlayer>
                                    {!Object.values(parent).includes(`${element.id}_drag`) && 
                                        <Draggable  submitted={submitted} id={`${element.id}_drag`}>
                                            <div className='dragable-select'>{element.label}</div>
                                        </Draggable>
                                    }
                                </div>
                        ))}
                    </div>
                </div>
            </DndContext>
            <div className='dnd-button_section'>
                <div className='indication'>
                    {submitted && (
                        (isCorrect === 'fully-correct' && <div className={`correct-text`}><img className='multiple-check_mark' src={check_mark}></img>תשובות נכונות</div> ) ||
                        (isCorrect === 'partly-correct' && <div className={`partly-correct-text`}> - תשובה חלקית</div>)) ||
                        (isCorrect === 'incorrect' && <div className={`incorrect-text`}><img className='yesno-x_mark' src={x_mark} alt="x mark"/>תשובה שגויה</div>)
                    }
                </div>
                <SubmitButton
                    nextLevel={nextLevel}
                    completeLevel={()=>completeLevel(isCorrect)}
                    handleReset={handleReset}
                    selectedOptions={parent}
                    handleSubmit={handleSubmit}
                    submitted={submitted}
                    isCorrect={isCorrect}
                    questionInfo={questionInfo}
                    hide={hide}
                    increaseLevel={increaseLevel}
                />
            </div>
        </>

    );
};

export default DragNDrop;


