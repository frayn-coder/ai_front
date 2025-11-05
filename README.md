# AI Frontend 架构蓝图

## 目标

- 打造“豆包客户端”同级体验的跨端前端架构：快、稳、可扩展、易演进。
- 重点支持：多会话聊天、流式回复、工具/插件调用、富媒体消息、多模态输入输出（文本/语音/图像/文件）、模型与角色配置、知识库检索、消息二次加工（重试、继续、分支）。

## 非目标

- 不讨论后端模型编排细节；本文仅覆盖前端与 BFF 的边界与契约。

---

## 用户路径（UJT）

1. 进入：看到最近会话与模板（Prompt/Agent）合集。
2. 选中或新建会话 → 输入问题 → 实时流式产出。
3. 中途触发工具（搜索/网页抓取/代码执行/表格/制图/翻译等）。
4. 对消息进行：复制、引用、改写、继续、分支、总结、设为卡片。
5. 导出/分享：图片、Markdown、PDF、链接（受权限控制）。

---

## 总体架构

### 分层（自上而下）

1. **体验层（UI/UX）**：页面、组件、渲染器（文本/代码/图表/表格/音视频），快捷键与指令面板。
2. **应用层（Domain）**：会话状态机、消息总线、工具/插件宿主、模型与角色配置、缓存与离线策略。
3. **基础能力层（Infra）**：网络与流（SSE/WebSocket/gRPC-web）、持久化（IndexedDB/CacheStorage）、队列与任务、加密与权限、遥测与灰度开关。

### 典型数据流

```
UI 输入 → Command（发送指令）→ Domain（会话/消息状态机）→
Transport（SSE/WS）→ 流式消息片段 → 渲染器增量渲染 →
工具调用（PluginHost）↔ 后端 BFF ↔ 第三方服务
```

---

## 运行时与技术选型

- **Web 首选**：Next.js（App Router）+ React 18（并发特性）+ Vite/TS。
- **移动端**：React Native（共用业务逻辑）或 Flutter（二选一）。
- **桌面端**：Tauri（优先，轻）或 Electron（生态成熟）。
- **样式**：Tailwind + Radix UI/shadcn/ui；代码区高亮 Shiki/Prism。
- **图表**：ECharts/Recharts；文档与表格：TipTap/Plate + 自定义节点。
- **语音**：Web Speech API/自接 TTS/ASR；音频录制 MediaRecorder。

---

## 状态管理与模型

- **全局**：Zustand/Redux Toolkit（推荐 RTK Query 或 TanStack Query）
- **会话（Session）**：id、title、participants、modelConfig、pinnedTools
- **消息（Message）**：id、sessionId、role（user/assistant/tool/system）、
  status（pending/streaming/done/failed）、content（blocks[]）、toolCalls[]、meta
- **内容块（Block）**：type（text/code/chart/table/image/audio/file/trace）、
  data（schema 化 payload），支持增量 patch（JSON-Patch/OT/CRDT）
- **工具调用（ToolCall）**：name、arguments、status、result、error
- **归档/搜索**：消息向量索引交由后端；前端做轻量全文索引（MiniSearch）。

---

## 实时与流式通讯

- **SSE**：最简、兼容好；用于模型流与工具进度事件。
- **WebSocket**：需要双向推送/协同编辑/语音通话时启用。
- **重连与断点续传**：Event ID + Range；消息片段幂等合并（基于 delta 序号）。
- **节流与背压**：读取速率与渲染批量（requestIdleCallback + scheduleMicrotask）。

---

## 富文本/多模态渲染

- **Renderer Registry**：按 Block.type 动态挑选渲染器，支持懒加载与优先级。
- **代码块**：流式高亮、复制、运行（WebContainer/iframe 沙箱）。
- **表格**：大数据量虚拟化（React-Window/Virtual），CSV/Excel 导入导出。
- **图表**：以数据 schema（vega-lite 兼容）驱动可视化；支持“改图再生成”。

---

## 插件/工具体系（PluginHost）

- **形态**：
  - 前端插件（纯前端逻辑，访问受限能力，如 UI Widget、可视化）。
  - 后端代理插件（由 BFF 暴露 HTTP/gRPC 接口，前端仅驱动）。
- **沙箱隔离**：iframe + postMessage、CSP、权限白名单（fs/camera/mic/clipboard）。
- **权限申请**：以“能力声明 + 用户确认”方式；最小权限原则。
- **协议**：

  ```ts
  type ToolSpec = {
    name: string
    description: string
    parameters: JSONSchema
    invoke(args): Promise<ToolResult>
    ui?: ReactNode // 可选配置/结果视图
  }
  ```
- **生命周期**：install → enable → invoke → suspend → update → uninstall。
- **版本与签名**：插件清单（manifest.json）+ 版本校验 + 签名验证。

---

## 性能与稳定性

- **消息虚拟列表**：行高估计 + 粘滞定位；图片懒加载与尺寸占位。
- **流式渲染**：小批多次（10–30ms 合并），优先文本，延后副作用。
- **Web Worker**：token 化、差分合并、Markdown 解析、语法高亮。
- **WASM**：本地嵌入式推理/Embeddings（可选）、图像处理。
- **首屏**：SSR + 部分 RSC/ISR；关键路径组件优先级加载。
- **错误恢复**：ErrorBoundary + 事务日志（IndexedDB）+ 重放。

