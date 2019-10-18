import { LOAD_RESOURCE_START, LOAD_RESOURCE_SUCCESS, LOAD_RESOURCE_FAIL } from '../actions/action-types';
import { ResourceModel } from '../../models/resource-model';

const initialState = {
    resources: new ResourceModel(),
    isLoading: false,
    error: '',
};

export interface Action<T> {
    type: string;
    payload: T;
}

const resourceReducer = (state = initialState, action: Action<ResourceModel>) => {
    switch (action.type) {
        case LOAD_RESOURCE_START:
            return {
                ...state,
                isLoading: true,
            };
        case LOAD_RESOURCE_SUCCESS:
            return {
                ...state,
                resources: action.payload,
                isLoading: false,
                error: '',
            };
        case LOAD_RESOURCE_FAIL:
            return {
                ...state,
                isLoading: false,
                error: action.payload,
                // resource: null,
            };
        default:
            return state;
    }
};
export default resourceReducer;