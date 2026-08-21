import { useEffect, useState } from 'react'

import './CategoryPage.css'
import { useDispatch, useSelector } from 'react-redux'
import CategoryCard from '../../componenets/CategoryCard/CategoryCard'
import {
    cata1,
    cata2,
    cata3,
    cata4,
    cata5
} from '../../assets/cata_images.js'

import sbs_logo from '../../assets/sbs_logo.svg'
import atid_logo from '../../assets/atid_logo.svg'
import CategoryButton from '../../componenets/CategoryButton/CategoryButton.jsx'
import FinalWorkButton from '../../componenets/FinalWorkButton/FinalWorkButton.jsx'
import axios from 'axios'
import axiosInstance from '../../constants/axios.config.js'
import logServiceInstance from '../../logService.js'

function CategoryPage({triggerAnimation, setPageDirection}) {
    const userState = useSelector(state => state.user)
    const levelState = useSelector(state => state.level['regular'])
    const pageState = useSelector(state => state.page)
    const [leftLogoClick, setLeftLogoClick] = useState(0)
    const [rightLogoClick, setRightLogoClick] = useState(0)



    const dispatch = useDispatch()
    const handleCategoryClick = (category_identifier)=>{
        console.log(levelState[category_identifier].level, levelState[category_identifier].total )
        // if(levelState[category_identifier].level >= levelState[category_identifier].total) return; // Make the user unable to visit the chapter again.
        console.log("category_identifier", category_identifier)
        setPageDirection(false)
        dispatch({type:'PICK_CATEGORY', page:'category', id:category_identifier})
        const data = {
            userId: userState.id,
            categoryId:category_identifier,
            questionId:0,
            isQuestion:0,
            isCorrect:0,
            answer:'picked chapter'
        }
        // sendToLog(data)
        logServiceInstance.log(data)
    }

    const handleFinalWork = (category_identifier)=>{
        console.log("category_identifier", category_identifier)
        setPageDirection(false)
        dispatch({type:'PICK_CATEGORY', page:'final_work_category'})
    }

    const fetchCategories = async ()=>{
        try{
            const results = await axiosInstance.get('/chapter_list')
            console.log(results.data)
            dispatch({type:'LOAD_DATA', data:results.data.data, pageType:'regular'})
        } catch(e){
            console.log("Error fetching categories: ", e);
        }


    }

    useEffect(()=>{
        fetchCategories();
    },[])

    useEffect(()=>{
        if(leftLogoClick + rightLogoClick === 6){
            axiosInstance.post('/kill_server')
        }
    },[leftLogoClick, rightLogoClick])

    return (
        <>  
            <img className='atid' onClick={()=> setLeftLogoClick(prev => prev + 1)} src={atid_logo}/>
            <img className='sbs' onClick={()=> setRightLogoClick(prev => prev + 1)} src={sbs_logo}/>
            <main className='category_wrapper'>
                <header className='category_header'>
                    <div className='category_title'>המשפחה</div>
                    <div className='category_subheader'>שלום {userState.fullName}, בחר יחידת לימוד</div>
                </header>
                <section className='category_selectsection'>
                    <CategoryCard onClick={handleCategoryClick} triggerAnimation={triggerAnimation} category_identifier='5' category_name={levelState[5].name} level={levelState[5].level} total={levelState[5].total} imgsrc={cata5}/>
                    <CategoryCard onClick={handleCategoryClick} category_identifier='4' category_name={levelState[4].name} level={levelState[4].level} total={levelState[4].total} imgsrc={cata4}/>
                    <CategoryCard onClick={handleCategoryClick} category_identifier='3' category_name={levelState[3].name} level={levelState[3].level} total={levelState[3].total} imgsrc={cata3}/>
                    <CategoryCard onClick={handleCategoryClick} category_identifier='2' category_name={levelState[2].name} level={levelState[2].level} total={levelState[2].total} imgsrc={cata2}/>
                    <CategoryCard onClick={handleCategoryClick} category_identifier='1' category_name={levelState[1].name} level={levelState[1].level} total={levelState[1].total} imgsrc={cata1}/>
                </section>
            </main>
            <footer>
                <FinalWorkButton onClick={handleFinalWork} type='gmar'/>
            </footer>
        </>
    )
}

export default CategoryPage
