export interface ApiResponse<T> {
   Data: T;
   Errors: string[];
   Success: boolean;
   HasError: boolean;
}

export interface Data<T> {
    Data: T;
}


export interface ResponseModel {
    isLoading: boolean;
    Errors?: string[];
    Data: any;
}