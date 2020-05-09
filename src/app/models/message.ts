export interface Message {
    id: number;
    payload: string;
    conversationId: number;
    created: Date;
    modified: Date;
    awsId: string;
    to: string;
    from: string;
    origin: number;                
}