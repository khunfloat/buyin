// Player interface
export interface Player {
  name: string;
  balance: number;
}

// Transaction interface
export interface Transaction {
  from: string;
  to: string;
  amount: number;
}
