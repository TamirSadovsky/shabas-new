import { act } from "react";

const initialState = {
    1:{ 
        name:"חלוקת תפקידים במשפחה",
    },
    2:{ 
        name:"יום כיף עם חיים כץ",
    },
    3:{ 
        name:"למה ביבי הוא המלך?",
    }
};

function finalReducer(state = initialState, action) {
    switch (action.type) {
        case 'SET_CATEGORY':
            return {
                ...state,
                [action.category]:{
                    ...state[action.category],
                    level: state[action.category].level + 1  
                }
            };
        default:
            return state;
    }
}

export default levelReducer;
