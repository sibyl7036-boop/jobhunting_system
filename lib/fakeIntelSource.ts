/**
 * lib/fakeIntelSource.ts
 *
 * "今日大厂动向" 的硬编码原始资讯源（Step 6.5 · PRD 5.1.3）
 *
 * 真实项目里应该接爬虫或第三方 API，本项目只做示意。
 * AI 会把这些原始条目压缩成一段 50~90 字的首页摘要。
 */

export interface IntelItem {
  /** 招聘主体（公司 + 可选部门） */
  source: string;
  /** 事件类型：开放 / 更新 / 关闭 / 进展 等 */
  kind: string;
  /** 简短内容（一句话） */
  note: string;
}

/**
 * 基准资讯列表。Agent 按 Step 6.5 要求手写 5~8 条，看起来像真实社招/实习动态。
 * 每天访问时，`/api/ai/daily-intel` 会把这些条目拼给模型去压缩。
 */
export const FAKE_INTEL: IntelItem[] = [
  {
    source: "腾讯 · IEG",
    kind: "实习开放",
    note: "游戏产品方向暑期实习岗位开放网申，重点招 Data Agent / AIGC 方向",
  },
  {
    source: "字节 · 电商",
    kind: "岗位更新",
    note: "电商数据产品社招更新，新增北京/上海 HC，接受社招 2-3 年经验",
  },
  {
    source: "美团 · 到店",
    kind: "实习开放",
    note: "到店事业部用户增长产品经理暑期实习开放，重点考察 A/B 实验能力",
  },
  {
    source: "阿里 · 淘天",
    kind: "关闭预警",
    note: "淘天产品社招部分岗位 HC 本周收尾，建议尽快完成投递",
  },
  {
    source: "百度 · 搜索",
    kind: "方向变化",
    note: "搜索产品方向近期整体转向 LLM 应用与生成式搜索，JD 更新中",
  },
  {
    source: "小红书 · 社区",
    kind: "实习开放",
    note: "社区产品方向实习开放，偏社区运营策略与内容生态分析",
  },
  {
    source: "快手 · 磁力",
    kind: "进展",
    note: "磁力引擎产品面试周期缩短到 2 周，建议保持会议可联络",
  },
];

/** 把资讯压成 AI 友好的字符串：每条一行，源/类型/内容三段式 */
export function formatIntelItemsForPrompt(items: IntelItem[]): string {
  return items
    .map((it, i) => `${i + 1}. [${it.source}] (${it.kind}) ${it.note}`)
    .join("\n");
}
