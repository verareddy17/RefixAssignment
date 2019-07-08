import { LOAD_USER_SUCCESS, LOAD_USER_START, LOAD_USER_FAILURE } from '../actions/action-types';
import { ActivationAppResponse } from '../../models/login-model';
import { initialState } from '../../models/initial-login-state';
import { Action } from '../../models/generic-action';

export default function loginReducer(state = initialState, action: Action<ActivationAppResponse>) {
    switch (action.type) {
        case LOAD_USER_START:
            return {
                ...state,
                isLoading: true,
            };
        case LOAD_USER_SUCCESS:
            return {
                ...state,
                user: action.payload,
                isLoading: false,
                error: '',
            };
        case LOAD_USER_FAILURE:
            return {
                ...state,
                error: action.payload,
                isLoading: false,
                user: null,
            };
        default:
            return state;
    }
}
