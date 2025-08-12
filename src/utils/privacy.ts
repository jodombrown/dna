export type VisibilityRule = 'public' | 'connections' | 'private';

interface ViewContext {
  isSelf?: boolean;
  isConnection?: boolean;
}

export const canView = (
  visibility: Record<string, VisibilityRule> | undefined,
  field: string,
  ctx: ViewContext = {}
): boolean => {
  const rule = (visibility?.[field] as VisibilityRule) || 'public';
  if (ctx.isSelf) return true;
  if (rule === 'public') return true;
  if (rule === 'connections') return !!ctx.isConnection;
  return false; // private by default
};
