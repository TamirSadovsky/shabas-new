
const initialState = {
    volume: 1,
    brightness: 1,
    audioPlaying: null
};

function settingsReducer(state = initialState, action) {
    switch (action.type) {
        case 'CHANGE_SETTING':
            return {
                ...state,
                [action.selector]:action.value
            };
        default:
            return state;
    }
}

export default settingsReducer;
