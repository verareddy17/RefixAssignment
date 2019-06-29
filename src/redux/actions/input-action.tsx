import { INPUT_TEXT, RESET } from '../actions/action-types';
import { ActionPayload } from '../../models/action-payload';
export default function onchangeText<T>(pin: string): ActionPayload<string> {
    return {
        type: INPUT_TEXT,
        payload: pin,
    };
}

export function ResetInputText() {
    return {
        type: RESET,
    };
}

