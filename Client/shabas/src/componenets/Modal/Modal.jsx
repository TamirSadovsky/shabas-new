
import { useState } from 'react'
import ReactDOM from 'react-dom'
import './Modal.css'

const Modal = ({show = false, setShow, child}) => {
    const portal = document.getElementById('overlays');
    console.log(show)
    const handleClick = (e) => {
        if(e.target.className != 'backdrop'){
            return;
        }
        setShow(false)
    }
    if(!show) return;
    console.log("SHOW", show)

    return (
        <>
            {ReactDOM.createPortal(
                <div className='backdrop' onClick={handleClick}>
                    {child}
                    {/* <div>vb</div> */}
                </div>, portal
            )}
        </>
    )   
}

export default Modal