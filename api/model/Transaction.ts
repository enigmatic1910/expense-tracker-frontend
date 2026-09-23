export interface Transaction {
    transactionId: string;
    transactionType : string;
    description : string;
    amount : number;
    transactionDate : string;
    transferId : string | null;
    paymentModeId : number | null;
    categoryId : number | null;
    cardId?: string | null;
    cardType?: string | null;
    cardLastFourDigits?: string | null;
}