---

## 跨端策略

- **代码复用**：
  - Domain/Store/Service：全端共享（TypeScript）。
  - UI：Web 与 RN 分别实现，抽象接口保持一致。
- **PWA**：离线缓存、桌面安装、通知、后台同步（Periodic Sync）。
- **桌面端**：Tauri 调用系统能力（文件、剪贴板、窗口管理）。

---

## 安全与合规

- CSP、SRI、依赖审计；隐私弹窗与数据留存设置。
- 敏感信息打码/红线词检测在前端仅做提示，最终在 BFF 落槌。
- 文件权限：沙箱文件系统 + 明确的导入导出流。

---

## 可观测性与灰度

- 事件埋点（Page、View、Action、Error、Perf）；RUM（TTFB、FCP、LCP、CLS）。
- Feature Flag（ConfigCat/Unleash）与 A/B；远程配置热更新。
- 会话可回放（用户授权）用于问题定位。

---

## 目录结构（Monorepo 示例）

```
repo/
  packages/
    ui/                # 设计系统 & 复用组件
    domain/            # 状态机、模型、类型
    transport/         # SSE/WS 客户端、重连策略
    plugin-sdk/        # 插件协议、类型与工具
    renderers/         # 各类 Block 渲染器
  apps/
    web/               # Next.js 应用
    desktop/           # Tauri/Electron 外壳
    mobile/            # React Native 应用
  tools/
    scripts/           # 构建、发布、校验脚本
```

---

## 关键代码片段（简化）

### 1. 流式 Hook

```ts
export function useMessageStream(sessionId: string) {
  const appendDelta = useMessageStore(s=>s.appendDelta)
  const controller = useRef<AbortController>()
  const start = useCallback((payload: SendPayload) => {
    controller.current?.abort()
    controller.current = new AbortController()
    const es = new EventSource(`/api/sessions/${sessionId}/stream`, { withCredentials: true })
    es.onmessage = (e) => {
      const delta = JSON.parse(e.data)
      appendDelta(delta) // {messageId, seq, patch}
    }
    es.onerror = () => es.close()
    return () => es.close()
  }, [sessionId])
  const stop = () => controller.current?.abort()
  return { start, stop }
}
```

### 2. 消息存储（Zustand）

```ts
type Message = { id:string; blocks: Block[]; status: 'pending'|'streaming'|'done'|'failed' }
export const useMessageStore = create<MessageState>((set,get)=>({
  byId: new Map<string, Message>(),
  appendDelta(delta){
    // 根据 seq 做幂等合并，更新到 blocks 中
  },
  upsert(m){ set(s=>{ s.byId.set(m.id, { ...get().byId.get(m.id), ...m }) }) }
}))
```

### 3. 插件宿主（关键接口）

```ts
export interface PluginHost {
  register(spec: ToolSpec): void
  invoke(name: string, args: unknown): Promise<ToolResult>
}
```

### 4. 渲染器注册表

```ts
const registry: Record<string, React.FC<any>> = {}
export const register = (type: string, Comp: React.FC<any>) => (registry[type]=Comp)
export const RenderBlock = ({block}: {block: Block}) => {
  const C = registry[block.type] ?? Fallback
  return <C {...block.data} />
}
```

---

## 测试策略

- **单元**：状态机、合并算法、解析器、渲染器纯函数。
- **集成**：SSE/WS 流、会话操作、插件调用（Mock BFF）。
- **端到端**：Playwright；关键用户旅程脚本化。
- **性能回归**：Lighthouse CI、Web Vitals 采集阈值。

---

## 部署与灰度

- Web：多区域 CDN、边缘 SSR；Service Worker 版本管理。
- 桌面/移动：分渠道签名与灰度（比例/白名单/地域）；崩溃上报。

---

## 演进路线

- **MVP（4–6 周）**：多会话、流式回复、基础渲染器、文件上传、导出。
- **V1**：插件体系（只读类）、知识库检索、消息分支、TTS/ASR。
- **V2**：协作（共享会话/并行分支对比）、应用市场、工作流编排。

---

## 依赖清单（建议）

- App：next, react, typescript, tailwindcss, radix-ui, tanstack-query, zustand
- 渲染：tiptap, prism/shiki, react-window, echarts/recharts
- 实时：eventsource, socket.io-client（或原生 WS）
- 存储：idb-keyval, dexie（IndexedDB）
- 工具：zod/json-schema, ajv, jotai（可选）, msw（测试）

---

## 与后端的契约要点（BFF）

- **会话**：`GET/POST /sessions`，含模型与系统提示；列表分页与 Pin。
- **消息**：`POST /messages` → `SSE /stream` 返回 `{messageId, seq, patch}`。
- **工具调用**：`POST /tools/{name}` 流式返回步骤与结果。
- **上传**：可分片断点续传；返回文件句柄与安全下载 URL。
- **权限**：OAuth/OIDC，细粒度 Token；前端最小化缓存敏感数据。

> 以上方案覆盖“豆包风格”客户端的核心交互与可扩展点，可直接据此落地 PoC，并在 V1/V2 阶段逐步完善。
