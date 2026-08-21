import { useState } from 'react'
import CategoryButton from '../CategoryButton/CategoryButton'
function SelectFinalWorkButton( {buttonText, onClick} ) {
    return (
        <>  
            <CategoryButton 
                buttonText={buttonText} 
                className={'category_button start'}
                onClick={onClick}
            >    
            </CategoryButton>
        </>
    )
}

export default SelectFinalWorkButton
