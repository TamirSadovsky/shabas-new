import React, { useState } from 'react';
import './YesOrNo.css';  // Make sure to create a CSS file with the styles provided below
import AudioPlayer from '../AudioPlayer/AudioPlayer';
import x_mark from '../../assets/x_mark.svg';
import check_mark from '../../assets/check-empty.svg';
import arrow from '../../assets/arrow.svg';
import SubmitButton from '../SubmitButton/SubmitButton';
import ImageComponenet from '../ImageComponenet/ImageComponent';
import { getImageUrl } from '../../constants/importImage';
import { sendToLog } from '../../constants/utils';
import { useSelector } from 'react-redux';
import logServiceInstance from '../../logService';
import useQuestionEffect from '../../hooks/useQuestionEffect';

const YesNoQuestionForm = ({pageId, nextLevel, completeLevel, questionInfo, setQuestions, questionId, increaseLevel}) => {
    const userState = useSelector(state => state.user)
    const [selectedOptions, setSelectedOptions] = useState(questionInfo.selectedOptions || {});
    const [correctAnswers, setCorrectAnswers] = useState(Object.assign({}, ...questionInfo.correctAnswerId));  // Example correct answers
    const [submitted, setSubmitted] = useState(questionInfo.done || false);
    const [isCorrect, setIsCorrect] = useState(questionInfo.correct || '');
    const {hide} = useQuestionEffect(questionInfo, setSelectedOptions, setIsCorrect, correctAnswers)

    // const questions = [
    //     { id: 1, label: 'קבוצה חברתית שיש קשר בין חברי הקבוצה' },
    //     { id: 2, label: ' שדגכשדגכשדגכשדגכשדגכשד שדגכשדגכשדגכשדגכ שדגכשדגכשדג חברי קבוצה משפחתית מחוייבים זה לזה' },
    //     { id: 3, label: 'צה ולמה' }
    // ];
    const handleSelectionChange = (questionNum, answer) => {
        if (submitted) return;
        setSelectedOptions(prevSelected => ({
            ...prevSelected,
            [questionNum]: answer
        }));
        
    };

    const handleSubmit = () => {
        if (Object.keys(selectedOptions).length > 0 && !submitted) {
            setSubmitted(true);
            let correctCount = 0;
            for (let key in selectedOptions) {
                console.log("selectedOptions[key]", selectedOptions[key], "correctAnswers[key]", correctAnswers[key])
                if (selectedOptions[key] == correctAnswers[key]) {
                    correctCount++;
                }
            }
            let correctStatus;
            if (correctCount === Object.keys(correctAnswers).length) {
                correctStatus = 'fully-correct';
                setIsCorrect('fully-correct');
                completeLevel();
            } else if (correctCount > 0) {
                correctStatus = 'partly-correct';
                setIsCorrect('partly-correct');
            } else {
                correctStatus = 'incorrect';
                setIsCorrect('incorrect');
            }
            console.log(selectedOptions)
            setQuestions(prev => ({
                ...prev,
                [questionId]:{
                    ...prev[questionId],
                    selectedOptions:selectedOptions,
                    done: correctStatus === 'fully-correct' ? true : false
                }
            }))
            const correctBit = correctStatus === 'fully-correct' ? 1 : 0;
            const data = {
                userId: userState.id,
                categoryId:pageId,
                questionId:questionInfo.id,
                isQuestion:1,
                isCorrect:correctBit,
                answer:JSON.stringify(selectedOptions)
            }
            // console.log(data);
            // sendToLog(data)
            logServiceInstance.log(data)
        } else if (Object.keys(selectedOptions).length > 0 && submitted) {
            setIsCorrect(undefined);
            setSubmitted(false);
        }
    };

    const handleReset = () => {
        if (Object.keys(selectedOptions).length > 0) {
            setSubmitted(false);
            setSelectedOptions({});
            setIsCorrect(undefined);
        }
    };
    const img = getImageUrl(questionInfo.img)
    return (
        <div className='yesno-wrapper'>
            <ImageComponenet
                width={"220px"}
                height={"220px"}
                padding={"30px"}
                src={img}
            />   
            <div className="yesno-radio-buttons-wrapper">
                <div className='yesno-radio-buttons-title'>סמן נכון או לא נכון</div>
                {questionInfo.options.map(question => (
                    <div className='yesno_row' key={question.id}>
                        <AudioPlayer
                            id={question.id}
                            audioName={question.audio}
                            />
                        <div className={`yesno_question-text ${selectedOptions[question.id] == '0' || selectedOptions[question.id] == '1'    ? 'selected-row' : ''}`}>
                                <div className="radio-label-id">{question.id}. </div>
                                <div className="radio-label">{question.label}</div>
                        </div>
                        <div className='yesno-wrapper'>
                            <div className={`yesno-radio-option 
                                                ${selectedOptions[question.id] == '1' ? 'selected' : ''}
                                                ${submitted && selectedOptions[question.id] == '1'  && correctAnswers[question.id] == '1' ? 'yesno-correct' : ''}
                                                ${submitted && selectedOptions[question.id] == '1' && isCorrect === 'fully-correct' ? 'yesno-correct' : ''}`
                                            }
                                            onClick={() => handleSelectionChange(question.id, '1')}>
                                <div className={`yesno-radio-circle ${selectedOptions[question.id] == '1' && (!submitted || (submitted && correctAnswers[question.id] != '1')) ? 'selected-circle' : ''}`}/>
                                <div className="yesno_text yesno-label">נכון</div>
                            </div>
                            <div className={`yesno-radio-option  
                                                ${selectedOptions[question.id] == '0' ? 'selected' : ''}
                                                ${submitted && selectedOptions[question.id] == '0'  && correctAnswers[question.id] == '0' ? 'yesno-correct' : ''}
                                                ${submitted && selectedOptions[question.id] == '0' && isCorrect === 'fully-correct' ? 'yesno-correct' : ''}`}
                                                onClick={() => handleSelectionChange(question.id, '0')}>
                                <div className={`yesno-radio-circle ${selectedOptions[question.id] == '0' && (!submitted || (submitted && correctAnswers[question.id] != '0'))? 'selected-circle' : ''}`}/>
                                <div className="yesno_text yesno-label">לא נכון</div>
                            </div>
                        </div>
                    </div>
                ))}
                <div className='yesno-footer'>
                    <div className='indication'>
                        {submitted && (
                            (isCorrect === 'fully-correct' && <div className={`correct-text`}><img className='multiple-check_mark' src={check_mark}></img>תשובות נכונות</div> ) ||
                            (isCorrect === 'partly-correct' && <div className={`partly-correct-text`}> - תשובה חלקית</div>)) ||
                            (isCorrect === 'incorrect' && <div className={`incorrect-text`}><img className='yesno-x_mark' src={x_mark} alt="x mark"/>תשובה שגויה</div>)
                        }
                    </div>
                    <SubmitButton
                        nextLevel={nextLevel}
                        questionInfo={questionInfo}
                        completeLevel={()=>completeLevel(isCorrect)}
                        handleReset={handleReset}
                        selectedOptions={selectedOptions}
                        handleSubmit={handleSubmit}
                        submitted={submitted}
                        isCorrect={isCorrect}
                        hide={hide}
                        increaseLevel={increaseLevel}
                        ></SubmitButton>
                </div>
            </div>
        </div>
    );
};

export default YesNoQuestionForm;
