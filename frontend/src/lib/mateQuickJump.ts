import { MATE_NAV_SECTIONS, type MateNavId } from "@/data/mateTypes";

export type MateQuickJumpItem = {
  id: MateNavId;
  title: string;
  sub: string;
  emoji: string;
};

const QUICK_JUMP_META: Record<MateNavId, { title: string; sub: string }> = {
  modules: { title: "五维得分", sub: "SCORES" },
  identity: { title: "档案首页", sub: "IDENTITY" },
  coordinate: { title: "坐标站", sub: "COORDINATE" },
  simulator: { title: "参数模拟", sub: "SIM" },
  observe: { title: "观察室", sub: "OBSERVE" },
  rehearse: { title: "恋爱预演", sub: "REHEARSE" },
  advice: { title: "市场建议", sub: "ADVICE" },
  match: { title: "匹配区间", sub: "MATCH" },
  lens: { title: "透视镜", sub: "LENS" },
};

/** 横向章节导航 · 顺序与 MATE_NAV_SECTIONS 一致 */
export const MATE_QUICK_JUMP_GRID: MateQuickJumpItem[] = MATE_NAV_SECTIONS.map((s) => ({
  id: s.id,
  emoji: s.icon,
  ...QUICK_JUMP_META[s.id],
}));

export function mateQuickJumpItems(): MateQuickJumpItem[] {
  return MATE_QUICK_JUMP_GRID;
}
