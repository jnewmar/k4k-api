export interface CalculatorConfig {
    id: string;
    initialPrice: number;
    minumumPrice: number;
    k4kPhiDefault: number;
    pricePerTime: number;
    pricePerDistance: number;
    rushTaxTable: {};
    recursionDiscountTable: {};
    perSharingDiscountTable: {};
    driverTaxTable: {};
    perMonthTable: {};
    k4kPhiPerCity: {};
    Cities: {};
    k4kPhiPerKidAge: {};
}
