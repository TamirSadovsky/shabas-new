
const initialState = {
    page: 'home',
    id:null
}


function pageReducer(state = initialState, action) {
    console.log(state)
    switch (action.type) {
        case 'PICK_CATEGORY':
            return {
                ...state,
                page: action.page,
                id: action.id
            };
        default:
            return state;
    }
}

export default pageReducer;
