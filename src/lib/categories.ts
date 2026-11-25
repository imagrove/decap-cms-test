// 分类代号与展示名。Decap 的 select 选项写在 public/admin/config*.yml 里，
// 新增分类要三处同步：这里、两份 config 的 options、以及 products schema 的 enum。
export const CATEGORIES = [
  { id: 'display', label: '显示与交互' },
  { id: 'sensor', label: '传感与采集' },
  { id: 'connectivity', label: '通信与网关' },
  { id: 'power', label: '电源与控制' },
  { id: 'accessory', label: '配件与模块' },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];

export function categoryLabel(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}
