import { LOAD_SETTINGS_START, LOAD_SETTINGS_SUCCESS, LOAD_SETTINGS_FAIL } from '../actions/action-types';
import { CustomizeSettings } from '../../models/custom-settings';
import { Action } from '../../models/generic-action';
import { initialState } from '../../models/initial-settings-state';

export default function settingReducer(state = initialState, action: Action<CustomizeSettings>) {
    switch (action.type) {
        case LOAD_SETTINGS_START:
            return {
                ...state,
                isLoading: true,
            };
        case LOAD_SETTINGS_SUCCESS:
            return {
                ...state,
                settings: action.payload,
                isLoading: false,
                error: '',
            };
        case LOAD_SETTINGS_FAIL:
            return {
                ...state,
                error: action.payload,
                isLoading: false,
                settings: null,
            };
        default:
            return state;
    }
}
