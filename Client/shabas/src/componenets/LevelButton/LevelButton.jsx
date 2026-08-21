import { useState } from 'react'
import './LevelButton.css'
import arrow from '../../assets/arrow.svg'
import gmar from '../../assets/gmar_icon.svg'
function LevelButton( {position, onClick} ) {
    const classOfButton = `level_button button_${position}`
    return (
        <>  
            <div onClick={onClick} className='level_button_wrapper'>
                <div className={classOfButton}>
                    {position === 'right' && "שלב קודם" }
                    <img style={{height:'32px', width: '32px'}} src={arrow} className={position}/>
                    {position === 'left' && "שלב הבא" }
                </div>
            </div>  
        </>
    )
}

export default LevelButton
