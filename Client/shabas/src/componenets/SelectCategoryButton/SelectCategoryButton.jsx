import { useState } from 'react'
import done from '../../assets/done.svg'
import gmar from '../../assets/gmar_icon.svg'
import CategoryButton from '../CategoryButton/CategoryButton'
function SelectCategoryButton( {level, total, type, onClick} ) {
    const getClassname = ()=>{
        if(level < total && level > 0){
            return 'category_button continue'
        }
        if(level === 0){
            return 'category_button start'
        }
        return 'emoji'
    }

    const handleText = () =>{
        return(
            <>
                {type && <img src={gmar} className='gmar_icon'/>}
                {(level < total && level > 0) && `שלב ${level + 1}`}
                {level === 0 && "תחילת התרגול"}
                {level >= total && <img src={done}/>}
                {type && "עבודת גמר"}
            </>
        )
    }
    return (
        <>  
            <CategoryButton 
                buttonText={handleText()} 
                className={getClassname()}
                onClick={onClick}
            >    
            </CategoryButton>
        </>
    )
}

export default SelectCategoryButton
