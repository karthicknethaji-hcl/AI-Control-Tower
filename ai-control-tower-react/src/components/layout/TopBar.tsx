import { Download } from 'lucide-react';
import { Button } from '../ui';
import { navItems } from '../../app/navigation';
import type { CompanyApp } from '../../types';
import { AppSelector } from './AppSelector';
import { PeriodSelector } from './PeriodSelector';

export function TopBar({ active, apps, appId, appOpen, period, periodOpen, onAppToggle, onAppSelect, onPeriodToggle, onPeriodSelect }: { active: string; apps: CompanyApp[]; appId: string | null; appOpen: boolean; period: string; periodOpen: boolean; onAppToggle: () => void; onAppSelect: (id: string) => void; onPeriodToggle: () => void; onPeriodSelect: (period: string) => void }) {
  const item = navItems.find((entry) => entry.key === active);
  return <header className="topbar"><div className="top-left"><h2>{item?.label ?? 'Command Center'}</h2><p>{item?.sub ?? ''}</p></div><div className="top-actions"><AppSelector apps={apps} selectedId={appId} open={appOpen} onToggle={onAppToggle} onSelect={onAppSelect} /><PeriodSelector period={period} open={periodOpen} onToggle={onPeriodToggle} onSelect={onPeriodSelect} /><Button className="export-btn" disabled title="Export not available in v0.01" aria-label="Export not available in v0.01"><Download size={14} />Export</Button></div></header>;
}
