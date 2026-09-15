import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, ChevronDown, Target } from 'lucide-react';
import { getCostSummary, getGroupedCost, getOutcomeTypes, getOutcomes, getTopCalls } from '../../services/controlTowerApi';
import type { OutcomeRow, OutcomeTypeRow, TopCallRow } from '../../services/controlTowerApi';
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

function costFor(row: Record<string, unknown>) { return numeric(row, 'cost', 'total_cost_usd', 'cost_usd', 'calculated_cost'); }
function sumCosts(rows: Array<Record<string, unknown>>) { if (!rows.length) return 0; const costs = rows.map(costFor); return costs.every((value) => value !== undefined) ? costs.reduce((total, value) => total + (value ?? 0), 0) : undefined; }
function typeId(type: OutcomeTypeRow) { return String(type.outcome_type_id ?? type.id ?? ''); }
function typeName(type: OutcomeTypeRow) { return String(type.name ?? 'Outcome type'); }

function DetailContent({ type, outcomes, sampleCalls, totalCost, completedCost, abandonedCost }: { type: OutcomeTypeRow; outcomes: OutcomeRow[]; sampleCalls: TopCallRow[]; totalCost: number | undefined; completedCost: number | undefined; abandonedCost: number | undefined }) {
  const completed = outcomes.filter((outcome) => outcome.status === 'completed').length;
  const abandoned = outcomes.filter((outcome) => outcome.is_abandoned).length;
  const inProgress = outcomes.some((outcome) => outcome.status === 'in_progress') ? outcomes.filter((outcome) => outcome.status === 'in_progress').length : undefined;
  return <div className="space-y-4"><div className="list"><div className="list-row"><span>Outcome Spend</span><strong>{money(totalCost)}</strong></div><div className="list-row"><span>Completed Cost</span><strong>{money(completedCost)}</strong></div><div className="list-row"><span>Abandoned Cost</span><strong>{money(abandonedCost)}</strong></div><div className="list-row"><span>Completed / Abandoned / In Progress</span><strong>{completed} / {abandoned} / {inProgress ?? '—'}</strong></div></div><div><SectionTitle title="Sample Calls" detail="Top calls returned for this app-defined outcome type" />{sampleCalls.length ? <div className="list">{sampleCalls.map((call, index) => <div className="list-row" key={`${String(call.caller ?? 'call')}-${index}`}><span>{String(call.caller ?? 'Unknown caller')}</span><strong>{money(numeric(call as Record<string, unknown>, 'calculated_cost', 'cost'))}</strong></div>)}</div> : <EmptyState>No sample calls were returned for this outcome type.</EmptyState>}</div><p className="text-[10px] font-semibold text-muted">{type.canvas ? `Context: ${type.canvas}` : 'App-defined outcome type'}</p></div>;
}

export function OutcomeEconomicsPage({ params, onOpen }: { params: RpcParams; onOpen: (title: string, content?: ReactNode) => void }) {
  const queryContext = [params.companyId, params.appId, params.periodStart, params.periodEnd];
  const summary = useQuery({ queryKey: ['outcome-economics', 'summary', ...queryContext], queryFn: () => getCostSummary(params) });
  const types = useQuery({ queryKey: ['outcome-economics', 'types', params.appId], queryFn: () => getOutcomeTypes(params.appId) });
  const outcomes = useQuery({ queryKey: ['outcome-economics', 'outcomes', ...queryContext], queryFn: () => getOutcomes(params) });
  const grouped = useQuery({ queryKey: ['outcome-economics', 'grouped', ...queryContext, 'outcome_type'], queryFn: () => getGroupedCost(params, 'outcome_type') });
  const sampleCalls = useQuery({ queryKey: ['outcome-economics', 'top-calls', ...queryContext, 'cost', 3, 'outcome_type'], queryFn: () => getTopCalls(params, 'cost', 3, 'outcome_type') });

  const summaryRow = summary.data?.[0];
  const totalSpend = numeric(summaryRow as Record<string, unknown> | undefined, 'total_cost', 'total_cost_usd');
  const groupedRows = grouped.data ?? [];
  const attributedSpend = sumCosts(groupedRows);
  const unattributedSpend = totalSpend !== undefined && attributedSpend !== undefined ? totalSpend - attributedSpend : undefined;
  const completedCount = (outcomes.data ?? []).filter((outcome) => outcome.status === 'completed').length;
  const abandonedCount = (outcomes.data ?? []).filter((outcome) => outcome.is_abandoned).length;
  const inProgressCount = (outcomes.data ?? []).some((outcome) => outcome.status === 'in_progress') ? (outcomes.data ?? []).filter((outcome) => outcome.status === 'in_progress').length : undefined;
  const loading = summary.isLoading || types.isLoading || outcomes.isLoading || grouped.isLoading || sampleCalls.isLoading;
  const error = summary.error || types.error || outcomes.error || grouped.error || sampleCalls.error;
  const hasData = Boolean(types.data?.length);

  return <><div className="page-intro"><div><Badge className="bg-greenP text-green">Primary USP</Badge><p>Connect AI spend to app-defined product and business outcomes, then inspect the calls behind them.</p></div><Button><Target size={14} />Outcome Filters <ChevronDown size={13} /></Button></div><div className="metric-grid five"><MetricCard label="Outcome-Attributed Spend" value={money(attributedSpend)} detail="Outcome-type grouping" tone="green" /><MetricCard label="Unattributed Spend" value={money(unattributedSpend)} detail={totalSpend === undefined ? 'Requires total spend from summary' : 'Total less attributed spend'} tone="amber" /><MetricCard label="Completed Outcomes" value={compactNumber(completedCount)} detail="From outcome records" tone="purple" /><MetricCard label="Abandoned Outcomes" value={compactNumber(abandonedCount)} detail="Where abandonment is returned" tone="red" /><MetricCard label="In Progress" value={compactNumber(inProgressCount)} detail={inProgressCount === undefined ? 'Explicit status not returned' : 'Explicit in_progress status'} tone="blue" /></div><Card className="panel"><SectionTitle title="Outcome Portfolio" detail={`${types.data?.length ?? 0} app-defined outcome types available`} />{loading ? <EmptyState>Loading live outcome data...</EmptyState> : error ? <EmptyState>Outcome data could not be loaded for this app and period.</EmptyState> : !hasData ? <EmptyState>No app-defined outcome types are available for this app.</EmptyState> : <div className="outcome-grid">{(types.data ?? []).map((type) => { const id = typeId(type); const typeOutcomes = (outcomes.data ?? []).filter((outcome) => outcome.outcome_type_id === id); const typeRows = groupedRows.filter((row) => row.group_key1 === id); const totalCost = sumCosts(typeRows); const completedCost = sumCosts(typeRows.filter((row) => row.group_key2 === 'completed')); const abandonedCost = sumCosts(typeRows.filter((row) => row.group_key2 === 'abandoned')); const calls = (sampleCalls.data ?? []).filter((call) => call.partition_key === id); return <button className="outcome-card" key={id} onClick={() => onOpen(typeName(type), <DetailContent type={type} outcomes={typeOutcomes} sampleCalls={calls} totalCost={totalCost} completedCost={completedCost} abandonedCost={abandonedCost} />)}><span className="outcome-icon"><Target size={16} /></span><strong>{typeName(type)}</strong><span>{money(totalCost)}</span><ArrowUpRight size={14} /></button>; })}</div>}</Card></>;
}
