export type Role = 'admin' | 'member' | 'readonly';
export type NavKey = 'command' | 'outcomes' | 'cost' | 'traces' | 'governance';

export interface CompanyMembership {
  company_id: string;
  role: Role;
  is_active: boolean;
  mt_companies?: { name?: string } | null;
}

export interface CompanyApp {
  app_id: string;
  app_name: string;
  supports_enforcement?: boolean;
}

export interface MetricRow {
  label: string;
  value: string;
  detail: string;
  tone?: 'purple' | 'blue' | 'green' | 'amber' | 'red';
}

export interface RpcParams {
  companyId: string;
  appId: string;
  periodStart: string;
  periodEnd: string;
}
