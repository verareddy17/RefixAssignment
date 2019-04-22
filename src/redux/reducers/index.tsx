import { combineReducers } from 'redux';
import inputReducer from './input-reducer';
import loginReducer from './login-reducer';
const rootReducer = combineReducers({
    inputText: inputReducer,
    loginData: loginReducer,
});

// export default rootReducer;
export type AppState = ReturnType<typeof rootReducer>;