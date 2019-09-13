import { SubResourceModel } from '../../models/resource-model';
import { LOAD_SEARCH_FILES } from '../actions/action-types';

const initialState = {
    searchArray: [],
    isSearch: false,
};

export default function searchReducer(state = initialState, action: { type: string, searchArray: SubResourceModel[], isSearch: boolean }) {
    switch (action.type) {
        case LOAD_SEARCH_FILES:
            return {
                ...state,
                searchArray: action.searchArray,
                isSearch: action.isSearch,
            };
        default:
            return state;
    }
}