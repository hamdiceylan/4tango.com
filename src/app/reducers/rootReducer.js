import { combineReducers } from 'redux'
import testReducer from '../../features/testarea/testReducer'  
import eventReducer from '../../features/events/eventReducers'

const rootReducers = combineReducers({
    test: testReducer,
    events: eventReducer
});

export default rootReducers;