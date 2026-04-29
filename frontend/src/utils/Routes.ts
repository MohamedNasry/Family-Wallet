export const API_BASE_URL = 'https://api.familywallet.app/v1';

export const ROUTES = {
  // Auth
  LOGIN: 'Login',
  REGISTER: 'Register',
  JOIN_WITH_INVITE: 'JoinWithInvite',

  // Main tabs
  DASHBOARD: 'Dashboard',
  MEMBERS: 'Members',
  MY_FAMILY: 'MyFamily',
  BILLS: 'Bills',
  CATEGORIES: 'Categories',
  POINTS_WALLET: 'PointsWallet',
  PARENTAL_CONTROL: 'ParentalControl',

  // Bills stack
  ADD_BILL: 'AddBill',
  SCAN_BILL: 'ScanBill',
  OCR_REVIEW: 'OcrReview',
  BILL_DETAILS: 'BillDetails',
  SPLIT_BILL: 'SplitBill',
} as const;

export type RouteNames = typeof ROUTES[keyof typeof ROUTES];