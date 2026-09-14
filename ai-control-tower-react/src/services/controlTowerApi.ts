import type { CompanyApp, RpcParams } from '../types';
import { getSupabase } from '../lib/supabase';

export interface CostSummaryRow {
  total_cost?: number | string | null;
  total_cost_usd?: number | string | null;
  call_count?: number | string | null;
  total_calls?: number | string | null;
  total_tokens?: number | string | null;
  total_input_tokens?: number | string | null;
  total_output_tokens?: number | string | null;
  priced_calls?: number | string | null;
  unpriced_call_count?: number | string | null;
  unpriced_calls?: number | string | null;
  null_token_calls?: number | string | null;
  model_variance_calls?: number | string | null;
  failed_calls?: number | string | null;
  failed_cost?: number | string | null;
  [key: string]: unknown;
}

export interface GroupedCostRow {
  group_key1?: string | null;
  group_key2?: string | null;
  label?: string | null;
  key?: string | null;
  feature?: string | null;
  model?: string | null;
  cost?: number | string | null;
  total_cost_usd?: number | string | null;
  cost_usd?: number | string | null;
  [key: string]: unknown;
}

export interface AgentCostRow extends GroupedCostRow {
  agent?: string | null;
  agent_name?: string | null;
  caller?: string | null;
  call_count?: number | string | null;
}

export interface OutcomeRow {
  id?: string | null;
  outcome_id?: string | null;
  outcome_type_id?: string | null;
  name?: string | null;
  outcome_name?: string | null;
  status?: string | null;
  is_abandoned?: boolean | null;
  [key: string]: unknown;
}

export interface OutcomeTypeRow {
  outcome_type_id?: string | null;
  id?: string | null;
  name?: string | null;
  canvas?: string | null;
  [key: string]: unknown;
}

export interface TopCallRow {
  partition_key?: string | null;
  caller?: string | null;
  calculated_cost?: number | string | null;
  cost?: number | string | null;
  [key: string]: unknown;
}

export interface CostEventRow {
  usage_event_id?: string | null;
  event_id?: string | null;
  trace_id?: string | null;
  request_started_at?: string | null;
  caller?: string | null;
  provider?: string | null;
  resolved_model?: string | null;
  model?: string | null;
  input_tokens?: number | string | null;
  output_tokens?: number | string | null;
  calculated_cost?: number | string | null;
  cost?: number | string | null;
  status?: string | null;
  failure_phase?: string | null;
  total_row_count?: number | string | null;
  [key: string]: unknown;
}

export interface TraceDetailRow {
  trace_id?: string | null;
  client_trace_id?: string | null;
  usage_event_id?: string | null;
  agent_name?: string | null;
  trace_started_at?: string | null;
  trace_completed_at?: string | null;
  outcome_id?: string | null;
  sequence_order?: number | string | null;
  span_type?: string | null;
  tool_name?: string | null;
  span_status?: string | null;
  span_duration_ms?: number | string | null;
  calculated_cost?: number | string | null;
  request_bytes?: number | string | null;
  response_bytes?: number | string | null;
  [key: string]: unknown;
}

export interface TracePayloadRow {
  payload_id?: string | null;
  request_payload?: unknown;
  response_payload?: unknown;
  [key: string]: unknown;
}

export interface BudgetRow {
  budget_id?: string | null;
  amount?: number | string | null;
  currency?: string | null;
  warn_threshold_pct?: number | string | null;
  escalate_threshold_pct?: number | string | null;
  enforcement_mode?: string | null;
  action_on_breach?: string | null;
  [key: string]: unknown;
}

export interface AlertRow {
  alert_id?: string | null;
  threshold_type?: string | null;
  threshold_pct?: number | string | null;
  status?: string | null;
  created_at?: string | null;
  acknowledged_at?: string | null;
  [key: string]: unknown;
}

export interface OpportunityRow {
  type?: number | string | null;
  title?: string | null;
  feature?: string | null;
  savings?: number | string | null;
  estimated_savings?: number | string | null;
  [key: string]: unknown;
}

export async function listCompanyApps(companyId: string): Promise<CompanyApp[]> {
  const { data, error } = await getSupabase().rpc('mt_company_apps_list', { p_company_id: companyId });
  if (error) throw error;
  return (data ?? []).map((app: { app_id?: string; name?: string; app_name?: string; supports_enforcement?: boolean }) => ({
    app_id: String(app.app_id ?? ''),
    app_name: app.app_name ?? app.name ?? 'Unnamed app',
    supports_enforcement: Boolean(app.supports_enforcement),
  }));
}

export async function rpc<T>(name: string, params: Record<string, unknown>): Promise<T[]> {
  const { data, error } = await getSupabase().rpc(name, params);
  if (error) throw error;
  return (data ?? []) as T[];
}

export async function getCostSummary(params: RpcParams): Promise<CostSummaryRow[]> {
  return rpc<CostSummaryRow>('mt_ai_cost_summary', {
    p_company_id: params.companyId, p_app_id: params.appId,
    p_period_start: params.periodStart, p_period_end: params.periodEnd,
  });
}

