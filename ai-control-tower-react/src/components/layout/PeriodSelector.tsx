import { ChevronDown } from 'lucide-react';
import { Button } from '../ui';
import { periods } from '../../app/navigation';

export function PeriodSelector({ period, open, onToggle, onSelect }: { period: string; open: boolean; onToggle: () => void; onSelect: (period: string) => void }) {
  return <div className="dropdown-wrap"><Button className="selector" onClick={onToggle}><span className="btn-kicker">Period</span><span>{period}</span><ChevronDown size={13} /></Button>{open && <div className="dropdown-menu">{periods.map((option) => <button key={option} onClick={() => onSelect(option)}>{option}</button>)}</div>}</div>;
}
