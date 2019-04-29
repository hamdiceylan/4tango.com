import { combineReducers } from 'redux'
import { reducer as FormReducer } from 'redux-form'
import testReducer from '../../features/testarea/testReducer'  
import eventReducer from '../../features/events/eventReducers'
import modalsReducer from '../../features/modals/modalReducer'
import authReducers from '../../features/auth/authReducer'
import asyncReducers from '../../features/async/asyncReducer'
import { reducer as toastrReducer } from 'react-redux-toastr'
import { firebaseReducer } from 'react-redux-firebase'
import { firestoreReducer } from 'redux-firestore'

const rootReducers = combineReducers({
    firebase: firebaseReducer,
    firestore: firestoreReducer,
    form: FormReducer,
    test: testReducer,
    events: eventReducer,
    modals: modalsReducer,
    auth: authReducers,
    async: asyncReducers,
    toastr: toastrReducer
});

export default rootReducers;