import { LOAD_USER_SUCCESS, LOAD_USER_START, LOAD_USER_FAILURE } from '../actions/action-types';
import { CustomizeSettings } from '../../models/custom-settings';
import { Action } from '../../models/generic-action';
import { initialState } from '../../models/initial-settings-state';

export default function settingReducer(state = initialState, action: Action<CustomizeSettings>) {
    switch (action.type) {
        case LOAD_USER_START:
            return {
                ...state,
                isLoading: true,
            };
        case LOAD_USER_SUCCESS:
            return {
                ...state,
                settings: action.payload,
                isLoading: false,
                error: '',
            };
        case LOAD_USER_FAILURE:
            return {
                ...state,
                error: action.payload,
                isLoading: false,
            };
        default:
            return state;
    }
}
