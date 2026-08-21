import { useEffect, useState } from 'react'
import './App.css'
import Header from './componenets/Header/Header'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import CategoryPage from './pages/CategoryPage/CategoryPage'
import Sliders from './componenets/Sliders/Sliders'
import QuestionPage from './pages/QuestionPage/QuestionPage'
import FinalWorkPage from './pages/FinalWorkPage/FinalWorkPage'
import axiosInstance from './constants/axios.config'
import ToturialPage from './pages/TutorialPage/TutorialPage'
import HomePage from './pages/HomePage/HomePage'

function App() {
    const pageState = useSelector(state => state.page)
    const dispatch = useDispatch()
    const [pageDirection, setPageDirection] = useState(true)

    useEffect(() => {
        console.log("[APP] pageState changed →", pageState)
        console.log("[APP] pageDirection →", pageDirection)
    }, [pageDirection, pageState])

    const getCurrentUserName = async () => {
        try {
            const result = await axiosInstance.get('/current_user');
            dispatch({
                type:'CHANGE_NAME',
                fullName: `${result.data.FirstName} ${result.data.LastName}`
            })
        } catch (e) {
            console.log("Error loading user:", e)
        }
    }

    useEffect(() => {
        getCurrentUserName();
    }, [])

    // ░░░░░░░░░░░░░░░░░░░░░░
    // ╔═╗ FIX: הגנה על questionPage 
    // ░░░░░░░░░░░░░░░░░░░░░░
    const shouldShowQuestionPage =
        (pageState.page === 'category' || pageState.page === 'final_work') &&
        pageState.id &&
        pageState.id !== '0' &&
        pageState.id !== 0

    return (
        <>
            <Sliders setPageDirection={setPageDirection} />

            <div>
                <AnimatePresence initial={false}>
                    <motion.div
                        key={pageState.page + '_' + pageState.id}
                        initial={{ opacity: 1, x: 0, y: pageDirection ? -768 : 768 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        exit={{ opacity: 1, x: 0, y: pageDirection ? -768 : 768 }}
                        transition={{ duration: 0.7 }}
                        className='page'
                    >
                        {pageState.page !== 'home' && (
                            <Header setPageDirection={setPageDirection} />
                        )}

                        {pageState.page === 'home' && (
                            <HomePage setPageDirection={setPageDirection} />
                        )}

                        {pageState.page === 'welcome' && (
                            <CategoryPage setPageDirection={setPageDirection} />
                        )}

                        {/* ❗ מוצג רק כאשר יש ID תקין */}
                        {shouldShowQuestionPage && (
                            <QuestionPage
                                setPageDirection={setPageDirection}
                                type={pageState.page === 'category' ? 'regular' : 'finalWork'}
                            />
                        )}

                        {pageState.page === 'final_work_category' && (
                            <FinalWorkPage setPageDirection={setPageDirection} />
                        )}

                        {pageState.page === 'tutorial' && (
                            <ToturialPage setPageDirection={setPageDirection} />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </>
    )
}

export default App
