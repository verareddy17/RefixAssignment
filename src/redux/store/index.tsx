import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { combineReducers } from 'redux';
import resourceReducer from '../reducers/resource-reducer';
import inputReducer from '../../redux/reducers/input-reducer';
import loginReducer from '../../redux/reducers/login-reducer';
import settingReducer from '../../redux/reducers/settings-reducer';
import downloadReducer from '../../redux/reducers/download-reducer';
import downloadedFile from '../../redux/reducers/downloaded-file-reducer'
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-community/async-storage';

const rootReducer = combineReducers({
    resource: resourceReducer,
    inputText: inputReducer,
    loginData: loginReducer,
    settings: settingReducer,
    downloadProgress: downloadReducer,
    downloadedFilesData: downloadedFile,
});
const persistConfig = {
    timeout: 0,
    // Root?
    key: 'root',
    // Storage Method (React Native)
    storage: AsyncStorage,
    // Whitelist (Save Specific Reducers)
    whitelist: ['resourceReducer', 'loginReducer', 'settingReducer', 'downloadedFile'],
};

// Middleware: Redux Persist Persisted Reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = createStore(persistedReducer, applyMiddleware(thunk));
let persistor = persistStore(store);

console.log('getstate', store.getState());
export { store, persistor };