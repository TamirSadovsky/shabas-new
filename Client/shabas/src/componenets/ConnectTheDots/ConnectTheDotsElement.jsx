import { useState } from 'react'
import './ConnectTheDotsElement.css'


function ConnectTheDotsElement( {text, className, onCircleClick, id, style, correctAnswers, submitted} ) {
    const side =  id.split('-')[1] === 'left' ? 'left' : 'right';
    const cirecleSideStyle = {
        [side]: side == 'left' ? "93%" : "95%"
    }
    // for single side correct sign only remove answer.end -> or check if side is left.
    const correct = correctAnswers.some(answer => answer.start === id || answer.end === id);
    return (
        <>  
            <div id={id  + '_wrap'}  className={`CTD-element_wrapper ${className ? className : ''} ${correct ? 'active' : ''}`} style={style} onClick={() => onCircleClick(id)}>
                <div className='CTD-element_text'>
                    {text}
                </div>
                <div  id={id} className={`CTD-element_circle ${correct ? 'CTD-correct-circle ' : ''}`} style={cirecleSideStyle}>    
                </div>
            </div>
        </>
    )
}

export default ConnectTheDotsElement
