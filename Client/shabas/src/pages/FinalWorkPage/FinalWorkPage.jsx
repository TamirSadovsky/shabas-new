import { useEffect, useState } from 'react'

import './FinalWorkPage.css'
import { useDispatch, useSelector } from 'react-redux'
import CategoryCard from '../../componenets/CategoryCard/CategoryCard.jsx'
import {
    cata1,
    cata2,
    cata3,
    cata4,
    cata5
} from '../../assets/cata_images.js'
import axiosInstance from '../../constants/axios.config.js'


function FinalWorkPage({triggerAnimation, setPageDirection}) {
    const userState = useSelector(state => state.user)
    const levelState = useSelector(state => state.level)
    const [categories, setCategories] = useState([]);
    const dispatch = useDispatch();

    const returnPhotoFromIndex = (index)=>{
        switch(index){
            case 1:
                return cata5;
            case 2:
                return cata4;
            case 3:
                return cata3;
            case 4:
                return cata2;
            case 5:
                return cata1;
            default:
                return null
        }
    }

    const fetchFinalWorkCategories = async ()=>{
        try{
            const results = await axiosInstance.get('/questions/final_work_category')
            setCategories(results.data.recordset)
        }catch(e){
            console.log(e);
        }
    }

    useEffect(()=>{
        fetchFinalWorkCategories();
    },[])
    // useEffect(()=>{
    //     setPageDirection(false)
    // }, [])

    const handleCategoryClick = (category_identifier)=>{
        setPageDirection(false)
        dispatch({type:'PICK_CATEGORY', page:'final_work', id:category_identifier})
    }

    return (
        <>  
            <main className='FW-category_wrapper'>
                <header className='FW-category_header'>
                    <div className='FW-category_title'>המשפחה</div>
                    <div className='FW-category_subheader'>שלום {userState.fullName}, בחר נושא לעבודת הגמר</div>
                </header>
                <section className='FW-category_selectsection'>
                    {categories && categories.map((cata, index) => {
                        if(index == 2) return;
                        return <CategoryCard isFinal={true} onClick={handleCategoryClick} category_identifier={cata.ChapterID} category_name={cata.ChapterName} imgsrc={returnPhotoFromIndex(cata.ChapterID)}/>
                    })}
                </section>
            </main>
        </>
    )
}

export default FinalWorkPage
