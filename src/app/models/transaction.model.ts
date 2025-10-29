export interface Transaction {
  id: number;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  category: string;
  date: string;
  createdAt: string;
}

export interface TransactionForm {
  description: string;
  amount: number;
  category: string;
  date: string;
}

export const CATEGORIES = {
  salary: 'Salário',
  freelance: 'Freelance',
  investment: 'Investimento',
  food: 'Alimentação',
  transport: 'Transporte',
  housing: 'Moradia',
  entertainment: 'Entretenimento',
  health: 'Saúde',
  education: 'Educação',
  other: 'Outros'
};
