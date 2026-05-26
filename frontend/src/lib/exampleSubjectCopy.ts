/** 示范档案第三人称文案辅助（SELF / ROS 文学叙述用） */

export type ExampleSubject = {
  name: string;
  gender: "female" | "male";
};

export function subjectPronoun(subject: ExampleSubject): "她" | "他" {
  return subject.gender === "female" ? "她" : "他";
}

export function subjectPossessive(subject: ExampleSubject): "她的" | "他的" {
  return subject.gender === "female" ? "她的" : "他的";
}

export function subjectDative(subject: ExampleSubject): "她" | "他" {
  return subjectPronoun(subject);
}

export function subjectLabel(subject: ExampleSubject): string {
  return subject.name;
}

/**
 * MATE 示范档案人称约定：
 * - 红娘建议 / 预演「注意」/ 镜像背面 → 对档案主体用「你」
 * - 恋爱预演「对方在想什么」→ 约会对象视角，对女性主体用「她」、男性用「他」
 * - SELF·ROS 章节叙述、红楼对照 → 第三人称「她/他」+ 人名
 * - socialQuote → 外人评价口吻，第三人称即可
 */
