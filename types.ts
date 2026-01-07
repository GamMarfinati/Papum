
export interface User {
  name: string;
  pix: string;
  phone: string;
  roommates: number;
}

export type ExpenseCategory = 'Aluguel' | 'Mercado' | 'Luz/Água' | 'Internet' | 'Outros';

export interface Expense {
  id: string;
  name: string;
  date: string;
  value: number;
  category: ExpenseCategory;
  paidBy: string;
}

export type ViewState = 'registration' | 'dashboard' | 'month_list';

export interface HouseData {
  user: User | null;
  expenses: Expense[];
}
