/**
 * Cuenta bancaria tal como la expone el Vault (mock y real).
 * El esquema es fiel a Thought Machine Core API.
 */
export interface Account {
  id: string;
  product_id: string;
  product_version_id: string;
  status: AccountStatus;
  stakeholder_ids: string[];
  permitted_denominations: string[];
  instance_param_vals: Record<string, string>;
}

export type AccountStatus =
  | 'ACCOUNT_STATUS_PENDING'
  | 'ACCOUNT_STATUS_OPEN'
  | 'ACCOUNT_STATUS_CLOSED';

/**
 * Respuesta paginada de GET /v1/accounts.
 */
export interface ListAccountsResponse {
  accounts: Account[];
  total: number;
}