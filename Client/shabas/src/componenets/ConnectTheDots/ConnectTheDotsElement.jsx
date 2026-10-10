import './ConnectTheDotsElement.css'


function ConnectTheDotsElement( {text, className, onCircleClick, id, style, active, selected, correct} ) {
    const side =  id.split('-')[1] === 'left' ? 'left' : 'right';
    const cirecleSideStyle = {
        [side]: side == 'left' ? "93%" : "95%"
    }
    const wrapperClasses = [
        'CTD-element_wrapper',
        className,
        active ? 'active' : '',
        selected ? 'CTD-selected' : '',
    ].filter(Boolean).join(' ');
    return (
        <>  
            <div id={id  + '_wrap'}  className={wrapperClasses} style={style} onClick={() => onCircleClick(id)}>
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