export async function getGroupedCost(params: RpcParams, groupBy: string): Promise<GroupedCostRow[]> {
  return rpc<GroupedCostRow>('mt_ai_cost_grouped', {
    p_company_id: params.companyId, p_app_id: params.appId,
    p_period_start: params.periodStart, p_period_end: params.periodEnd, p_group_by: groupBy,
  });
}

export async function getCostByAgent(params: RpcParams): Promise<AgentCostRow[]> {
  return rpc<AgentCostRow>('mt_ai_cost_by_agent', {
    p_company_id: params.companyId, p_app_id: params.appId,
    p_period_start: params.periodStart, p_period_end: params.periodEnd,
  });
}

export async function getBudget(params: RpcParams): Promise<BudgetRow | null> {
  const { data, error } = await getSupabase().rpc('mt_ai_budget_get_active', { p_company_id: params.companyId, p_app_id: params.appId });
  if (error) throw error;
  return (data ?? null) as BudgetRow | null;
}

export async function getAlerts(params: RpcParams): Promise<AlertRow[]> {
  return rpc<AlertRow>('mt_ai_alerts_list', { p_company_id: params.companyId, p_app_id: params.appId });
}

export async function getOpportunities(params: RpcParams): Promise<OpportunityRow[]> {
  return rpc<OpportunityRow>('mt_ai_cost_opportunities', {
    p_company_id: params.companyId, p_app_id: params.appId,
    p_period_start: params.periodStart, p_period_end: params.periodEnd,
  });
}

export async function upsertBudget(params: RpcParams, input: { amount: number; warnThresholdPct: number; escalateThresholdPct: number; actionOnBreach: string }): Promise<BudgetRow | null> {
  const { data, error } = await getSupabase().rpc('mt_ai_budget_upsert', {
    p_company_id: params.companyId, p_app_id: params.appId, p_amount: input.amount, p_currency: 'USD',
    p_warn_threshold_pct: input.warnThresholdPct, p_escalate_threshold_pct: input.escalateThresholdPct,
    p_enforcement_mode: 'monitor', p_action_on_breach: input.actionOnBreach,
  });
  if (error) throw error;
  return (data ?? null) as BudgetRow | null;
}

export async function acknowledgeAlert(alertId: string): Promise<AlertRow | null> {
  const { data, error } = await getSupabase().rpc('mt_ai_alert_acknowledge', { p_alert_id: alertId });
  if (error) throw error;
  return (data ?? null) as AlertRow | null;
}

export async function dismissAlert(alertId: string): Promise<AlertRow | null> {
  const { data, error } = await getSupabase().rpc('mt_ai_alert_dismiss', { p_alert_id: alertId });
  if (error) throw error;
  return (data ?? null) as AlertRow | null;
}

export async function getOpportunitySupportingCalls(params: RpcParams, feature: string, limit = 5): Promise<Record<string, unknown>[]> {
  return rpc<Record<string, unknown>>('mt_ai_cost_opportunity_supporting_calls', {
    p_company_id: params.companyId, p_app_id: params.appId,
    p_period_start: params.periodStart, p_period_end: params.periodEnd, p_feature: feature, p_limit: limit,
  });
}

export async function getTopCalls(params: RpcParams, orderBy: string, limit: number, partitionBy?: string): Promise<TopCallRow[]> {
  return rpc<TopCallRow>('mt_ai_cost_top_calls', {
    p_company_id: params.companyId, p_app_id: params.appId,
    p_period_start: params.periodStart, p_period_end: params.periodEnd,
    p_order_by: orderBy, p_limit: limit, p_partition_by: partitionBy ?? null,
  });
}

export async function getCostEvents(params: RpcParams, limit = 50, offset = 0): Promise<{ rows: CostEventRow[]; totalCount: number }> {
  const { data, error } = await getSupabase().rpc('mt_ai_cost_events_list', {
    p_company_id: params.companyId, p_app_id: params.appId,
    p_period_start: params.periodStart, p_period_end: params.periodEnd,
    p_limit: limit, p_offset: offset,
  });
  if (error) throw error;
  const rows = (data ?? []) as CostEventRow[];
  return { rows, totalCount: rows[0]?.total_row_count == null ? rows.length : Number(rows[0].total_row_count) };
}

export async function getTraceDetails(params: RpcParams): Promise<TraceDetailRow[]> {
  return rpc<TraceDetailRow>('mt_ai_trace_detail_list', {
    p_company_id: params.companyId, p_app_id: params.appId,
    p_period_start: params.periodStart, p_period_end: params.periodEnd,
  });
}

export async function getTracePayload(params: RpcParams, usageEventId: string): Promise<TracePayloadRow[]> {
  return rpc<TracePayloadRow>('mt_ai_trace_payload_get', {
    p_company_id: params.companyId, p_app_id: params.appId, p_usage_event_id: usageEventId,
  });
}

export async function getOutcomeTypes(appId: string): Promise<OutcomeTypeRow[]> {
  return rpc<OutcomeTypeRow>('mt_outcome_types_list', { p_app_id: appId });
}

export async function getOutcomes(params: RpcParams): Promise<OutcomeRow[]> {
  return rpc<OutcomeRow>('mt_outcomes_list', {
    p_company_id: params.companyId, p_app_id: params.appId,
    p_period_start: params.periodStart, p_period_end: params.periodEnd,
  });
}
