import { useDispatch, useSelector } from "react-redux";
import LayoutWithoutAnimation from "../Layouts/LayoutWithoutAnimation/LayoutWithoutAnimation";
import FinalWorkForm from "../../componenets/FinalWorkForm/FinalWorkForm";



function FinalWorkAnswerPage() {
    const levelState = useSelector(state => state.level);
    const pageState = useSelector(state => state.page);

    return (
        <LayoutWithoutAnimation
            title={currentQuestion.title}
            subTitle={currentQuestion.subTitle}
        >
            <FinalWorkForm></FinalWorkForm>
        </LayoutWithoutAnimation>
    );
}

export default FinalWorkAnswerPage;