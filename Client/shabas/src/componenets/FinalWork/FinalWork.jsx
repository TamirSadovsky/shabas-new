import { useState } from 'react'

import './CategoryCard.css'
import img from '../../assets/family4kids_NB.png'
import CategoryButton from '../CategoryButton/CategoryButton'
import { useDispatch } from 'react-redux'
function FinalWork({triggerAnimation, category_name, level, total, imgsrc, category_identifier}) {
    const dispatch = useDispatch()
    const handleCategoryClick = ()=>{
        dispatch({type:'PICK_CATEGORY', page:'category', id:category_identifier})
    }
    return (
        <>  
            <div className='categoryCard_wrapper'>
                <img src={imgsrc} className='category_image'></img>
                <header className='categoryCard_header'>
                    <div className='categoryCard_title'>{category_name}</div>
                    <div className='categoryCard_subheader'>השלמת {level} מתוך {total} שלבים</div>
                </header>
                <div className='stage_button'>
                    <CategoryButton onClick={handleCategoryClick} level={level} total={total}></CategoryButton>
                </div>
            </div>
        </>
    )
}

export default FinalWork
