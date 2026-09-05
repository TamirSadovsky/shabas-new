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
import FinalWorkButton from '../../componenets/FinalWorkButton/FinalWorkButton.jsx'
import axiosInstance from '../../constants/axios.config.js'
import logServiceInstance from '../../logService.js'

function CategoryPage({triggerAnimation, setPageDirection}) {
    const userState = useSelector(state => state.user)
    const levelState = useSelector(state => state.level['regular'])
    const pageState = useSelector(state => state.page)
    const [rightLogoClick, setRightLogoClick] = useState(0)
    const [loadState, setLoadState] = useState('loading')



    const dispatch = useDispatch()
    const categoryImages = [cata1, cata2, cata3, cata4, cata5]

    const getCategoryImage = (categoryId, image) => {
        if (typeof image === 'string' && /^(https?:|data:|blob:)/i.test(image)) {
            return image
        }

        const numericId = Number(categoryId)
        const imageIndex = Number.isFinite(numericId)
            ? Math.abs(numericId - 1) % categoryImages.length
            : 0
        return categoryImages[imageIndex]
    }

    const handleCategoryClick = (category_identifier)=>{
        const category = levelState[category_identifier]
        if (!category) return

        console.log(category.level, category.total)
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

    const fetchCategories = async (bookId, signal)=>{
        try{
            setLoadState('loading')
            dispatch({type:'LOAD_DATA', data:{}, pageType:'regular'})
            const results = await axiosInstance.get('/chapter_list', {
                params: { bookId },
                signal
            })
            console.log(results.data)
            dispatch({type:'LOAD_DATA', data:results.data.data, pageType:'regular'})
            setLoadState('ready')
        } catch(e){
            if (e.code === 'ERR_CANCELED') return
            console.log("Error fetching categories: ", e);
            setLoadState('error')
        }


    }

    useEffect(()=>{
        const controller = new AbortController()
        fetchCategories(pageState.bookId || 1, controller.signal);
        return () => controller.abort()
    },[pageState.bookId])

    useEffect(() => {
        const resetExitClicks = (event) => {
            if (event.target.closest('[data-sbs-exit-logo]')) {
                return
            }
            setRightLogoClick(0)
        }

        document.addEventListener('click', resetExitClicks, true)
        return () => document.removeEventListener('click', resetExitClicks, true)
    }, [])

    useEffect(()=>{
        if(rightLogoClick === 6){
            setRightLogoClick(0)
            axiosInstance.post('/kill_server')
        }
    },[rightLogoClick])

    return (
        <>  
            <img className='atid' src={atid_logo}/>
            <img
                className='sbs'
                data-sbs-exit-logo="true"
                onClick={()=> setRightLogoClick(prev => prev + 1)}
                src={sbs_logo}
            />
            <main className='category_wrapper'>
                <header className='category_header'>
                    <div className='category_title'>{pageState.bookName || 'המשפחה'}</div>
                    <div className='category_subheader'>שלום {userState.fullName}, בחר יחידת לימוד</div>
                </header>
                <section className='category_selectsection'>
                    {loadState === 'loading' && <div>טוען יחידות לימוד…</div>}
                    {loadState === 'error' && <div>לא ניתן לטעון יחידות לימוד</div>}
                    {loadState === 'ready' && Object.keys(levelState).length === 0 && (
                        <div>לא נמצאו יחידות לימוד לספר זה</div>
                    )}
                    {Object.entries(levelState)
                        .sort(([leftId], [rightId]) => Number(rightId) - Number(leftId))
                        .map(([id, category]) => (
                            <CategoryCard
                                key={id}
                                onClick={handleCategoryClick}
                                triggerAnimation={triggerAnimation}
                                category_identifier={id}
                                category_name={category.name}
                                level={category.level}
                                total={category.total}
                                imgsrc={getCategoryImage(id, category.image)}
                            />
                        ))}
                </section>
            </main>
            <footer>
                <FinalWorkButton onClick={handleFinalWork} type='gmar'/>
            </footer>
        </>
    )
}

export default CategoryPage
