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
    const pageState = useSelector(state => state.page)
    const [categories, setCategories] = useState([]);
    const [loadState, setLoadState] = useState('loading');
    const dispatch = useDispatch();
    const categoryImages = [cata1, cata2, cata3, cata4, cata5]

    const returnPhotoFromIndex = (index)=>{
        const numericIndex = Number(index)
        const imageIndex = Number.isFinite(numericIndex)
            ? Math.abs(numericIndex - 1) % categoryImages.length
            : 0
        return categoryImages[imageIndex]
    }

    const fetchFinalWorkCategories = async (bookId, signal)=>{
        try{
            setLoadState('loading')
            dispatch({type:'LOAD_DATA', data:{}, pageType:'finalWork'})
            const results = await axiosInstance.get('/questions/final_work_category', {
                params: { bookId },
                signal
            })
            const loadedCategories = Array.isArray(results.data?.recordset)
                ? results.data.recordset
                : []
            setCategories(loadedCategories)
            dispatch({
                type:'LOAD_DATA',
                pageType:'finalWork',
                data: loadedCategories.reduce((acc, category) => {
                    acc[category.ChapterID] = {
                        level: 0,
                        name: category.ChapterName,
                        total: 0
                    }
                    return acc
                }, {})
            })
            setLoadState('ready')
        }catch(e){
            if (e.code === 'ERR_CANCELED') return
            console.log(e);
            setLoadState('error')
        }
    }

    useEffect(()=>{
        const controller = new AbortController()
        fetchFinalWorkCategories(pageState.bookId || 1, controller.signal);
        return () => controller.abort()
    },[pageState.bookId])
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
                    <div className='FW-category_title'>{pageState.bookName || 'המשפחה'}</div>
                    <div className='FW-category_subheader'>שלום {userState.fullName}, בחר נושא לעבודת הגמר</div>
                </header>
                <section className='FW-category_selectsection'>
                    {loadState === 'loading' && <div>טוען נושאים לעבודת הגמר…</div>}
                    {loadState === 'error' && <div>לא ניתן לטעון את עבודות הגמר</div>}
                    {loadState === 'ready' && categories.length === 0 && (
                        <div>לא נמצאו עבודות גמר לספר זה</div>
                    )}
                    {categories.map((cata) => (
                        <CategoryCard
                            key={cata.ChapterID}
                            isFinal={true}
                            onClick={handleCategoryClick}
                            category_identifier={cata.ChapterID}
                            category_name={cata.ChapterName}
                            imgsrc={returnPhotoFromIndex(cata.ChapterID)}
                        />
                    ))}
                </section>
            </main>
        </>
    )
}

export default FinalWorkPage
