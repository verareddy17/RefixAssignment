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
            };
        case LOAD_USER_FAILURE:
            return {
                ...state,
                error: 'Unkonwn error occured',
                isLoading: false,
            };
        default:
            return state;
    }
}
