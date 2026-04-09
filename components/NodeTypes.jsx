import { Handle, Position } from '@xyflow/react';
import { User, Building2, MapPin, Briefcase } from 'lucide-react';

const BaseNode = ({ id, data, icon: Icon, title, subtitle, bgClass, borderClass, ringClass }) => {
  return (
    <div className={`relative px-4 py-3 shadow-xl rounded-xl border ${borderClass} ${bgClass} ${ringClass} backdrop-blur-md min-w-[200px]`}>
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-white/10`}>
          <Icon size={20} className="text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-white font-semibold text-sm leading-tight">{title}</span>
          <span className="text-white/70 text-xs mt-0.5">{subtitle}</span>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
      {/* Plus icon button for expansion (can trigger an event handled in GraphCanvas) */}
      <button 
        onClick={(e) => { e.stopPropagation(); data.onExpand(id); }}
        className="absolute -right-3 -top-3 bg-slate-800 border border-slate-600 rounded-full p-1 hover:bg-slate-700 text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
      </button>
    </div>
  );
};

export const PersonNode = (props) => {
  const { data } = props;
  const cat = data.category ? data.category[0] : 'Unknown';
  
  let bgClass = "bg-blue-600/80";
  let ringClass = "hover:ring-blue-400/50";
  if (cat === "Family") { bgClass = "bg-green-600/80"; ringClass = "hover:ring-green-400/50"; }
  else if (cat === "Friend") { bgClass = "bg-orange-600/80"; ringClass = "hover:ring-orange-400/50"; }

  return <BaseNode 
    {...props} 
    icon={User} 
    title={`${data.firstName} ${data.lastName}`} 
    subtitle={data.bio || cat} 
    bgClass={bgClass} 
    borderClass="border-white/20" 
    ringClass={`hover:ring-4 transition-shadow ${ringClass}`}
  />;
};

export const InstitutionNode = (props) => (
  <BaseNode 
    {...props} 
    icon={Building2} 
    title={props.data.name} 
    subtitle="Institution" 
    bgClass="bg-slate-500/80" 
    borderClass="border-slate-400/30"
    ringClass="hover:ring-4 hover:ring-slate-400/50 transition-shadow"
  />
);

export const OrganizationNode = (props) => (
  <BaseNode 
    {...props} 
    icon={Briefcase} 
    title={props.data.name} 
    subtitle="Organization" 
    bgClass="bg-purple-600/80" 
    borderClass="border-purple-400/30"
    ringClass="hover:ring-4 hover:ring-purple-400/50 transition-shadow"
  />
);

export const PlaceNode = (props) => (
  <BaseNode 
    {...props} 
    icon={MapPin} 
    title={props.data.name} 
    subtitle="Location" 
    bgClass="bg-yellow-600/80 text-slate-900" 
    borderClass="border-yellow-400/30"
    ringClass="hover:ring-4 hover:ring-yellow-400/50 transition-shadow"
  />
);

export const nodeTypes = {
  Person: PersonNode,
  Institution: InstitutionNode,
  Organization: OrganizationNode,
  Place: PlaceNode
};
