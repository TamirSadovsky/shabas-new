import { useEffect, useLayoutEffect, useState } from 'react'
import './App.css'
import Header from './componenets/Header/Header'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import CategoryPage from './pages/CategoryPage/CategoryPage'
import Sliders from './componenets/Sliders/Sliders'
import QuestionPage from './pages/QuestionPage/QuestionPage'
import FinalWorkPage from './pages/FinalWorkPage/FinalWorkPage'
import axiosInstance from './constants/axios.config'
import { resolveMediaUrl } from './constants/mediaUrl'
import ToturialPage from './pages/TutorialPage/TutorialPage'
import HomePage from './pages/HomePage/HomePage'
import logServiceInstance from './logService'

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

    useEffect(() => {
        logServiceInstance.setBookId(pageState.bookId)
    }, [pageState.bookId])

    useLayoutEffect(() => {
        document.body.classList.toggle('reader-mode', pageState.page !== 'home')
    }, [pageState.page])

    useEffect(() => {
        const bookImage = pageState.bookImage
        const shouldUseBookBanner =
            pageState.page !== 'home' &&
            typeof bookImage === 'string' &&
            bookImage.trim().length > 0
        const resolvedBanner = shouldUseBookBanner
            ? resolveMediaUrl(bookImage)
            : undefined

        if (resolvedBanner) {
            document.body.style.setProperty(
                '--reader-banner',
                `url("${resolvedBanner}")`
            )
        } else {
            document.body.style.removeProperty('--reader-banner')
        }

        return () => {
            document.body.style.removeProperty('--reader-banner')
        }
    }, [pageState.page, pageState.bookImage])

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
                        key={pageState.page + '_' + pageState.bookId + '_' + pageState.id}
                        initial={{ opacity: 1, x: 0, y: pageDirection ? -768 : 768 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        exit={{ opacity: 1, x: 0, y: pageDirection ? -768 : 768 }}
                        transition={{ duration: 0.7 }}
                        className={pageState.page === 'home' ? 'page page-home' : 'page'}
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
