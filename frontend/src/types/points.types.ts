export type ChildPointsData = {
    childId?: number;
    childUserId?: number;
    child_user_id?: number;
    childName?: string;
    child_name?: string;
    pointsBalance?: number;
    points_balance?: number;
    level?: number;
    parentUserId?: number;
    parent_user_id?: number;
  };
  
  export type ChildPointsResponse = {
    success?: boolean;
    wallet?: ChildPointsData;
    data?: ChildPointsData;
    pointsWallet?: ChildPointsData;
    points_balance?: number;
    pointsBalance?: number;
  };
  
  export type PointTransaction = {
    transactionId?: number;
    transaction_id?: number;
    childUserId?: number;
    child_user_id?: number;
    points?: number;
    type?: string;
    reason?: string;
    title?: string;
    amount?: number;
    createdAt?: string;
    created_at?: string;
  };
  
  export type PointTransactionsResponse = {
    success?: boolean;
    transactions: PointTransaction[];
  };
  
  export type SpendPointsPayload = {
    childId: number;
    points: number;
    title?: string;
  };
  
  export type TopUpPointsPayload = {
    childId: number;
    points: number;
  };
  
  export type SpendPointsResponse = {
    success?: boolean;
    message?: string;
    points_balance?: number;
    pointsBalance?: number;
    approval?: any;
    request?: any;
  };
  
  export type TopUpPointsResponse = {
    success?: boolean;
    message?: string;
    points_balance?: number;
    pointsBalance?: number;
  };