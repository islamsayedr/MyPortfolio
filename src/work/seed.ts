import type { Project } from './types'

// Stable sample IDs are used only before the database is configured. Once
// connected, legacy aliases redirect these sample URLs to the actual row IDs.
export const seedLegacyIds: Record<string, string> = {
  "couponz-souq": "20000000-0000-0000-0000-000000000001",
  "tracker-3arbya": "20000000-0000-0000-0000-000000000002",
  "tia-jewelry": "20000000-0000-0000-0000-000000000003",
  "dal": "20000000-0000-0000-0000-000000000004",
  "shipin": "20000000-0000-0000-0000-000000000005"
}

export const seedProjects: Project[] = [
  { id: '20000000-0000-0000-0000-000000000001', description: '', presentation: '', title: 'Couponz Souq', image: '/imgs/sc.jpg', alt: 'Couponz Souq mobile app', tags: ['UI Design', 'Mobile App'] },
  { id: '20000000-0000-0000-0000-000000000002', description: '', presentation: '', title: 'Tracker 3arbya', image: '/imgs/t3.jpg', alt: 'Tracker 3arbya mobile app', tags: ['Case Study', 'UX Design', 'UI Design', 'Mobile App'] },
  { id: '20000000-0000-0000-0000-000000000003', description: '', presentation: '', title: 'Tia Jewelry', image: '/imgs/tia.jpg', alt: 'Tia Jewelry website', tags: ['UX Design', 'UI Design', 'Website'] },
  { id: '20000000-0000-0000-0000-000000000004', description: '', presentation: '', title: 'Dal', image: '/imgs/dal.jpg', alt: 'Dal mobile app', tags: ['Case Study', 'UX Design', 'UI Design'] },
  { id: '20000000-0000-0000-0000-000000000005', description: '', presentation: '', title: 'Shipin', image: '/imgs/shipin.jpg', alt: 'Shipin mobile app', tags: ['Case Study', 'UX Design', 'Mobile App'] },
]
