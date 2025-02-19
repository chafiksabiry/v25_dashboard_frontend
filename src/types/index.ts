export interface StatCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<any>;
  trend?: string;
  trendUp?: boolean;
  detail?: string | null;
}

export interface CompanySettings {
  company_name: string;
  company_logo: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  industry: string;
  description: string;
}