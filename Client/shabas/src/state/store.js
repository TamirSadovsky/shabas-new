import { configureStore } from "@reduxjs/toolkit";
import redcucers from "./reducers";
// import redcucers from "./reducers";

export default configureStore({
    reducer:redcucers
})