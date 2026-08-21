import React, { useState } from 'react';
import './MultipleChoice.css';  // Make sure to create a CSS file with the styles provided below
import AudioPlayer from '../AudioPlayer/AudioPlayer';
import x_mark from '../../assets/x_mark.svg';
import check_mark from '../../assets/check-empty.svg';
import arrow from '../../assets/arrow.svg';
import SubmitButton from '../SubmitButton/SubmitButton';
import ImageComponenet from '../ImageComponenet/ImageComponent';
import { getImageUrl } from '../../constants/importImage';
import { useSelector } from 'react-redux';
import { sendToLog } from '../../constants/utils';
import logServiceInstance from '../../logService';
import useQuestionEffect from '../../hooks/useQuestionEffect';

const MultipleChoice = ({ pageId, questionInfo, nextLevel, completeLevel, setQuestions, questionId, increaseLevel }) => {
    const userState = useSelector(state => state.user)
    const [selectedOptions, setSelectedOptions] = useState(questionInfo?.selectedOptions || []);
    const [correctIds, setCorrectIds] = useState(questionInfo.correctAnswerId.map(item => parseInt(Object.keys(item)[0])));  // Example correct answers
    const [submitted, setSubmitted] = useState(questionInfo?.done || false);
    const [isCorrect, setIsCorrect] = useState(questionInfo?.correct || '');
    const {hide} = useQuestionEffect(questionInfo, setSelectedOptions, setIsCorrect, correctIds)

    // const options = [
    //     { id: 1, label: 'אפשרות הראשונה חיים זה דבר טוב' },
    //     { id: 2, label: 'אפשרות השנייה לפרטים לחצו זה עם דל' },
    //     { id: 3, label: 'כל עיר שהיא ממושלת על ידי משטר של אחרים' },
    //     { id: 4, label: 'כל השארות הכנועות' },
    //     { id: 5, label: 'כל השארות הכנועות3151251' },

    // ];

    const handleSelectionChange = (id) => {
        if (submitted) return;
        setSelectedOptions(prevSelected => 
            prevSelected.includes(id) 
                ? prevSelected.filter(optionId => optionId !== id)
                : [...prevSelected, id]
        );
    };

    const handleSubmit = () => {
        if (selectedOptions.length > 0 && !submitted) {
            setSubmitted(true);
            let correctValue;
            const correctSelections = selectedOptions.filter(option => correctIds.includes(option));
            if (correctSelections.length === correctIds.length && correctSelections.length === selectedOptions.length) {
                correctValue = 'fully-correct'
                setIsCorrect(correctValue);
                completeLevel();
            } else if (correctSelections.length > 0) {
                correctValue = 'partly-correct' 
                setIsCorrect(correctValue);
            } else{
                correctValue = 'incorrect' 
                setIsCorrect(correctValue)
            }
            setQuestions(prev => ({
                ...prev,
                [questionId]:{
                    ...prev[questionId],
                    selectedOptions:selectedOptions,
                    // correct:correctValue,
                    done:  correctValue === 'fully-correct' ? true : false
                }
            }))
            console.log("multiple")
            const correctBit = correctValue === 'fully-correct' ? 1 : 0;
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
        } 

        if (selectedOptions.length > 0 && submitted) {
            setIsCorrect(undefined);
            setSubmitted(false);
        }
    };

    const handleReset = () => {
        if (selectedOptions.length > 0) {
            setSubmitted(false);
            setSelectedOptions([]);
            setIsCorrect(undefined);
        }
    };
    const img = getImageUrl(questionInfo.img)
    return (
        <div className='multiple-choice_wrapper'>
            <ImageComponenet
                width={'300px'}
                height={'300px'}
                src={img}
                padding={"30px"}
            />
            <div className="radio-buttons-wrapper">
                <div className='radio-buttons-title'>סמן את התשובות הנכונות</div>
                {questionInfo.options.map(option => (
                    <div className='multiple-choice_row' key={option.id}>
                        <AudioPlayer
                            id={option.id}
                            audioName={option.audio}
                        />
                        <div className={`radio-option
                                            ${selectedOptions.includes(option.id) ? 'selected' : ''}
                                            ${submitted && selectedOptions.includes(option.id) && correctIds.includes(option.id) ? 'correct' : ''}
                                            ${submitted && selectedOptions.includes(option.id) && isCorrect === 'fully-correct' ? 'correct' : ''}`}
                            onClick={() => handleSelectionChange(option.id)}>
                            <div className={`radio-circle ${selectedOptions.includes(option.id) && (!submitted || (submitted && !correctIds.includes(option.id))) ? 'selected-circle' : ''} `} />
                            <div className={`multiple-choice_text ${selectedOptions.includes(option.id) ? 'selected-row' : ''}`}>
                                <div className="radio-label-id">{option.id}. </div>
                                <div className="radio-label">{option.label}</div>
                            </div>
                        </div>
                    </div>
                ))}
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
                    selectedOptions={selectedOptions}
                    handleSubmit={handleSubmit}
                    submitted={submitted}
                    isCorrect={isCorrect}
                    questionInfo={questionInfo}
                    hide={hide}
                    increaseLevel={increaseLevel}
                ></SubmitButton>
            </div>
        </div>
    );
};

export default MultipleChoice;
