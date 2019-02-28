import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { combineReducers } from 'redux';
import userReducer from '../reducers/user-reducer';

const rootReducer = combineReducers({
    userData: userReducer
});

const store = createStore(rootReducer, applyMiddleware(thunk));
console.log('getstate', store.getState());
export default store;