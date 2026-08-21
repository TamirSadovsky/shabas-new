import React, { useEffect, useState } from 'react';
import './TutorialBlock.css';  // Make sure to create a CSS file with the styles provided below
import homepageImage from '../../assets/homepage.png';
import slidersImage from '../../assets/sliders.png';
import chaptersImage from '../../assets/chapters.png';
import singleChoiceImage from '../../assets/singlechoice.png';
import multipleChoiceImage from '../../assets/multiplechoice.png';
import yesNoImage from '../../assets/yseno.png';
import dragAndDropImage from '../../assets/draganddrop.png';
import connectDotImage from '../../assets/connectdot.png';
import openQuestionImage from '../../assets/openquestion.png';
import teacherNoteImage from '../../assets/teachernote.png';
import openImage from '../../assets/open.png';
import audio from '../../assets/sounds.png';
import open from '../../assets/openquestion.png';

const TutorialBlock = () => {
    return (
        <>
            <hr className='horizontal-seperator'></hr>
            <div className="tutorial-block-wrapper">
                <div className="tutorial-block-title">
                    <h3>כללי</h3>    
                </div>
                <div className="tutorial-block-text">
                    מטרת האפליקציה - לימוד תוכן ותרגול שפה<br></br>
                    ניתן לעבור בין כל המסכים באופן בלתי מוגבל באמצעות לחיצה על הכפתורים המתאימים שעל המסך<br></br>
                    ניתן לענות על כל שאלה באופן בלתי מוגבל עד להגעה לתשובה נכונה
                </div>
            </div>
            <hr className='horizontal-seperator'></hr>
            <div className="tutorial-block-wrapper">
                <div className="tutorial-block-title">
                    <h3>העמוד הראשי</h3>
                </div>
                <div className="tutorial-block-text">
                    האפליקציה בנויה ממסך פתיחה בו ניתן לבחור את פרק הלמידה. עבור כל פרק תוצג ההתקדמות שבוצעה במהלכו.
                </div>
                <div className="tutorial-block-img">
                    <img  src={homepageImage} alt="" className="tutorial-img" />
                </div>
                <div className="tutorial-block-text">
                    בעמוד זה גם ניתן לגשת לביצוע עבודת הגמר
                </div>
                <br>
                </br>
                <div className="tutorial-block-text">
                    באמצעות הכפתורים הבאים, ניתן לשלוט בעומת תאורה ועוצמת שמע וכמו כן להגיע למסך המדריך ללומד
                </div>
                <div className='slider-images'>
                    <img src={slidersImage}></img>
                    <div className='explnation-sliders'>
                        <div className="tutorial-block-text">עוצמת שמע</div>
                        <div className="tutorial-block-text">עוצמת הארה</div>
                        <div className="tutorial-block-text">מעבר למדריך ללומד</div>
                    </div>
                </div>
                <hr className='horizontal-seperator'></hr>
                <div className="tutorial-block-title">
                    <h3>פרקי הלמידה</h3>
                </div>
                <div className="tutorial-block-text">
                    בכל פרק ישנם קטעי קריאה ושאלות מסוגים שונים:<br></br>
                    ניתן לדפדף בין העמודים בעזרת כפתורי החצים הכחולים הנמצאים בשני הצדדים של ממשק המשתמש
                </div>
                <div className="tutorial-block-img">
                    <img  src={chaptersImage} alt="" />
                </div>
                <hr className='horizontal-seperator'></hr>
                <div className="tutorial-block-title">
                    <h3>סוגי השאלות</h3>
                </div>
                <div className="tutorial-block-text">
                    <b>שאלת בחירה בודדת (שאלה אמריקאית):</b><br></br>
                    ניתן לבחור רק תשובה אחת נכונה
                </div>
                <div className="tutorial-block-img">
                    <img  src={singleChoiceImage} alt="" />
                </div>
                <div className="tutorial-block-text">
                    <b>שאלת בחירה מרובה:</b><br></br>
                    ישנן מספר תשובות נכונות
                </div>
                <div className="tutorial-block-img">
                    <img  src={multipleChoiceImage} alt="" />
                </div>
                <div className="tutorial-block-text">
                    <b>שאלת נכון/לא נכון:</b><br></br>
                    יש לבחור עבור כל היגד האם הוא נכון או לא נכון
                </div>
                <div className="tutorial-block-img">
                    <img  src={yesNoImage} alt="" />
                </div>
                <div className="tutorial-block-text">
                    <b>שאלת מחסן מילים:</b><br></br>
                    יש לגרור מילים ממחסן המילים אל המשפטים הנכונים
                </div>
                <div className="tutorial-block-img">
                    <img  src={dragAndDropImage} alt="" />
                </div>
                <div className="tutorial-block-text">
                    <b>מתיחת קווים:</b><br></br>
                    יש לחבר בקו באמצעות בחירה בנקודת התחלה ונקודת סיום בין החלקים המתאימים
                </div>
                <div className="tutorial-block-img">
                    <img  src={connectDotImage}alt="" />
                </div>
                <div className="tutorial-block-text">
                    <b>שאלה פתוחה:</b><br></br>
                    יש לבחור/להצביע על התיבה הלבנה ואז תיפתח אפשרות לכתיבת טקסט. <br></br>                
                    ניתן לכתוב באמצעות המקלדת את התשובה במלל חופשי. <br></br>
                    ניתן בכל שלב לערוך את המלל - למחוק, לשנות או להוסיף 
                </div>                    
                <div className="tutorial-block-img">
                    <img  src={openQuestionImage} alt="" />
                </div>
                <div className="tutorial-block-text">
                שאלה פתוחה תיבדק ע"י המורה וייתכן ותקבל הערה להתייחסות. הערה זו תופיע באמצעות סימן קריאה אדום בצד התיבה. <br></br>                
                ובלחיצה עליו תופיע הערת המורה בחלונית נפרדת. לאחר קריאת ההערה ניתן יהיה לסגור את החלונית באמצעות לחיצה על כפתור X.
                </div>  
                <div className="tutorial-block-img">
                    <img  src={teacherNoteImage} alt="" />
                </div>  
                <hr className='horizontal-seperator'></hr>
                <div className="tutorial-block-title">
                    <h3>הפעלת שמע</h3>
                </div>
                <div className="tutorial-block-text">
                    לצד חלק מהטקסטים יוצג כפתור השמעה. בלחיצה עליו, תושמע הקראה של המלל.
                </div>
                <div className="tutorial-block-img">
                    <img  src={audio} alt="" />
                </div>  
                <hr className='horizontal-seperator'></hr>
                <div className="tutorial-block-title">
                    <h3>עבודת הגמר</h3>
                </div>
                <div className="tutorial-block-text">
                    בתחילת עבודת הגמר, יש לבחור נושא לעבודה. <br></br>
                    בשלבים הבאים ישנן הנחיות מובנות לכתיבת ההקדמה, מענה על שאלות וסיכום.<br></br>
                    אופן המענה על השאלות זהה לשאלות הפתוחות.<br></br>
                    בשלב המענה על השאלות, ישנו כפתור המאפשר לעבור לפרק המתאים לנושא העבודה.<br></br>
                    כאשר העבודה מוכנה להגשה, ניתן ללחוץ על כפתור ההגשה שבסוף שלב הסיכום.<br></br>
                    המורה יכולה להכניס הערות לתיקון ושיפור התשובות וניתן לקרוא אותן בלחיצה על סימן הקריאה האדום
                </div>
                <div className="tutorial-block-img">
                    <img  src={openImage} alt="" />
                </div>  
                <div className="tutorial-block-text">
                    בעת הלחיצה, ההודעה תיפתח בחלון צף:
                </div>
                <div className="tutorial-block-img">
                    <img  src={teacherNoteImage} alt="" />
                </div>  
            </div>
        </>
    );
};

export default TutorialBlock;
