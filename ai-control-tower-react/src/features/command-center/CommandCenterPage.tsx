import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ArrowUpRight, CircleDollarSign } from 'lucide-react';
import { getAlerts, getBudget, getCostByAgent, getCostSummary, getGroupedCost, getOpportunities } from '../../services/controlTowerApi';
import type { CostSummaryRow } from '../../services/controlTowerApi';
import type { RpcParams } from '../../types';
import { compactNumber, money } from '../../lib/utils';
import { Badge, Button, Card, EmptyState, SectionTitle } from '../../components/ui';
import { MetricCard } from '../../components/common/MetricCard';

function numeric(row: Record<string, unknown> | undefined, ...keys: string[]) {
  for (const key of keys) {
    const value = row?.[key];
    if (value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value))) return Number(value);
  }
  return undefined;
}

function summaryValue(row: CostSummaryRow, ...keys: string[]) { return numeric(row as Record<string, unknown>, ...keys); }
function rowLabel(row: Record<string, unknown>) { return String(row.label ?? row.group_key1 ?? row.feature ?? row.name ?? row.key ?? 'Unlabelled'); }
function rowCost(row: Record<string, unknown>) { return numeric(row, 'total_cost_usd', 'cost_usd', 'cost', 'calculated_cost'); }
function sumCosts(rows: Array<Record<string, unknown>>) { if (!rows.length) return 0; const costs = rows.map(rowCost); return costs.every((value) => value !== undefined) ? costs.reduce((total, value) => total + (value ?? 0), 0) : undefined; }

function QueryState({ isLoading, error, empty, children }: { isLoading: boolean; error: unknown; empty: boolean; children: React.ReactNode }) {
  if (isLoading) return <EmptyState>Loading live data...</EmptyState>;
  if (error) return <EmptyState>Live data could not be loaded for this period.</EmptyState>;
  if (empty) return <EmptyState>No live data is available for this app and period.</EmptyState>;
  return <>{children}</>;
}

