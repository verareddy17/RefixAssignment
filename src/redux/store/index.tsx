import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { combineReducers } from 'redux';
import resourceReducer from '../reducers/resource-reducer';
import inputReducer from '../../redux/reducers/input-reducer';
import loginReducer from '../../redux/reducers/login-reducer';

const rootReducer = combineReducers({
    resource: resourceReducer,
    inputText: inputReducer,
    loginData: loginReducer,
});

const store = createStore(rootReducer, applyMiddleware(thunk));
console.log('getstate', store.getState());
export default store;