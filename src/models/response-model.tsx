export interface ApiResponse<T> {
    results: T;
    errors: Error[];
}

export default interface ResponseJson<T> {
    ResponseJSON: T;
    ResponseCode: number;
    ResponseMessage: string;
}
