import React, { useEffect, useState } from 'react';
import './Tutorial.css';  // Make sure to create a CSS file with the styles provided below
import TutorialBlock from './TutorialBlock';


const Tutorial = () => {

    return (
        <>
            <div className="tutorial-explanation-wrapper">
                {/* <div className="tutorial-explanation"> */}
                    <div className='tutorial-explanation-title'>ברוכים הבאים למדריך למשתמש</div>
                    <span className='tutorial-explnation-text'>
                    אפליקציית הלמידה תוכננה עם ממשק אינטואיטיבי ככל הניתן.  יחד עם זאת אם נתקלת בקשיים, ניתן למצוא כאן מספר הנחיות
                    </span>
                {/* </div> */}
                <div className="tutorial-info-blocks">
                    <TutorialBlock></TutorialBlock>
                </div>
            </div>
        </>
    );
};

export default Tutorial;
