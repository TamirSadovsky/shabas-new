const initialState = {
    fullName: "ישראל ישראלי",
    id:1
};

function userReducer(state = initialState, action) {
    switch (action.type) {
        case 'CHANGE_NAME':
            return {
                ...state,
                fullName: action.fullName
            };
        default:
            return state;
    }
}

export default userReducer;
