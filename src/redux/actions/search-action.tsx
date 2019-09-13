import { Dispatch } from 'redux';
import { LOAD_SEARCH_FILES } from './action-types';
import { SubResourceModel } from '../../models/resource-model';

export const loadSearchedFiles = (searchArray: SubResourceModel[], isSearch: boolean) => {
    return {
        type: LOAD_SEARCH_FILES,
        searchArray: searchArray,
        isSearch: isSearch,
    };
};

export class SearchFilterArray {
    public searchArray: Array<SubResourceModel> = [];
    public isSearch: boolean = false;
}

export default function searchFilter(text: string, allFiles: SubResourceModel[]): (dispatch: Dispatch) => Promise<void> {
    console.log('text', text);
    return async (dispatch: Dispatch) => {
        if (text.length >= 3) {
            let filteredArray = await allFiles.filter((item: { ResourceName: string; }) => {
                let name = item.ResourceName.toUpperCase();
                return name.indexOf(text.toUpperCase()) > -1;
            });
            console.log('search data', filteredArray);
            dispatch(loadSearchedFiles(filteredArray, true));
            return;
        }
        dispatch(loadSearchedFiles([], false));
    };
}