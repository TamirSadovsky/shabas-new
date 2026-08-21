import { useState } from 'react'
import './CategoryButton.css'
import done from '../../assets/done.svg'
import gmar from '../../assets/gmar_icon.svg'
function CategoryButton({onClick, buttonText, className}) {

    return (
        <>  
            <div className='category_button_wrapper' >
                <div className={className} onClick={onClick} >
                    {buttonText}
                </div>
            </div>  
        </>
    )
}

export default CategoryButton
