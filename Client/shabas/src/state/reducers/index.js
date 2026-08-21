
import { combineReducers } from '@reduxjs/toolkit';
import levelReducer from './levelReducer';
import pageReducer from './pageReducer';
import { useReducer } from 'react';
import userReducer from './userReducer';
import settingsReducer from './settimgsReducer';

const redcucers = combineReducers({
    level: levelReducer,
    page: pageReducer,
    user: userReducer,
    settings: settingsReducer,
})

export default redcucers;