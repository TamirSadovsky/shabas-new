import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LevelButton from '../../../componenets/LevelButton/LevelButton';
import AudioPlayer from '../../../componenets/AudioPlayer/AudioPlayer';
import './LayoutwithAnimation.css';
import { useDispatch, useSelector } from 'react-redux';

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

const LayoutwithAnimation = ({ page, children, title, audio,  totalLevel, currentLevel, increaseLevel, decreaseLevel, explanation, navigationLevel, side, currentQuestion, questionsLength, currentPage, allPages }) => {
    const [isTrue, setIsTrue] = useState()
    const levelState = useSelector(state => state.level);
    const pageState = useSelector(state => state.page);
    const dispatch = useDispatch();
    const [animationDistance, setAnimationDistance] = useState(1367)
    const getAnimationDistance = () => {
        const distance = -1367;
        return side ? distance : -distance;
    };

    const isFinalExam = levelState.regular[pageState.id].finalExam;
    const isFinalInProgress = levelState.regular[pageState.id].finalInProgress;
    const showFinalExamButton = isFinalExam && isFinalInProgress

    const handleGoBackToSubjects = ()=>{
        
        console.log("Page state:", levelState.regular[pageState.id])
        dispatch({type:'PICK_CATEGORY', page:'final_work', id:levelState.regular[pageState.id].finalExam})
        // dispatch({type:'PICK_CATEGORY', page:'category', id:pageState.id})
    }
    useEffect(()=>{
        setAnimationDistance(getAnimationDistance())
    }, [page])
    return (
        <div>
            <div style={{textAlign:'right', marginRight:'15px', color:'black'}}>{`עמוד ${currentPage} מתוך ${allPages}`}</div>
            <header>
                <div className='question_header'>
                    <div className='question_subtitle'><b>השלמת {currentLevel} </b> מתוך {totalLevel}</div>
                    <div className='question_title_wrapper'>
                        <AudioPlayer
                            audioName={audio}
                            id={title}
                        />
                        <div className='question_title'>{title}</div>
                    </div>
                </div>
                    {showFinalExamButton && <div className='FW-changesubject-wrapper'>
                            <button 
                                className='submit-button FW-changesubject'
                                onClick={handleGoBackToSubjects}
                            >
                                לעבודת הגמר של הפרק
                            </button>
                    </div>}
            </header>
            <div className='question_section'>
                {page + 1 < questionsLength && 
                    <div style={{ alignSelf: "start" }}>
                        <LevelButton onClick={()=> {increaseLevel(explanation, currentQuestion.type); setIsTrue(prev => !prev)}} position={'left'} />
                    </div>
                }
                <div className='question_wrapper'>
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
                                <div style={{padding:'30px'}}>
                                    {explanation}
                                    {children}
                                </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
                {page > 0 && 
                    <div style={{ alignSelf: "start" }}>
                        <LevelButton onClick={()=> {decreaseLevel(explanation, currentQuestion.type); setIsTrue(prev => !prev)}} position={'right'} />
                    </div>
                }
            </div>
        </div>
    );
};

export default LayoutwithAnimation;
