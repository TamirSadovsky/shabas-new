import { useDispatch, useSelector } from "react-redux";
import LayoutwithAnimation from "../Layouts/LayoutwithAnimation/LayoutwithAnimation";
import { useEffect, useRef, useState } from "react";
import SingleChoice from "../../componenets/SingleChoice/SingleChoice";
import MultipleChoice from "../../componenets/MultipleChoice/MultipleChoice";
import YesNoQuestionForm from "../../componenets/YesOrNo/YesOrNo";
import DragNDrop from "../../componenets/DragNDrop/DragNDrop";
import ConnectTheDots from "../../componenets/ConnectTheDots/ConnectTheDots";
import Explanation from "../../componenets/Explanation/Explanation";
import axiosInstance from "../../constants/axios.config";
import OpenQuestion from "../../componenets/OpenQuestion/OpenQuestion";
import OpenQuestionFinalWork from "../../componenets/OpenQuestion/OpenQuestionsFinalWork/OpenQuestionFinalWork";
import FinalWorkLayout from "../Layouts/FinalWorkLayout/FinalWorkLayout";
import logServiceInstance from "../../logService";
import { debounce, throttle } from "lodash";
import Modal from "../../componenets/Modal/Modal";
import FinalWorkModal from "../../componenets/FinalWorkModal/FinalWorkModal";
import LevelFinshed from "../../componenets/LevelFinished/LevelFinished";

