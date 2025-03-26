export enum StateStatus {
    IDLE = 'IDLE',
    LOADING = 'LOADING',
    ERROR = 'ERROR'
}

export interface BaseState {
    status: StateStatus;
    error: string | null;
} 