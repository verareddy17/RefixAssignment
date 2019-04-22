import { INPUT_TEXT } from '../actions/action-types';
import { ActionPayload } from '../../models/action-payload';

export default function onchangeText<T>(pin: string): ActionPayload<string> {
    return {
        type: INPUT_TEXT,
        payload: pin,
    };
}

