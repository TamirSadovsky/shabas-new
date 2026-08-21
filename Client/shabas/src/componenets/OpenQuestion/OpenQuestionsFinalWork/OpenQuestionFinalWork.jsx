import React, { useEffect, useState } from 'react';
import './OpenQuestionFinalWork.css';  // Make sure to create a CSS file with the styles provided below
import AutosizeTextAreaField from '../../AutosizeTextAreaField/AutosizeTextAreaField';
import arrow from '../../../assets/arrow.svg';
import { useSelector } from 'react-redux';
import logServiceInstance from '../../../logService';
import OpenQuestionSubmitIndication from '../../OpenQuestionSubmitIndicator/OpenQuestionSubmitIndication';
import Modal from '../../Modal/Modal';
import FinalWorkModal from '../../FinalWorkModal/FinalWorkModal';


const OpenQuestionFinalWork = ({pageId, questionInfo, setQuestions, questionId, isFinal, lastPage, finalQuestionInputRef, submitFinalWork}) => {
    const userState= useSelector(state => state.user)
    const [submitted, setSubmitted] = useState(false);
    const [openQuestion, setOpenQuestion] = useState(questionInfo.answer ? questionInfo.answer : '')
    const maxLength = 2000

    const handleChange = (event)=>{
        const value = event.target.value;
        setSubmitted(false)
        setOpenQuestion(value);
        finalQuestionInputRef.current = value
    };

    useEffect(()=>{
        console.log("final",isFinal)
    })
    
    const handleSubmit = ()=>{
        if(openQuestion.length === 0 ) return;
        setQuestions(prev => ({
            ...prev,
            [questionId]:{
                ...prev[questionId],
                answer:openQuestion,
                done:true
            }
        }))
        const data = {
            userId: userState.id,
            categoryId:pageId,
            questionId:questionId,
            answer:openQuestion
        }
        // console.log(data);
        // sendToLog(data)
        logServiceInstance.logfinal(data)
        setSubmitted(true);
    }


    return (
        <>
            <div className="FW-open-question-wrapper">
                <section className='FW-open-question-section'>
                    <div className='FW-open-question-question'> 
                        <AutosizeTextAreaField
                            id={1}
                            value={openQuestion}
                            onChange={(event) => handleChange(event)}
                            minRows={6}
                            className="textarea"
                            width={'93%'}
                            maxLength={maxLength}
                            teachers_comment={questionInfo.teachersNote}
                        >
                        </AutosizeTextAreaField>
                    </div>
                </section>
                <div className={lastPage ? `FW-open-question-buttonsection FW-spread-buttons` : `FW-open-question-buttonsection` }>
                <OpenQuestionSubmitIndication submitted={submitted}/>
                    <button 
                        className={`submit-button ${openQuestion.length === 0 ? 'disabled' : ''}`} 
                        onClick={()=> handleSubmit()}
                    >
                        שמירה
                    </button>
                    <div className='FW-submitwork'>
                        {lastPage &&
                            <button 
                                className={`submit-button next-level ${!isFinal ? 'disabled' : ''}`} 
                                disabled={!isFinal}
                                onClick={()=> submitFinalWork()}
                                >
                                הגש עבודה
                                <img src={arrow} className='next_arrow' alt="arrow"/>
                            </button>
                        }
                        {!isFinal && lastPage && (
                            <span style={{color:'red'}}>
                                לא כל התשובות נענו
                            </span>)
                        }
                    </div>
                </div>
            </div>
        </>
    );
};

export default OpenQuestionFinalWork;
