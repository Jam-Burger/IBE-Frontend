export interface CheckoutField {
  label: string;
  name: string;
  type: 'text' | 'tel' | 'email' | 'select' | 'password' | 'checkbox';
  required: boolean;
  enabled: boolean;
  pattern?: string;
  options?: string[];
}

export interface CheckoutSection {
  title: string;
  id: string;
  enabled: boolean;
  fields: CheckoutField[];
}

export interface CheckoutConfig {
  sections: CheckoutSection[];
}