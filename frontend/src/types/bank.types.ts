export type BankAccount = {
    bankAccountId: number;
    userId: number;
    bankName: string;
    cardNumber?: string;
    maskedCardNumber?: string;
    isDefault: boolean;
    balance: number | string;
  };
  
  export type BankAccountsResponse = {
    success: boolean;
    accounts: BankAccount[];
  };
  
  export type CreateBankAccountPayload = {
    bankName: string;
    cardNumber: string;
    balance: number;
    isDefault: boolean;
  };
  
  export type CreateBankAccountResponse = {
    success: boolean;
    message: string;
    account: BankAccount;
  };
  
  export type ChargePayload = {
    bankAccountID: number;
    billID: number;
    cost: number;
    splitID?: number | null;
  };
  
  export type RefundPayload = {
    bankAccountID: number;
    billID: number;
    cost: number;
    splitID?: number | null;
  };
  
  export type BankOperationResponse = {
    success: boolean;
    message: string;
    account?: BankAccount;
    balance?: number | string;
  };