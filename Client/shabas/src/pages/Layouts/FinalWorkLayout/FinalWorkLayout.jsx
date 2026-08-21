import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LevelButton from '../../../componenets/LevelButton/LevelButton';
import AudioPlayer from '../../../componenets/AudioPlayer/AudioPlayer';
import './FinalWorkLayout.css';
import { useDispatch, useSelector } from 'react-redux';
import Modal from '../../../componenets/Modal/Modal';
import FinalWorkModal from '../../../componenets/FinalWorkModal/FinalWorkModal';

const variants = {
    enter: (direction) => {
      return {
        x: direction ? -1367 : 1367, // Slide in from right if direction is true, left if false
        opacity: 0,
        zIndex: 1,
      };
    },
    center: {
      zIndex: 2,
      x: 0,
      opacity: 1,
    //   transition: {
    //     duration: 0.4,
    //     // ease: "easeOut",
    //   }
    },
    exit: (direction) => {
      return {
        x: direction ? 1367 : -1367, // Slide out to the left if direction is true, right if false
        opacity: 1,
        zIndex: 0,
        // transition: {
        //   duration: 0.3,
        // //   ease: "easeIn",
        // }
      };
    }
};

const FinalWorkLayout = ({ page, children, title, increaseLevel, decreaseLevel, explanation, side, currentQuestion, questionsLength }) => {
    const dispatch = useDispatch()
    const pageState = useSelector(state => state.page);

    const getAnimationDistance = () => {
        const distance = -1367;
        return side ? distance : -distance;
    };
    
    const handleGoBackToLearn = ()=>{
        dispatch({type:'PICK_CATEGORY', page:'category', id:pageState.id})
    }

    const handleGoBackToSubjects = ()=>{
        dispatch({type:'PICK_CATEGORY', page:'final_work_category', id:pageState.id})
    }
    
    const animationDistance = getAnimationDistance();

    return (
        <>
            <header>
                <div className='FW-question_header'>
                    <div className='fw-backtolearn'> 
                        <button 
                            className='submit-button next-level FW-backtolearnbtn'
                            onClick={handleGoBackToLearn}
                        >
                            מעבר לפרק הלמידה
                        </button>
                    </div>
                    <div className='question_title_wrapper' style={{width:'70%'}}>
                        <div className='question_title'>{title}</div>
                    </div>
                    <div className='FW-changesubject-wrapper'>
                        <button 
                            className='submit-button FW-changesubject'
                            onClick={handleGoBackToSubjects}
                        >
                            לבחירת נושא אחר לעבודה
                        </button>
                    </div>
                </div>
            </header>
            <div className='question_section'>
                {page + 1 < questionsLength && 
                    <div style={{ alignSelf: "start" }}>
                        <LevelButton onClick={()=> increaseLevel(explanation, currentQuestion.type)} position={'left'} />
                    </div>
                }
                    <div className='question_wrapper'>
                        <div style={{padding:'30px'}}>
                            <AnimatePresence mode='wait' initial={false} custom={side}>
                                <motion.div
                                    key={page}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.25 }}
                                    custom={side}
                                    variants={variants}
                                >
                                    {children}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                {page > 0 && 
                    <div style={{ alignSelf: "start" }}>
                        <LevelButton onClick={()=> decreaseLevel(explanation, currentQuestion.type)} position={'right'} />
                    </div>
                }
            </div>
        </>
    );
};

export default FinalWorkLayout;


