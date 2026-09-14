import type { ReactNode } from 'react';
import { useState } from 'react';
import type { CompanyApp, CompanyMembership, NavKey, RpcParams } from '../types';
import { periods, periodRange } from './navigation';
import { Sidebar } from '../components/layout/Sidebar';
import { TopBar } from '../components/layout/TopBar';
import { DetailDrawer } from '../components/layout/DetailDrawer';
import { CommandCenterPage } from '../features/command-center/CommandCenterPage';
import { OutcomeEconomicsPage } from '../features/outcome-economics/OutcomeEconomicsPage';
import { CostAnalyticsPage } from '../features/cost-analytics/CostAnalyticsPage';
import { TraceExplorerPage } from '../features/trace-explorer/TraceExplorerPage';
import { GovernancePage } from '../features/governance/GovernancePage';

export interface ShellContext { session: { user: { email?: string; user_metadata?: { display_name?: string } } }; membership: CompanyMembership; apps: CompanyApp[]; }

export function ControlTowerShell({ context }: { context: ShellContext }) {
  const [active, setActive] = useState<NavKey>('command'); const [collapsed, setCollapsed] = useState(false); const [period, setPeriod] = useState(periods[0]); const [appId, setAppId] = useState<string | null>(context.apps[0]?.app_id ?? null); const [userOpen, setUserOpen] = useState(false); const [periodOpen, setPeriodOpen] = useState(false); const [appOpen, setAppOpen] = useState(false); const [drawer, setDrawer] = useState<{ title: string; content?: ReactNode } | null>(null); const [traceContext, setTraceContext] = useState<string | null>(null);
  const selectedApp = context.apps.find((app) => app.app_id === appId) ?? context.apps[0]; const range = periodRange(period); const params: RpcParams | null = selectedApp ? { companyId: context.membership.company_id, appId: selectedApp.app_id, ...range } : null; const canGovern = context.membership.role === 'admin' || context.membership.role === 'member'; const displayName = context.session.user.user_metadata?.display_name || context.session.user.email?.split('@')[0] || 'User';
  function selectApp(next: string) { setAppId(next); setAppOpen(false); }
  const openDrawer = (title: string, content?: ReactNode) => setDrawer({ title, content });
  const openTrace = (traceId: string) => { setTraceContext(traceId); setActive('traces'); };
  return <div className={collapsed ? 'app-shell collapsed' : 'app-shell'}><Sidebar active={active} collapsed={collapsed} setActive={setActive} setCollapsed={setCollapsed} userOpen={userOpen} setUserOpen={setUserOpen} displayName={displayName} email={context.session.user.email} membership={context.membership} /><main className="main"><TopBar active={active} apps={context.apps} appId={appId} appOpen={appOpen} period={period} periodOpen={periodOpen} onAppToggle={() => setAppOpen(!appOpen)} onAppSelect={selectApp} onPeriodToggle={() => setPeriodOpen(!periodOpen)} onPeriodSelect={(next) => { setPeriod(next); setPeriodOpen(false); }} /><div className="content-scroll"><div className="content">{active === 'command' && params && <CommandCenterPage params={params} canViewGovernance={canGovern} onOpen={(title) => openDrawer(title)} />}{active === 'outcomes' && params && <OutcomeEconomicsPage params={params} onOpen={openDrawer} />}{active === 'cost' && params && <CostAnalyticsPage params={params} canInspectTrace={canGovern} onTraceSelect={openTrace} onOpen={(title) => openDrawer(title)} />}{active === 'traces' && params && <TraceExplorerPage params={params} canInspectTrace={canGovern} initialTraceId={traceContext} onOpen={openDrawer} />}{active === 'governance' && canGovern && params && <GovernancePage params={params} onOpen={(title) => openDrawer(title)} />}</div></div>{drawer && <DetailDrawer title={drawer.title} content={drawer.content} onClose={() => setDrawer(null)} />}</main></div>;
}
