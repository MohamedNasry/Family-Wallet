export interface ArabCurrencyInfo {
  code: string;
  symbol: string;
  nameEn: string;
  nameAr: string;
  decimals: number;
  country: string;
}

export const ARAB_CURRENCIES: Record<string, ArabCurrencyInfo> = {
  SAR: { code: 'SAR', symbol: 'ر.س', nameEn: 'Saudi Riyal', nameAr: 'ريال سعودي', decimals: 2, country: 'Saudi Arabia' },
  AED: { code: 'AED', symbol: 'د.إ', nameEn: 'UAE Dirham', nameAr: 'درهم إماراتي', decimals: 2, country: 'UAE' },
  KWD: { code: 'KWD', symbol: 'د.ك', nameEn: 'Kuwaiti Dinar', nameAr: 'دينار كويتي', decimals: 3, country: 'Kuwait' },
  BHD: { code: 'BHD', symbol: 'د.ب', nameEn: 'Bahraini Dinar', nameAr: 'دينار بحريني', decimals: 3, country: 'Bahrain' },
  QAR: { code: 'QAR', symbol: 'ر.ق', nameEn: 'Qatari Riyal', nameAr: 'ريال قطري', decimals: 2, country: 'Qatar' },
  OMR: { code: 'OMR', symbol: 'ر.ع', nameEn: 'Omani Rial', nameAr: 'ريال عماني', decimals: 3, country: 'Oman' },
  JOD: { code: 'JOD', symbol: 'د.أ', nameEn: 'Jordanian Dinar', nameAr: 'دينار أردني', decimals: 3, country: 'Jordan' },
  EGP: { code: 'EGP', symbol: 'ج.م', nameEn: 'Egyptian Pound', nameAr: 'جنيه مصري', decimals: 2, country: 'Egypt' },
  LBP: { code: 'LBP', symbol: 'ل.ل', nameEn: 'Lebanese Pound', nameAr: 'ليرة لبنانية', decimals: 2, country: 'Lebanon' },
  MAD: { code: 'MAD', symbol: 'د.م', nameEn: 'Moroccan Dirham', nameAr: 'درهم مغربي', decimals: 2, country: 'Morocco' },
  TND: { code: 'TND', symbol: 'د.ت', nameEn: 'Tunisian Dinar', nameAr: 'دينار تونسي', decimals: 3, country: 'Tunisia' },
  DZD: { code: 'DZD', symbol: 'د.ج', nameEn: 'Algerian Dinar', nameAr: 'دينار جزائري', decimals: 2, country: 'Algeria' },
  IQD: { code: 'IQD', symbol: 'ع.د', nameEn: 'Iraqi Dinar', nameAr: 'دينار عراقي', decimals: 3, country: 'Iraq' },
  SYP: { code: 'SYP', symbol: 'ل.س', nameEn: 'Syrian Pound', nameAr: 'ليرة سورية', decimals: 2, country: 'Syria' },
  YER: { code: 'YER', symbol: 'ر.ي', nameEn: 'Yemeni Rial', nameAr: 'ريال يمني', decimals: 2, country: 'Yemen' },
  LYD: { code: 'LYD', symbol: 'ل.د', nameEn: 'Libyan Dinar', nameAr: 'دينار ليبي', decimals: 3, country: 'Libya' },
  SDG: { code: 'SDG', symbol: 'ج.س', nameEn: 'Sudanese Pound', nameAr: 'جنيه سوداني', decimals: 2, country: 'Sudan' },
  MRU: { code: 'MRU', symbol: 'أ.م', nameEn: 'Mauritanian Ouguiya', nameAr: 'أوقية موريتانية', decimals: 2, country: 'Mauritania' },
  SOS: { code: 'SOS', symbol: 'Sh.So', nameEn: 'Somali Shilling', nameAr: 'شلن صومالي', decimals: 2, country: 'Somalia' },
  DJF: { code: 'DJF', symbol: 'Fdj', nameEn: 'Djiboutian Franc', nameAr: 'فرنك جيبوتي', decimals: 0, country: 'Djibouti' },
  KMF: { code: 'KMF', symbol: 'FC', nameEn: 'Comorian Franc', nameAr: 'فرنك قمري', decimals: 0, country: 'Comoros' },
};

export function getArabCurrencyList(): ArabCurrencyInfo[] {
  return Object.values(ARAB_CURRENCIES);
}