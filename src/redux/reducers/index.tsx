import { combineReducers } from 'redux';
import inputReducer from './input-reducer';
import loginReducer from './login-reducer';
import resourceReducer from './resource-reducer';

const rootReducer = combineReducers({
    inputText: inputReducer,
    loginData: loginReducer,
    resource: resourceReducer,
});

export type AppState = ReturnType<typeof rootReducer>;