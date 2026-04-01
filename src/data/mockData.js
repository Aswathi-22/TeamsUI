import { TASK_STATUS } from '../constants/taskStatus'

const toISODate = (date) => date.toISOString().slice(0, 10)

const shiftDays = (days) => {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + days)
  return toISODate(date)
}

export const mockWorkspaces = [
  {
    id: 'ws-product',
    name: 'Product Orbit',
    description: 'Core product planning, launch sequencing, and delivery.',
  },
  {
    id: 'ws-growth',
    name: 'Growth Engine',
    description: 'Acquisition experiments, lifecycle campaigns, and analytics.',
  },
  {
    id: 'ws-platform',
    name: 'Platform Ops',
    description: 'Infrastructure, internal tooling, and reliability programs.',
  },
]

export const mockTasks = [
  {
    id: 'task-product-001',
    title: 'Finalize launch backlog',
    description: 'Freeze MVP scope and confirm all acceptance criteria.',
    status: TASK_STATUS.BACKLOG,
    priority: 'high',
    startDate: shiftDays(-1),
    dueDate: shiftDays(4),
    dependencies: [],
    workspaceId: 'ws-product',
  },
  {
    id: 'task-product-002',
    title: 'Cross-team QA sweep',
    description: 'Run end-to-end QA for all user-critical workflows.',
    status: TASK_STATUS.TODO,
    priority: 'critical',
    startDate: shiftDays(2),
    dueDate: shiftDays(9),
    dependencies: ['task-product-001'],
    workspaceId: 'ws-product',
  },
  {
    id: 'task-product-003',
    title: 'Stakeholder signoff deck',
    description: 'Prepare release readiness deck for executive review.',
    status: TASK_STATUS.COMPLETED,
    priority: 'medium',
    startDate: shiftDays(-7),
    dueDate: shiftDays(-2),
    dependencies: [],
    workspaceId: 'ws-product',
  },
  {
    id: 'task-growth-001',
    title: 'Define paid campaign brief',
    description: 'Document channel mix, messaging, and spend assumptions.',
    status: TASK_STATUS.BACKLOG,
    priority: 'medium',
    startDate: shiftDays(0),
    dueDate: shiftDays(5),
    dependencies: [],
    workspaceId: 'ws-growth',
  },
  {
    id: 'task-growth-002',
    title: 'Lifecycle automation setup',
    description: 'Configure onboarding and retention workflow automations.',
    status: TASK_STATUS.IN_PROGRESS,
    priority: 'high',
    startDate: shiftDays(1),
    dueDate: shiftDays(8),
    dependencies: ['task-growth-001'],
    workspaceId: 'ws-growth',
  },
  {
    id: 'task-growth-003',
    title: 'Attribution model cleanup',
    description: 'Unify campaign UTM taxonomy in analytics dashboards.',
    status: TASK_STATUS.COMPLETED,
    priority: 'low',
    startDate: shiftDays(-10),
    dueDate: shiftDays(-4),
    dependencies: [],
    workspaceId: 'ws-growth',
  },
  {
    id: 'task-platform-001',
    title: 'Upgrade CI build runners',
    description: 'Move runners to the latest base image and validate caching.',
    status: TASK_STATUS.BACKLOG,
    priority: 'high',
    startDate: shiftDays(3),
    dueDate: shiftDays(11),
    dependencies: [],
    workspaceId: 'ws-platform',
  },
  {
    id: 'task-platform-002',
    title: 'Service health dashboards',
    description: 'Expand SLO dashboard coverage for critical services.',
    status: TASK_STATUS.TODO,
    priority: 'medium',
    startDate: shiftDays(-2),
    dueDate: shiftDays(6),
    dependencies: [],
    workspaceId: 'ws-platform',
  },
  {
    id: 'task-platform-003',
    title: 'Disaster recovery drill',
    description: 'Run failover simulation and publish follow-up actions.',
    status: TASK_STATUS.IN_PROGRESS,
    priority: 'critical',
    startDate: shiftDays(-12),
    dueDate: shiftDays(-5),
    dependencies: ['task-platform-002'],
    workspaceId: 'ws-platform',
  },
]
