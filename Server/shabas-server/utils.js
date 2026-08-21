const getQuestionType = (codeType) => {
    switch(codeType){
        case 13:
            return "explanation"
        case 20:
            return "true_false"
        case 21:
            return "multi_choice"
        case 22:
            return "drag_n_drop"
        case 23:
            return "connect_the_dots"
        case 24:
            return "single_choice" 
        case 25:
            return "open_question" 
        default:
            return codeType;
    }
}

module.exports = {getQuestionType}