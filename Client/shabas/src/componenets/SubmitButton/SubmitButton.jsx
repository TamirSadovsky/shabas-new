import React, { useState } from 'react';
import './SubmitButton.css';  // Make sure to create a CSS file with the styles provided below
import AudioPlayer from '../AudioPlayer/AudioPlayer';
import x_mark from '../../assets/x_mark.svg';
import check_mark from '../../assets/check-empty.svg';
import arrow from '../../assets/arrow.svg';

const SubmitButton = ({ nextLevel, completeLevel, handleReset, selectedOptions, handleSubmit, submitted, isCorrect, questionInfo, hide, increaseLevel }) => {

    
    // if(hide) return;
    return (
        <div className='submit-button-wrapper'>
            {!questionInfo.done &&
                <>
                <button 
                    className={`submit-button ${ selectedOptions && Object.keys(selectedOptions).length === 0 ? 'disabled' : ''}`}     
                    onClick={handleSubmit}
                    disabled={Object.keys(selectedOptions).length === 0}>
                    {!submitted ? "אישור ובדיקה" : "עריכת תשובות"}
                </button>
                {submitted &&<div className='submit-button_reset' onClick={handleReset}> מחיקת תשובות </div>}
                </>
            }
            {isCorrect === 'fully-correct' &&
                <button 
                    className={`submit-button next-level`}     
                    onClick={()=> increaseLevel()}
                    // disabled={Object?.keys(selectedOptions)?.length === 0}
                >
                    <div>לשלב הבא</div>
                    <img src={arrow} className='next_arrow' alt="arrow"/>
                </button>
            }
        </div>
    );
};

export default SubmitButton;
