import { useDispatch, useSelector } from "react-redux";
import LayoutwithAnimation from "../Layouts/LayoutwithAnimation/LayoutwithAnimation";
import { useEffect, useState } from "react";
import Explanation from "../../componenets/Explanation/Explanation";
import { debounce } from "../../constants/utils";
import axiosInstance from "../../constants/axios.config";
import OpenQuestion from "../../componenets/OpenQuestion/OpenQuestion";
import FinalWorkLayout from "../Layouts/FinalWorkLayout/FinalWorkLayout";

function FinalWorkQuestionPage() {
    const levelState = useSelector(state => state.level['finalWork']);
    const pageState = useSelector(state => state.page);
    const dispatch = useDispatch();
    const levelEntry =
    levelState?.regular?.[pageState.id] ||
    levelState?.finalWork?.[pageState.id] ||
    null;

    const currentLevel = levelEntry?.level ?? 0;    
    const levelNode = levelState?.[pageState.id] ?? null;
    const totalLevel = levelNode?.total ?? 0;
    const [side, setSide] = useState(false)
    const [questions, setQuestions] = useState();
    const [levels, setLevels] = useState(currentLevel + 1)
    const [actualPageCount, setActualPageCount] = useState(pageState.page == 'final_work' ? 0 : currentLevel);
    const [movePage, setMovePage] = useState(false);
    const [lastPageType, setLastPageType] = useState();
    const questionId = questions ? parseInt(Object.keys(questions)[0]) + actualPageCount : null;

    useEffect(()=>{
        fetchFinalResults();
        setMovePage(true)
        console.log('wtf?')
    },[pageState])


    const fetchFinalResults = async () => {
        try{
            const results = await axiosInstance.get(`/questions/final_work_questions/${pageState.id}`)
            console.log(results.data)
            setQuestions(results.data)
        }catch(e){
            console.log(e);
        }
    }

    const increaseLevel = (explanation, pageType) => {
        if(!movePage) return;
        scrollToTop()
        setSide(true)
        setLastPageType(pageType)
        console.log("actualPageCount", actualPageCount, Object.keys(questions).length);
        if (actualPageCount + 1 < Object.keys(questions).length) {
            setTimeout(() => {
                setActualPageCount((prevLevel) => prevLevel + 1);
                console.log("works")
                if (explanation || lastPageType == 'explanation') {
                    setLevels((prevLevel) => prevLevel); // Trigger re-render without changing the level
                } else {
                    setLevels((prevLevel) => prevLevel + 1); // Decrease the level
                }
            }, 120);
        }
    };

    const debouncedIncreaseLevel = debounce(increaseLevel, 150)

    const decreaseLevel = (explanation, pageType ) => {
        if(!movePage) return;
        setLastPageType(pageType)
        scrollToTop()
        setSide(false)
        if (actualPageCount - 1 > 0) {
            setTimeout(() => {
                setActualPageCount((prevLevel) => prevLevel - 1);
                if(levels - 1){
                    if (explanation || lastPageType == 'explanation') {
                        setLevels((prevLevel) => prevLevel); // Trigger re-render without changing the level
                    } else {
                        setLevels((prevLevel) => prevLevel - 1); // Decrease the level
                    }
                }
            }, 120);
        }
        console.log("ya")
    };

    const debouncedDecreaseLevel = debounce(decreaseLevel, 150)
    
    
    const completeLevel = (correctStatus) => {
        scrollToTop()
        setSide(true)
        console.log(levels + 1)
        if (actualPageCount + 1 <= totalLevel) {
            console.log("clicked")
            setQuestions(prev => ({
                ...prev,
                [questionId]:{
                    ...prev[questionId],
                    done: true,
                    correct: correctStatus
                }
            }))
            dispatch({type:"INCREASE_LEVEL", category: pageState.id})
            setTimeout(() => {
                setLevels((prevLevel) => prevLevel + 1);
                setActualPageCount((prevLevel) => prevLevel + 1);
            }, 120);
        }
    };
    const debouncedCompleteLevel = debounce(completeLevel, 150)
    
    const scrollToTop = () => {
        document.getElementsByClassName("header")[0].scrollIntoView({ block: 'start', behavior: 'smooth' });
    };

    if(!questions) return;
    const currentQuestion = questions[questionId];
    let questionComponent = null;
    console.log(type, "asdfasdfasdfasfasdfasdfasdf")
    if (currentQuestion.type === "explanation") {
        questionComponent = <Explanation questionInfo={currentQuestion} />;
    } else if (currentQuestion.type === "open_question") {
        questionComponent = <OpenQuestionFinalWork questionInfo={currentQuestion} questionId={questionId} nextLevel={currentLevel + 1} completeLevel={debouncedCompleteLevel} setQuestions={setQuestions} />;
    }
    // const explanation = currentQuestion.explanation ? <Explanation content={currentQuestion.explanation_content} title={currentQuestion.explanation_title} /> : null;

    return (
        <FinalWorkLayout
            title={currentQuestion.title}
            audio={currentQuestion.audio}
            totalLevel={totalLevel}
            currentLevel={currentLevel}
            increaseLevel={debouncedIncreaseLevel}
            decreaseLevel={debouncedDecreaseLevel}
            currentQuestion={currentQuestion}
            explanation={currentQuestion.type == 'explanation'}
            navigationLevel={levels}
            side={side}
            page={actualPageCount}
        >
            {currentQuestion?.explanation.length > 0 && <Explanation questionInfo={currentQuestion} />}
            {questionComponent}
        </FinalWorkLayout>
    );
}

export default FinalWorkQuestionPage;