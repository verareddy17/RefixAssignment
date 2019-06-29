
import { INPUT_TEXT, RESET } from '../actions/action-types';
import { initialState } from '../../models/initial-input-pin';
import { Action } from '../../models/generic-action';

export default function inputReducer(state = initialState, action: Action<string>) {
    switch (action.type) {
        case INPUT_TEXT:
            return {
                ...state,
                pin: action.payload,
            };
        case RESET:
            return initialState;
        default:
            return state;
    }
}

