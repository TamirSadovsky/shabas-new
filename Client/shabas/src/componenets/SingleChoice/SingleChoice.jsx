import React, { useEffect, useState } from 'react';
import './SingleChoice.css';  // Make sure to create a CSS file with the styles provided below
import AudioPlayer from '../AudioPlayer/AudioPlayer';
import x_mark from '../../assets/x_mark.svg'
import check_mark from '../../assets/check-empty.svg'
import arrow from '../../assets/arrow.svg'
import { getImageUrl } from '../../constants/importImage';
import ImageComponenet from '../ImageComponenet/ImageComponent';
import { useSelector } from 'react-redux';
import { sendToLog } from '../../constants/utils';
import logServiceInstance from '../../logService';

const SingleChoice = ({questionInfo, questionId, nextLevel, completeLevel, setQuestions, pageId, increaseLevel}) => {
    const userState = useSelector(state => state.user)
    const [selectedOption, setSelectedOption] = useState(questionInfo?.selectedOption);
    const [correctId, setCorrectId] = useState(questionInfo?.correctAnswerId.length > 0 ?  Object?.values(questionInfo?.correctAnswerId[0])[0] : null);
    const [submitted, setSubmitted] = useState(questionInfo.done);
    const [isCorrect, setIsCorrect] = useState(questionInfo.correct || '')
    // const options = [
    //     { id: 1, label: 'אפשרות הראשונה חיים זה דבר טוב' },
    //     { id: 2, label: 'אפשרות השנייה לפרטים לחצו זה עם דל' },
    //     { id: 3, label: 'כל עיר שהיא ממושלת על ידי משטר של אחרים' },
    //     { id: 4, label: 'כל השארות הכנועות' }
    // ];

    useEffect(()=> {
        if(questionInfo.done){
            setSelectedOption(Object?.values(questionInfo?.correctAnswerId[0])[0])
            setIsCorrect(true)
        }
    }, [questionInfo.done])

    const handleSelectionChange = (id) => {
        if(submitted) return;
        setSelectedOption(id);
    };

    const handleSubmit = () => {
        if (selectedOption !== undefined && !submitted) {
            setSubmitted(true);
            const correctStatus =  selectedOption === correctId
            setIsCorrect(correctStatus)
            console.log(correctStatus)
            setQuestions(prev => ({
                ...prev,
                [questionId]:{
                    ...prev[questionId],
                    selectedOption:selectedOption,
                    done:correctStatus
                }
            }))
            const data = {
                userId: userState.id,
                categoryId:pageId,
                questionId:questionInfo.id,
                isQuestion:1,
                isCorrect:correctStatus,
                answer:JSON.stringify(selectedOption)
            }
            console.log(data);
            // sendToLog(data)
            logServiceInstance.log(data)
            if(correctStatus){
                completeLevel();
            }
        } 
        if( selectedOption !== undefined && submitted ){
            setIsCorrect(undefined)
            setSubmitted(false)
            setQuestions(prev => ({
                ...prev,
                [questionId]:{
                    ...prev[questionId],
                    selectedOption:selectedOption,
                }
            }))
        }
    };
    
    const handleReset = () => {
        if (selectedOption !== undefined) {
            setSubmitted(false);
            setSelectedOption(undefined);
            setIsCorrect(undefined)
        }
    };
    const img = getImageUrl(questionInfo.img)
    console.log("image", img)
    return (
        <div className='single-choice_wrapper'>
            <ImageComponenet
                width={'300px'}
                height={'300px'}
                src={img}
                padding={"30px"}
            />
            <div className="radio-buttons-wrapper">
                <div className='radio-buttons-title'>סמן את התשובה הנכונה</div>
                {questionInfo.options.map(option => (
                    <div className='single-choice_row'>
                        <AudioPlayer
                            id={option.id}
                            audioName={option.audio}
                        />
                        <div key={option.id} className={`radio-option
                                                        ${selectedOption === option.id ? 'selected' : ''}
                                                        ${submitted && selectedOption === option.id && !isCorrect ? 'incorrect' : ''} 
                                                        ${submitted && selectedOption === option.id && isCorrect ? 'correct' : ''}`}
                            onClick={() => handleSelectionChange(option.id)}>
                            <div className={`radio-circle ${selectedOption === option.id && !submitted ? 'selected-circle' : ''} `} />
                            <div className={`single-choice_text ${selectedOption === option.id ? 'selected-row' : ''}`}>
                                <div className="radio-label-id">{option.id}. </div>
                                <div className="radio-label">{option.label}</div>
                            </div>
                        </div>
                    </div>
                ))}
                <div className='indication'>
                    {submitted ? 
                        (isCorrect ? 
                            <div className={`correct-text`}><img className='single-check_mark' src={check_mark}></img>תשובה נכונה</div> :
                            <div className={`incorrect-text`}> <img className='single-check_mark' src={x_mark}></img> תשובה שגויה</div>
                        )
                    : null}
                </div>
                {/* We want to disable the button when answer is correct so there is no way to re-answer. */}
                {!questionInfo.correct && <div className='single-choice_buttonsection'>
                       {!questionInfo.done &&
                       <>
                            <button 
                                className={`submit-button ${!selectedOption ? 'disabled' : ''}`}     
                                onClick={handleSubmit}
                                disabled={!selectedOption}>
                                {!submitted ? "אישור ובדיקה" : "עריכת תשובה"}
                            </button>
                            {submitted ? <div className='signlechoice_reset' onClick={handleReset}> מחיקת תשובות </div> : null}
                        </>
                        }
                        {isCorrect &&
                            <button 
                                className={`submit-button next-level`}     
                                onClick={() => increaseLevel()}
                                disabled={!selectedOption}>
                                <div>לשלב הבא</div>
                                <img src={arrow} className='next_arrow'></img>
                            </button>
                        }
                    </div>}
            </div>
        </div>
    );
};

export default SingleChoice;
