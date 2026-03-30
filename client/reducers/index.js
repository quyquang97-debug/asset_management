import {combineReducers} from 'redux';
import {connectRouter} from 'connected-react-router';
import {reducer as formReducer} from 'redux-form';

// Import custom components
import authReducer from './authReducer';
import repairRequestReducer from './repairRequestReducer';

const appReducer = (history) => combineReducers({
    router: connectRouter(history),
    form: formReducer,  // ← redux-form
    auth: authReducer,
    repairRequest: repairRequestReducer,
});

const rootReducer = (state, action) => {

    if (action === 'LOG_OUT_SUCCESS') {
        state = undefined;
    }

    return appReducer(state, action);
};

export default rootReducer;