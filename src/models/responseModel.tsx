export interface ApiResponse <T> {
   results: T;
   errors: Error[]
}
