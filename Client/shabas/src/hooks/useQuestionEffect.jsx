import { useEffect, useState } from 'react';

function useQuestionEffect(questionInfo, setSelectedOption, setIsCorrect, correctAnswers) {
    const [hide, setHide] = useState(false);    
    useEffect(() => {
        if (questionInfo.done) {
            setSelectedOption(correctAnswers);
            setIsCorrect('fully-correct');
            setHide(true)
        }
    }, [questionInfo.done, setSelectedOption, setIsCorrect]);
    return {hide};
}

export default useQuestionEffect;