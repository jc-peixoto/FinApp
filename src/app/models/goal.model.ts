export interface Goal {
  id: number;
  title: string;
  description: string;
  target: number;
  current: number;
  image?: string;
  createdAt: string;
}

export interface GoalForm {
  title: string;
  description: string;
  target: number;
  image?: File;
}

export interface AddMoneyForm {
  amount: number;
}
