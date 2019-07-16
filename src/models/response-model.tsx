export interface ApiResponse<T> {
   Data: T;
   Errors: string[];
   Success: boolean;
   HasError: boolean;
}

export interface Data<T> {
    Data: T;
}
