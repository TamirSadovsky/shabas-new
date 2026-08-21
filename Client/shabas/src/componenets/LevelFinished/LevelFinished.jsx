

import React, { useState } from 'react';
import './LevelFinished.css';  // Make sure to create a CSS file with the styles provided below
import AutosizeTextAreaField from '../AutosizeTextAreaField/AutosizeTextAreaField';
import { useDispatch, useSelector } from 'react-redux';
import logServiceInstance from '../../logService';
import OpenQuestionSubmitIndication from '../OpenQuestionSubmitIndicator/OpenQuestionSubmitIndication';
import {
    cata1,
    cata2,
    cata3,
    cata4,
    cata5
} from '../../assets/cata_images.js'
import { AnimatePresence, motion } from 'framer-motion';

const variants = {
    enter: {
        y: "100vh", // Start off-screen bottom
        opacity: 0,
    },
    center: {
        y: 0, // Center position
        opacity: 1,
        transition: {
            duration: 0.7,
            ease: "easeOut",
        },
    },
    exit: {
        y: "100vh", // Exit off-screen top
        opacity: 0,
        transition: {
            duration: 0.5,
            ease: "easeIn",
        },
    },
};


const LevelFinshed = ({setLevelFinished, type, pageId, title, questionInfo, nextLevel, completeLevel, setQuestions, questionId, increaseLevel}) => {
    const dispatch = useDispatch()
    const selector = useSelector(state => state.level)
    const pageState = useSelector(state => state.page);
    const userState = useSelector(state => state.user);

    const getImage = () => {
        switch(pageState.id){
            case '1':
                return cata1
            
            case '2':
                return cata2
            
            case '3':
                return cata3
            
            case '4':
                return cata4
            
            case '5':
                return cata5
            default:
                return cata1;
        
        }
    }

    const handleExitButton = ()=>{
        const data = {
            userId: userState.id,
            categoryId:0,
            questionId:0,
            isQuestion:0,
            isCorrect:0,
            answer:"exit"
        }
        logServiceInstance.log(data)
        dispatch({type:"PICK_CATEGORY", page: "welcome", id:'1'})
    }

    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
            key="level-finished"
            variants={variants}
            initial="enter"
            animate="center"
            exit="enter"
            style={{
                position: "absolute", // Detach from parent flow
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
            }}
            >
                <div className='levelfinished-wrapper'>
                    <header className='levelfinished-title'>
                        <h1 className="levelfinished-header-text">!יפה מאוד</h1>
                    </header>
                    <section className='levelfinished-section'>
                        <div className="levelfinished-img">
                            <img src={getImage()} alt="category-image" className="levelfinishe-cata-img" />
                        </div>
                        <h2 className="levelfinished-text">
                            ענית נכון על כל התרגילים
                        </h2>
                        <div className="levelfinished-btn-section">
                            <button className='submit-button levelfinished-btn' onClick={handleExitButton}>
                                חזרה לדף הראשי
                            </button>
                        </div>
                    </section>
                </div>
                </motion.div>
            </AnimatePresence>
        
    );
};

export default LevelFinshed;
