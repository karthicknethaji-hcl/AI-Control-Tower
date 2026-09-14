import { ChevronDown } from 'lucide-react';
import { Badge, Button } from '../ui';
import type { CompanyApp } from '../../types';

export function AppSelector({ apps, selectedId, open, onToggle, onSelect }: { apps: CompanyApp[]; selectedId: string | null; open: boolean; onToggle: () => void; onSelect: (id: string) => void }) {
  const selectedApp = apps.find((app) => app.app_id === selectedId);
  return <div className="dropdown-wrap"><Button className="selector" onClick={onToggle} disabled={!selectedApp}><span className="btn-kicker">App</span><span>{selectedApp?.app_name ?? 'Loading apps...'}</span><ChevronDown size={13} /></Button>{open && selectedApp && <div className="dropdown-menu">{apps.map((app) => <button key={app.app_id} onClick={() => onSelect(app.app_id)} className={app.app_id === selectedId ? 'selected' : ''}>{app.app_name}{app.app_id === selectedId && <Badge className="ml-auto">Active</Badge>}</button>)}</div>}</div>;
}
