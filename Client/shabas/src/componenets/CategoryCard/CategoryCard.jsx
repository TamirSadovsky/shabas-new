import { useState } from 'react'

import './CategoryCard.css'
import img from '../../assets/family4kids_NB.png'
import CategoryButton from '../CategoryButton/CategoryButton'
import SelectCategoryButton from '../SelectCategoryButton/SelectCategoryButton'
import SelectFinalWorkButton from '../SelectFinalWorkButton/SelectFinalWorkButton'
function CategoryCard({category_name, level, total, imgsrc, category_identifier, onClick, isFinal, buttonText}) {

    return (
        <>  
            <div className='categoryCard_wrapper' onClick={()=> onClick(category_identifier)} >
                <img src={imgsrc} className='category_image'></img>
                <header className='categoryCard_header'>
                    <div className='categoryCard_title'>{category_name}</div>
                    {!isFinal && <div className='categoryCard_subheader'>השלמת {level} מתוך {total} שלבים</div>}
                </header>
                <div className='stage_button'>
                    {!isFinal && <SelectCategoryButton onClick={()=> onClick(category_identifier)} level={level} total={total}></SelectCategoryButton>}
                    {isFinal && <SelectFinalWorkButton buttonText={'לחץ לתעבודת הגמר'} onClick={()=> onClick(category_identifier)}></SelectFinalWorkButton>}
                </div>
            </div>
        </>
    )
}

export default CategoryCard
