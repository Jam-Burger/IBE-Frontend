export interface PaginationParams {
    page: number;
    pageSize: number;
}

export interface PaginationResponse<T> {
    items: T[];
    total: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}