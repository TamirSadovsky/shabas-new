
const initialState = {
    page: 'home',
    id: null,
    bookId: null,
    bookName: null,
    bookImage: null
}


function pageReducer(state = initialState, action) {
    console.log(state)
    switch (action.type) {
        case 'PICK_BOOK':
            return {
                ...state,
                page: 'welcome',
                id: null,
                bookId: action.bookId,
                bookName: action.bookName,
                bookImage: action.bookImage || null
            };
        case 'PICK_CATEGORY':
            if (action.page === 'home') {
                return {
                    ...initialState
                };
            }

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
