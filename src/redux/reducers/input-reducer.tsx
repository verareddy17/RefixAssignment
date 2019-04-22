
import { INPUT_TEXT } from '../actions/action-types';
import { initialState } from '../../models/initial-input-pin';
import { Action } from '../../models/generic-action';

export default function inputReducer(state = initialState, action: Action<string>) {
    switch (action.type) {
        case INPUT_TEXT:
            return {
                ...state,
                pin: action.payload,
            };
        default:
            return state;
    }
}

