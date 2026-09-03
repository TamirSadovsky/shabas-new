// import { act } from "react";

// const initialState = {
//     1:{ 
//         level:0,
//         name:"המשפחה כמערכת",
//         total:45,
//     },
//     2:{ 
//         level:10,
//         name:"חלוקת תפקידים במשפחה",
//         total:10,
//     },
//     3:{ 
//         level:0,
//         name:"קשרים ויחסים במשפחה",
//         total:8,
//     },
//     4:{ 
//         level:0,
//         name:"תקשורת במשפחה",
//         total:9,
//     },
//     5:{ 
//         level:0,
//         name:"התפתחות ושינוי במשפחה",
//         total:11,
//     }, 
// };

// function levelReducer(state = initialState, action) {
//     switch (action.type) {
//         case 'LOAD_DATA':
//             return {
//                 ...action.data
//             };
//         case 'INCREASE_LEVEL':
//             return {
//                 ...state,
//                 [action.category]:{
//                     ...state[action.category],
//                     level: state[action.category].level + 1  
//                 }
//             };
//         case 'DECREASE_LEVEL':
//             return {
//                 ...state,
//                 [action.category]:{
//                     ...state[action.category],
//                     level: state[action.category].level - 1  
//                 }
//             };
//         default:
//             return state;
//     }
// }

// export default levelReducer;

const initialState = {
    regular: {},
    finalWork: {}
};



function levelReducer(state = initialState, action) {
    switch (action.type) {
        case 'LOAD_DATA':
            return {
                ...state,
                [action.pageType]: {
                    ...action.data,
                    // 1:  { level: 0, name: "המשפחה כמערכת", total: 45 }
                }
            };
        case 'INCREASE_LEVEL':
            return {
                ...state,
                [action.pageType]: {
                    ...state[action.pageType],
                    [action.category]: {
                        ...state[action.pageType][action.category],
                        level: state[action.pageType][action.category].level + 1  
                    }
                }
            };
        case 'DECREASE_LEVEL':
            return {
                ...state,
                [action.pageType]: {
                    ...state[action.pageType],
                    [action.category]: {
                        ...state[action.pageType][action.category],
                        level: state[action.pageType][action.category].level - 1  
                    }
                }
            };
        default:
            return state;
    }
}

export default levelReducer;