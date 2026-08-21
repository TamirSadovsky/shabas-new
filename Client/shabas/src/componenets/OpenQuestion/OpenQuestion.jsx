import React, { useState } from 'react';
import './OpenQuestion.css';  // Make sure to create a CSS file with the styles provided below
import AudioPlayer from '../AudioPlayer/AudioPlayer';
import x_mark from '../../assets/x_mark.svg'
import check_mark from '../../assets/check-empty.svg'
import arrow from '../../assets/arrow.svg'
import AutosizeTextAreaField from '../AutosizeTextAreaField/AutosizeTextAreaField';
import SubmitButton from '../SubmitButton/SubmitButton';
import { useSelector } from 'react-redux';
import logServiceInstance from '../../logService';
import OpenQuestionSubmitIndication from '../OpenQuestionSubmitIndicator/OpenQuestionSubmitIndication';

const OpenQuestion = ({pageId, title, questionInfo, nextLevel, completeLevel, setQuestions, questionId, increaseLevel}) => {
    const userState = useSelector(state => state.user)
    const [submitted, setSubmitted] = useState(false);
    const [openQuestion, setOpenQuestion] = useState(questionInfo.value ? questionInfo.value : '')
    const maxLength = 2000


    const handleChange = (event)=>{
        const value = event.target.value;
        if(value.length > maxLength)
            return;
        setOpenQuestion(value);
        if(submitted){
            setSubmitted(false)
        }
    };

    const handleSubmit = ()=>{
        if(openQuestion.length === 0 ) return;
        if(!questionInfo.done){
            completeLevel()
        }
        setQuestions(prev => ({
            ...prev,
            [questionId]:{
                ...prev[questionId],
                value:openQuestion,
                done:true
            }
        }))
        const data = {
            userId: userState.id,
            categoryId:pageId,
            questionId:questionId,
            isQuestion:1,
            isCorrect:-1,
            answer:openQuestion
        }
        // console.log(data);
        // sendToLog(data)
        logServiceInstance.log(data)
        
        setSubmitted(true);
    }

    return (
        <div className="open-question-wrapper">
            <header className='open-question-header'>
                הקלד את התשובות
            </header>
            <section className='open-question-section'>
                {/* <div className='open-question-title'>
                    <AudioPlayer audioName={questionInfo.audio}></AudioPlayer>
                    <div>כותרת לשאלות פתוחות</div>
                </div> */}
                <div className='open-question-question'>
                    {/* <div className='open-question-label'>
                        דולו    ר סיט אמט, קונסקטורר אדיפיסינג אלית קולהע צופעט למרקוח איבן איף, ברומץ כלרשט מיחוצים. קלאצי הועניב היושבב שערש שמחויט - טקסט מודגש ותלברו חשלו שעותלשך
                    </div> */}
                    <AutosizeTextAreaField
                        id={1}
                        onChange={(event) => handleChange(event)}
                        minRows={1}
                        className="textarea"
                        value={openQuestion}
                        maxLength={maxLength}
                    >
                    </AutosizeTextAreaField>
                </div>
            </section>
            <div style={{textAlign:'center'}}>
                {/* <div className='indication'>
                    {submitted && <div className={`correct-text`}><img className='multiple-check_mark' src={check_mark}></img>תשובות נכונות</div> }
                </div> */}
                <OpenQuestionSubmitIndication submitted={submitted}/>
                <button 
                    className={`submit-button ${openQuestion.length === 0 ? 'disabled' : ''}`} 
                    onClick={()=> handleSubmit()}
                >
                    שמירה
                </button>
            </div>
            
        </div>
    );
};

export default OpenQuestion;
