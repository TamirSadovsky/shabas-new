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

        return (
            <div style={{ padding: "40px", fontSize: "22px" }}>
                טוען…
            </div>
        );
    }

    // ---- NOW SAFE TO USE levelState ----
    const levelEntry =
        levelState?.regular?.[pageState.id] ||
        levelState?.finalWork?.[pageState.id] ||
        null;

    const currentLevel = levelEntry?.level ?? 0;
    const levelNode = levelState[pageState.id];
    const totalLevel = levelNode?.total ?? 0;

    // QUESTION indexes
    const questionId = questions
        ? parseInt(Object.keys(questions)[actualPageCount])
        : null;

    const lastKey = questions ? Object.keys(questions).pop() : 0;
    const allPages = questions ? questions[lastKey].pageId : 0;
    const questionsLength = questions ? Object.keys(questions).length : 0;

    const [currentPage, setCurrentPage] = useState(1);


    // ---- FETCH QUESTIONS ----
    useEffect(() => {
        if (pageState.page === "final_work") {
            fetchFinalResults();
        } else {
            fetchQuestions();
        }
    }, [pageState]);

    const fetchQuestions = async () => {
        try {
            const results = await axiosInstance.get(
                `/questions/get_questions_by_bookid/${pageState.id}`
            );
            console.log("questions", results.data);
            setQuestions(results.data);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchFinalResults = async () => {
        try {
            const results = await axiosInstance.get(
                `/questions/final_work_questions/${pageState.id}`
            );
            console.log(results.data);
            setQuestions(results.data);
        } catch (e) {
            console.error(e);
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
        if (actualPageCount + 1 >= questionsLength) return;

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

        setQuestions((prev) => ({
            ...prev,
            [questionId]: {
                ...prev[questionId],
                answer,
                done: true,
            },
        }));

        logServiceInstance.logfinal({
            userId: userState.id,
            categoryId: pageState.id,
            questionId,
            answer,
        });
    };

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
                const completed = Object.values(questions).filter(
                    (q) => q.done || q.answer
                );
                const isFinal = completed.length === nonExplanation.length;

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
                        submitFinalWork={() => submitFinalWork()}
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