export function CommandCenterPage({ params, onOpen, canViewGovernance }: { params: RpcParams; onOpen: (title: string) => void; canViewGovernance: boolean }) {
  const queryContext = [params.companyId, params.appId, params.periodStart, params.periodEnd];
  const summary = useQuery({ queryKey: ['command-center', 'summary', ...queryContext], queryFn: () => getCostSummary(params) });
  const grouped = useQuery({ queryKey: ['command-center', 'grouped', ...queryContext, 'feature'], queryFn: () => getGroupedCost(params, 'feature') });
  const outcomeGrouped = useQuery({ queryKey: ['command-center', 'grouped', ...queryContext, 'outcome_type'], queryFn: () => getGroupedCost(params, 'outcome_type') });
  const agents = useQuery({ queryKey: ['command-center', 'agents', ...queryContext], queryFn: () => getCostByAgent(params) });
  const budget = useQuery({ queryKey: ['command-center', 'budget', params.companyId, params.appId], queryFn: () => getBudget(params) });
  const alerts = useQuery({ queryKey: ['command-center', 'alerts', params.companyId, params.appId], enabled: canViewGovernance, queryFn: () => getAlerts(params) });
  const opportunities = useQuery({ queryKey: ['command-center', 'opportunities', ...queryContext], queryFn: () => getOpportunities(params) });

  const row = summary.data?.[0] ?? {};
  const totalSpend = summaryValue(row, 'total_cost', 'total_cost_usd');
  const callCount = summaryValue(row, 'total_calls', 'call_count');
  const totalTokens = summaryValue(row, 'total_input_tokens') !== undefined || summaryValue(row, 'total_output_tokens') !== undefined
    ? (summaryValue(row, 'total_input_tokens') ?? 0) + (summaryValue(row, 'total_output_tokens') ?? 0)
    : summaryValue(row, 'total_tokens');
  const averageCost = totalSpend !== undefined && callCount !== undefined && callCount > 0 ? totalSpend / callCount : undefined;
  const pricedCalls = summaryValue(row, 'priced_calls');
  const pricingMatch = pricedCalls !== undefined && callCount !== undefined && callCount > 0 ? (pricedCalls / callCount) * 100 : undefined;
  const unpricedCalls = summaryValue(row, 'unpriced_calls', 'unpriced_call_count');
  const outcomeSpend = outcomeGrouped.isLoading || outcomeGrouped.error ? undefined : sumCosts(outcomeGrouped.data ?? []);
  const unattributedSpend = totalSpend !== undefined && outcomeSpend !== undefined ? totalSpend - outcomeSpend : undefined;

  return <><div className="page-intro"><div><Badge className="bg-purpleP text-purple">Outcome-first overview</Badge><p>Observe spend, outcome attribution, traceability, and governance signals in one operating view.</p></div><Button onClick={() => onOpen('Needs attention')}><AlertTriangle size={14} />Review signals</Button></div><div className="metric-grid five"><MetricCard label="AI spend" value={money(totalSpend)} detail={summary.isLoading ? 'Loading summary...' : 'Current period'} /><MetricCard label="AI calls" value={compactNumber(callCount)} detail="Across producer apps" tone="blue" /><MetricCard label="Tokens" value={compactNumber(totalTokens)} detail="Input and output" tone="green" /><MetricCard label="Average cost / call" value={money(averageCost)} detail="Total spend / total calls" tone="purple" /><MetricCard label="Pricing trust" value={pricingMatch === undefined ? '—' : `${pricingMatch.toFixed(1)}%`} detail="Priced calls / total calls" tone="red" /></div><div className="metric-grid four"><MetricCard label="Unpriced calls" value={compactNumber(unpricedCalls)} detail="Direct summary value" tone="amber" /><MetricCard label="Outcome-attributed spend" value={money(outcomeSpend)} detail="Outcome-type grouping" tone="green" /><MetricCard label="Outcome-unattributed spend" value={money(unattributedSpend)} detail="Total less attributed" tone="amber" /><MetricCard label="Active alerts" value={canViewGovernance ? compactNumber(alerts.data?.length) : '—'} detail={canViewGovernance ? 'Governance alerts' : 'Restricted for readonly users'} tone="red" /></div><div className="two-column"><Card className="panel"><SectionTitle title="Top cost drivers" detail="Grouped from live cost analytics data" /><QueryState isLoading={grouped.isLoading} error={grouped.error} empty={!grouped.data?.length}><div className="list">{grouped.data?.slice(0, 5).map((item, index) => <div className="list-row" key={String(item.group_key1 ?? item.key ?? index)}><span>{rowLabel(item)}</span><strong>{money(rowCost(item))}</strong></div>)}</div></QueryState></Card><Card className="panel"><SectionTitle title="Cost by agent" detail="Live agent rollup" /><QueryState isLoading={agents.isLoading} error={agents.error} empty={!agents.data?.length}><div className="list">{agents.data?.slice(0, 5).map((item, index) => <div className="list-row" key={String(item.agent ?? item.agent_name ?? item.caller ?? index)}><span>{String(item.agent ?? item.agent_name ?? item.caller ?? 'Unknown agent')}</span><strong>{money(rowCost(item))}</strong></div>)}</div></QueryState></Card></div><div className="two-column"><Card className="panel"><SectionTitle title="Budget posture" detail="Active budget configuration" />{budget.isLoading ? <EmptyState>Loading budget posture...</EmptyState> : budget.error ? <EmptyState>Budget posture could not be loaded.</EmptyState> : budget.data ? <div className="list"><div className="list-row"><span>Budget</span><strong>{money(numeric(budget.data, 'budget_amount', 'amount', 'monthly_budget'))}</strong></div><div className="list-row"><span>Configured status</span><strong>Active</strong></div></div> : <EmptyState>No active budget is configured.</EmptyState>}</Card><Card className="panel"><SectionTitle title="Needs attention" detail="Alerts and optimization opportunities" />{!canViewGovernance ? <EmptyState>Governance signals are restricted for readonly users.</EmptyState> : alerts.isLoading || opportunities.isLoading ? <EmptyState>Loading governance signals...</EmptyState> : alerts.error || opportunities.error ? <EmptyState>Governance signals could not be loaded.</EmptyState> : alerts.data?.length || opportunities.data?.length ? <div className="list"><div className="list-row"><span><AlertTriangle size={14} className="mr-2 inline text-amber" />Active alerts</span><strong>{alerts.data?.length ?? 0}</strong></div><div className="list-row"><span><CircleDollarSign size={14} className="mr-2 inline text-green" />Optimization opportunities</span><strong>{opportunities.data?.length ?? 0}</strong></div><Button className="mt-3" onClick={() => onOpen('Governance signals')}>Open signals <ArrowUpRight size={13} /></Button></div> : <EmptyState>No active alerts or optimization opportunities.</EmptyState>}</Card></div></>;
}
