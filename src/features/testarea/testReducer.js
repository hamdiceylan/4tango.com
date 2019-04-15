import { INCREMENT_COUNTER, DECREMENT_COUNTER } from "./testConstansts";
import { createReducer } from '../../app/common/util/reducerUtil'


const initialState = {
    data: 123
}

export const incremenentCounter = (state,payload) => {
    return { ...state, data: state.data + 1};
}

export const decrementCounter = (state,payload) => {
    return { ...state, data: state.data - 1};
}

export default createReducer(initialState, {
    [INCREMENT_COUNTER]: incremenentCounter,
    [DECREMENT_COUNTER]: decrementCounter
})