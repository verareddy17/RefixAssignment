export interface ApiResponse<T> {
   Data: T;
   Errors: string[];
   Success: boolean;
   HasError: boolean;
}

export default interface Data<T> {
    Data: T;
}
