import { combineReducers } from 'redux'
import { reducer as FormReducer } from 'redux-form'
import testReducer from '../../features/testarea/testReducer'  
import eventReducer from '../../features/events/eventReducers'

const rootReducers = combineReducers({
    form: FormReducer,
    test: testReducer,
    events: eventReducer
});

export default rootReducers;