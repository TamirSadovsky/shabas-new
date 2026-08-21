import { useState } from 'react'
import { useSelector } from 'react-redux'
import FinalWorkPage from '../FinalWorkPage/FinalWorkPage'
import FinalWorkAnswerPage from '../FinalWorkAnswerPage/FinalWorkAnswerPage'
import { motion, AnimatePresence } from 'framer-motion';

function FinalWorkWrapper() {
    const pageState = useSelector(state => state.page)
    
    return (
        <>
        <AnimatePresence initial={false}>
                <motion.div
                    key={pageState.page}
                    initial={{ opacity: 1, x: 0, y: 768 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 1, x: 0, y: -768 }}
                    transition={{ duration: 1 }}
                    className='page'
                >
                    {/* {pageState.page == 'final_work' && <FinalWorkAnswerPage></FinalWorkAnswerPage>} */}
            </motion.div>
        </AnimatePresence>
        </>
    )
}

export default FinalWorkWrapper
