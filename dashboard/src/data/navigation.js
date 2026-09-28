import { 
  Video, 
  PlayCircle, 
  Network, 
  FileCheck2, 
  TrendingUp, 
  Library 
} from '../components/Icons.jsx'

export const NAV_ITEMS = [
  {
    id: 'video-3d',
    label: '3D Video',
    icon: Video,
    badge: 'LIVE',
    badgeType: 'badge-live'
  },
  {
    id: 'video-prototype',
    label: 'Prototype Video',
    icon: PlayCircle,
    badge: 'PENDING',
    badgeType: 'badge-pending'
  },
  {
    id: 'model-flow',
    label: '3D Model Working Flow',
    icon: Network,
    badge: 'INTERACTIVE',
    badgeType: 'badge-ready'
  },
  {
    id: 'feasibility',
    label: 'Feasibility',
    icon: FileCheck2,
    badge: 'AUDITED',
    badgeType: 'badge-ready'
  },
  {
    id: 'viability',
    label: 'Viability',
    icon: TrendingUp,
    badge: 'ROI / TCO',
    badgeType: 'badge-ready'
  },
  {
    id: 'research',
    label: 'Research & References',
    icon: Library,
    badge: '9 PAPERS',
    badgeType: 'badge-ready'
  }
]
