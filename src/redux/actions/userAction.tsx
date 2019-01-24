import { LOAD_USER_SUCCESS, LOAD_USER_START } from './actionTypes';
import { ApiResponse } from '../../models/responseModel';
import { string } from 'prop-types';


export const loadUserRequest = () => {
    return {
        type: LOAD_USER_START,
    }    
}
export const loadUserSuccess = (data: object) => {
    return {
        type: LOAD_USER_SUCCESS,
        payload: data
    }    
}

export class UserModel {
    gender: string = '';
    email:string = '';
}

export class User {
    user = new UserModel();
    isLoading: boolean= false;
}
export const fetchPeople = () => {
    return async (dispatch: any) => {
        dispatch(loadUserRequest())
        try {
          let response = await  fetch('https://randomuser.me/api/?results=15');
          let json = await response.json() as ApiResponse<User[]>;
          console.log(json.results)
          dispatch(loadUserSuccess(json.results[0]));
        // dispatch(getUser('new data'))
        }
        catch(err){
            
        }
       
    }
}

// export class httpService {
//     get<T>(url: string, params: Map<string, string>): ApiRespone<T> {
//         var response = await fetch(url, params);
//         return response.json() as ApiRepone<T>;
//     }
// }