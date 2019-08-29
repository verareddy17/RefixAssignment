import { SubResourceModel } from './models/resource-model';

async function searchFilter(searchText: string, searchArray: SubResourceModel[], callBack: (filteredArray: SubResourceModel[], isSearch: boolean) => void) {
    if (searchText.length >= 3) {
        callBack([], true);
        let filteredArray = await searchArray.filter((item: { ResourceName: string; }) => {
            let name = item.ResourceName.toUpperCase();
            return name.indexOf(searchText.toUpperCase()) > -1;
        });
        callBack(filteredArray, true);
        return;
    }
    callBack([], false);
}

export default searchFilter;