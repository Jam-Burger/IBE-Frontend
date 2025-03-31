export interface ApiResponse<T> {
    statusCode: string;
    message: string;
    timestamp: Date;
    data: T;
}

export interface ErrorResponse {
    statusCode: string;
    message: string;
    timestamp: Date;
}