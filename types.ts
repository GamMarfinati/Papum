
export interface User {
  name: string;
  pix: string;
  phone: string;
  roommates: number;
  houseId?: string;
  houseName?: string;
  sharePercentage?: number; // % that this specific user should pay
}

export interface Resident {
  name: string;
  sharePercentage: number;
}

export type ExpenseCategory = 'Casa' | 'Mercado' | 'Luz/Água' | 'Internet' | 'Outros' | 'Pagamento';

export interface Expense {
  id: string;
  name: string;
  date: string;
  value: number;
  category: ExpenseCategory;
  paidBy: string;
  sharePercentage?: number; // Custom split for this specific expense
}

export type ViewState = 'loading' | 'auth' | 'registration' | 'dashboard' | 'month_list';

export interface HouseData {
  user: User | null;
  expenses: Expense[];
}
