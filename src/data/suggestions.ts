/**
 * 欢迎页的建议卡片。
 *
 * icon 存的是 <svg> 的内部标记，由 SuggestionGrid 用 v-html 渲染。
 * 内容是本文件里的静态常量，不来自任何用户输入或接口，不存在注入面。
 * 之所以放进数据里，是因为卡片是 v-for 渲染的，图标必须随数据走。
 */

export type SuggestionTone = "blue" | "purple" | "green" | "amber";

export interface Suggestion {
  title: string;
  description: string;
  /** 点击后填入输入框的提示词。 */
  prompt: string;
  tone: SuggestionTone;
  icon: string;
}

export const suggestions: Suggestion[] = [
  {
    title: "了解项目",
    description: "梳理目录结构与关键文件",
    prompt: "帮我梳理当前项目的目录结构",
    tone: "blue",
    icon: '<path d="M4 5h16v14H4z" /><path d="M8 9h8M8 12h5" />',
  },
  {
    title: "分析代码",
    description: "定位问题并讨论解决方案",
    prompt: "帮我分析一个代码问题",
    tone: "purple",
    icon: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" />',
  },
  {
    title: "规划开发",
    description: "拆解任务与实现步骤",
    prompt: "为当前项目制定下一步开发计划",
    tone: "green",
    icon: '<path d="M5 4h14v16H5z" /><path d="m8 12 2.5 2.5L16 9" />',
  },
  {
    title: "学习 SDK",
    description: "理解接口与集成方式",
    prompt: "请解释如何使用 Pi SDK",
    tone: "amber",
    icon: '<circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 0 1 4.8.8c0 1.7-2.3 2-2.3 3.7M12 17.5h.01" />',
  },
];