function QuestionPage({ type }) {

    // ---- ALWAYS put hooks first ----
    const pageState = useSelector(state => state.page);
    const userState = useSelector(state => state.user);
    const fullLevelState = useSelector(state => state.level);
    const levelState = fullLevelState?.[type] || null;
    const dispatch = useDispatch();

    const [questions, setQuestions] = useState(null);
    const [side, setSide] = useState(false);
    const [levels, setLevels] = useState(1);
    const [actualPageCount, setActualPageCount] = useState(0);
    const finalQuestionInputRef = useRef("");
    const [lastPageType, setLastPageType] = useState("");
    const [showModalSubmission, setShowModalSubmission] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [loadState, setLoadState] = useState('loading');
    const [showLevelFinished, setShowLevelFinished] = useState(false);

    const decreaseTimeoutRef = useRef(null);
    const increaseTimeoutRef = useRef(null);

    // ---- SAFETY LOG ----
    console.log("%c[QP RENDER]", "color:#0ff;font-weight:bold;", {
        pageState,
        levelState,
        levelKeys: levelState ? Object.keys(levelState) : null
    });

    // ---- BLOCK RENDERING *AFTER HOOKS* ONLY ----
    const invalid =
        !levelState ||
        pageState.id === undefined ||
        levelState[pageState.id] === undefined;

    if (invalid) {
        console.warn("[QP] BLOCKED → waiting for data…", {
            pageState,
            levelStateKeys: levelState ? Object.keys(levelState) : null
        });
    }

    // ---- NOW SAFE TO USE levelState ----
    const levelNode = levelState?.[pageState.id];
    const currentLevel = levelNode?.level ?? 0;
    const totalLevel = levelNode?.total ?? 0;

    // QUESTION indexes
    const questionId = questions
        ? parseInt(Object.keys(questions)[actualPageCount])
        : null;

    const lastKey = questions ? Object.keys(questions).pop() : 0;
    const allPages = lastKey && questions?.[lastKey]
        ? questions[lastKey].pageId
        : 0;
    const questionsLength = questions ? Object.keys(questions).length : 0;


    // ---- FETCH QUESTIONS ----
    useEffect(() => {
        const controller = new AbortController();
        setQuestions(null);
        setLoadState('loading');

        if (pageState.page === "final_work") {
            fetchFinalResults(controller.signal);
        } else {
            fetchQuestions(controller.signal);
        }

        return () => controller.abort();
    }, [pageState.page, pageState.id, pageState.bookId, userState.id]);

    const fetchQuestions = async (signal) => {
        try {
            const results = await axiosInstance.get(
                `/questions/get_questions_by_bookid/${pageState.id}`,
                {
                    params: {
                        bookId: pageState.bookId || 1,
                        userId: userState.id
                    },
                    signal
                }
            );
            console.log("questions", results.data);
            setQuestions(Array.isArray(results.data) ? results.data : []);
            setLoadState('ready');
        } catch (e) {
            if (e.code === 'ERR_CANCELED') return;
            console.error(e);
            setLoadState('error');
        }
    };

    const fetchFinalResults = async (signal) => {
        try {
            const results = await axiosInstance.get(
                `/questions/final_work_questions/${pageState.id}`,
                {
                    params: {
                        bookId: pageState.bookId || 1,
                        userId: userState.id
                    },
                    signal
                }
            );
            console.log(results.data);
            const loadedQuestions = results.data && typeof results.data === 'object'
                ? results.data
                : {};
            setQuestions(loadedQuestions);
            setLoadState('ready');
        } catch (e) {
            if (e.code === 'ERR_CANCELED') return;
            console.error(e);
            setLoadState('error');
        }
    };

    // ---- LOG QUESTION VIEW ----
    useEffect(() => {
        if (!questions || !questions[questionId]) return;

        const current = questions[questionId];

        logServiceInstance.log({
            userId: userState.id,
            categoryId: pageState.id,
            questionId: current.id,
            isQuestion: 0,
            isCorrect: 0,
            answer: null,
        });
    }, [actualPageCount]);


    // ---- TRACK CURRENT PAGE ----
    useEffect(() => {
        if (questionId && questions) {
            setCurrentPage(questions[questionId]?.pageId);
        }
    }, [questionId]);


    // ---- SCROLL ----
    const scrollToTop = () => {
        document
            .getElementsByClassName("header")[0]
            .scrollIntoView({ block: "start", behavior: "smooth" });
    };

    // ---- LEVEL CONTROL ----
    const increaseLevel = (explanation, pageType) => {
        if (actualPageCount + 1 >= questionsLength) {
            if (type === "regular") {
                setShowLevelFinished(true);
            }
            return;
        }

        setSide(true);
        setLastPageType(pageType);
        scrollToTop();

        if (type === "finalWork") {
            dispatch({
                type: "INCREASE_LEVEL",
                category: pageState.id,
                pageType: type,
            });
            finalWorkOpenQuestionOnPageChangeHandle();
        }

        setActualPageCount((p) => p + 1);
        setCurrentPage((p) => p + 1);

        if (!explanation && lastPageType !== "explanation") {
            setLevels((p) => p + 1);
        }
    };

    const debouncedIncreaseLevel = throttle(increaseLevel, 500, {
        leading: false,
        trailing: true,
    });

    const decreaseLevel = (explanation, pageType) => {
        if (actualPageCount <= 0) return;

        setSide(false);
        setLastPageType(pageType);
        scrollToTop();

        if (type === "finalWork") {
            dispatch({
                type: "DECREASE_LEVEL",
                category: pageState.id,
                pageType: type,
            });
            finalWorkOpenQuestionOnPageChangeHandle();
        }

        setActualPageCount((p) => p - 1);
        setCurrentPage((p) => p - 1);

        if (!explanation && lastPageType !== "explanation") {
            setLevels((p) => Math.max(1, p - 1));
        }
    };

    const debouncedDecreaseLevel = throttle(decreaseLevel, 500, {
        leading: false,
        trailing: true,
    });

    const completeLevel = () => {
        dispatch({
            type: "INCREASE_LEVEL",
            category: pageState.id,
            pageType: type,
        });
    };

    const debouncedCompleteLevel = debounce(completeLevel, 150);


    // ---- FINAL WORK HANDLER ----
    const finalWorkOpenQuestionOnPageChangeHandle = () => {
        if (!finalQuestionInputRef.current?.length) return;
        const answer = finalQuestionInputRef.current;
        const data = {
            userId: userState.id,
            categoryId: pageState.id,
            questionId,
            answer,
        };

        logServiceInstance.saveFinal(data)
            .then(() => {
                setQuestions((prev) => ({
                    ...prev,
                    [questionId]: {
                        ...prev[questionId],
                        answer,
                        done: true,
                    },
                }));
            })
            .catch((error) => {
                console.error('Error saving final-work answer:', error);
            });
    };

    const submitFinalWork = async () => {
        try {
            await axiosInstance.post('/questions/complete_final_work', {
                userId: userState.id,
                bookId: pageState.bookId || 1,
                chapterId: pageState.id
            });
            setShowModalSubmission(true);
        } catch (error) {
            console.error('Error submitting final work:', error);
        }
    };

    if (invalid) {
        return (
            <div style={{ padding: "40px", fontSize: "22px" }}>
                טוען…
            </div>
        );
    }

    if (loadState === 'error') {
        return <div className="loading">לא ניתן לטעון שאלות</div>;
    }

    if (loadState === 'ready' && questions && Object.keys(questions).length === 0) {
        return <div className="loading">לא נמצאו שאלות לפרק זה</div>;
    }

    if (showLevelFinished) {
        return <LevelFinshed />;
    }

    // ---- IF QUESTIONS NOT LOADED ----
    if (!questions || !questions[questionId]) {
        return <div className="loading">טוען שאלות…</div>;
    }


    // ---- RENDER QUESTION COMPONENT ----
    const currentQuestion = questions[questionId];
    let questionComponent = null;

    switch (currentQuestion.type) {
        case "single_choice":
            questionComponent = (
                <SingleChoice
                    pageId={pageState.id}
                    questionInfo={currentQuestion}
                    questionId={questionId}
                    nextLevel={currentLevel + 1}
                    completeLevel={debouncedCompleteLevel}
                    setQuestions={setQuestions}
                    increaseLevel={increaseLevel}
                />
            );
            break;

        case "multi_choice":
            questionComponent = (
                <MultipleChoice
                    pageId={pageState.id}
                    questionInfo={currentQuestion}
                    questionId={questionId}
                    nextLevel={currentLevel + 1}
                    completeLevel={debouncedCompleteLevel}
                    setQuestions={setQuestions}
                    increaseLevel={increaseLevel}
                />
            );
            break;

        case "true_false":
            questionComponent = (
                <YesNoQuestionForm
                    pageId={pageState.id}
                    questionInfo={currentQuestion}
                    questionId={questionId}
                    nextLevel={currentLevel + 1}
                    completeLevel={debouncedCompleteLevel}
                    setQuestions={setQuestions}
                    increaseLevel={increaseLevel}
                />
            );
            break;

        case "drag_n_drop":
            questionComponent = (
                <DragNDrop
                    pageId={pageState.id}
                    questionId={questionId}
                    questionInfo={currentQuestion}
                    nextLevel={currentLevel + 1}
                    completeLevel={debouncedCompleteLevel}
                    setQuestions={setQuestions}
                    increaseLevel={increaseLevel}
                />
            );
            break;

        case "connect_the_dots":
            questionComponent = (
                <ConnectTheDots
                    pageId={pageState.id}
                    questionId={questionId}
                    questionInfo={currentQuestion}
                    nextLevel={currentLevel + 1}
                    completeLevel={debouncedCompleteLevel}
                    setQuestions={setQuestions}
                    increaseLevel={increaseLevel}
                />
            );
            break;

        case "explanation":
            questionComponent = <Explanation questionInfo={currentQuestion} />;
            break;

        case "open_question":
            if (type === "finalWork") {
                const nonExplanation = Object.values(questions).filter(
                    (q) => q.type !== "explanation"
                );
                const isFinal = nonExplanation.every(
                    (q) => q.done === true
                );

                const lastPage =
                    actualPageCount + 1 === Object.keys(questions).length;

                questionComponent = (
                    <OpenQuestionFinalWork
                        pageId={pageState.id}
                        lastPage={lastPage}
                        questionInfo={currentQuestion}
                        questionId={questionId}
                        setQuestions={setQuestions}
                        isFinal={isFinal}
                        finalQuestionInputRef={finalQuestionInputRef}
                        submitFinalWork={submitFinalWork}
                    />
                );
            } else {
                questionComponent = (
                    <OpenQuestion
                        pageId={pageState.id}
                        questionInfo={currentQuestion}
                        questionId={questionId}
                        nextLevel={currentLevel + 1}
                        completeLevel={debouncedCompleteLevel}
                        setQuestions={setQuestions}
                        increaseLevel={increaseLevel}
                    />
                );
            }
            break;
    }

    // ---- RENDER LAYOUT ----
    if (type === "regular") {
        return (
            <LayoutwithAnimation
                title={currentQuestion.title}
                audio={currentQuestion.audio}
                totalLevel={totalLevel}
                currentLevel={currentLevel}
                increaseLevel={debouncedIncreaseLevel}
                decreaseLevel={debouncedDecreaseLevel}
                currentQuestion={currentQuestion}
                explanation={currentQuestion.type === "explanation"}
                navigationLevel={levels}
                side={side}
                page={actualPageCount}
                questionsLength={questionsLength}
                currentPage={currentPage}
                allPages={allPages}
            >
                {currentQuestion?.explanation?.length > 0 && (
                    <Explanation questionInfo={currentQuestion} />
                )}
                {questionComponent}
            </LayoutwithAnimation>
        );
    }

    return (
        <>
            <Modal
                show={showModalSubmission}
                setShow={setShowModalSubmission}
                child={<FinalWorkModal setShow={setShowModalSubmission} />}
            ></Modal>

            <FinalWorkLayout
                title={currentQuestion.title}
                audio={currentQuestion.audio}
                totalLevel={totalLevel}
                currentLevel={currentLevel}
                increaseLevel={debouncedIncreaseLevel}
                decreaseLevel={debouncedDecreaseLevel}
                currentQuestion={currentQuestion}
                explanation={currentQuestion.type === "explanation"}
                navigationLevel={levels}
                side={side}
                page={actualPageCount}
                questionsLength={questionsLength}
                currentPage={currentPage}
                allPages={allPages}
            >
                {currentQuestion?.explanation?.length > 0 && (
                    <Explanation
                        questionInfo={currentQuestion}
                        className={"final-work-explanation"}
                    />
                )}
                {questionComponent}
            </FinalWorkLayout>
        </>
    );
}

export default QuestionPage;
