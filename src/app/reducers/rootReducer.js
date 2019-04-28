import { combineReducers } from 'redux'
import { reducer as FormReducer } from 'redux-form'
import testReducer from '../../features/testarea/testReducer'  
import eventReducer from '../../features/events/eventReducers'
import modalsReducer from '../../features/modals/modalReducer'
import authReducers from '../../features/auth/authReducer'
import asyncReducers from '../../features/async/asyncReducer'

const rootReducers = combineReducers({
    form: FormReducer,
    test: testReducer,
    events: eventReducer,
    modals: modalsReducer,
    auth: authReducers,
    async: asyncReducers
});

export default rootReducers;