export interface ApiResponse<T> {
   data: T;
   errors: Error[];
}

export default interface ResponseJson<T> {
    ResponseJSON: T;
    ResponseCode: number;
    ResponseMessage: string;
}
