# LoveCompass AI Adapter 设计说明

作者：**Manus AI**  
日期：2026-05-23

## 一、设计目标

LoveCompass 的 AI 能力包括结果报告生成、画像解释、聊天追问和后续可能的复盘建议。为了避免业务代码被某一家模型供应商绑定，后端新增了统一的 **AI Adapter** 层。业务层只调用 `generate(prompt)`，不直接感知智谱、Anthropic、OpenAI-compatible 或其他模型的 SDK 与响应格式。

| 层级 | 责任 | 当前文件 |
|---|---|---|
| 业务入口 | 构造画像、聊天或报告 prompt | `app/main.py`、后续报告任务模块 |
| Adapter 抽象 | 暴露统一 `generate(prompt)` 接口 | `app/ai_adapter.py` |
| 智谱实现 | 调用智谱 `chat/completions` 接口 | `ZhipuAIAdapter` |
| 降级实现 | 没有 Key 时返回占位内容，保证联调不断 | `MockAIAdapter` |

## 二、当前实现

当前实现没有引入新的 SDK，也没有新增依赖包，而是使用 Python 标准库 `urllib` 调用 OpenAI-compatible 形式的接口。这样做的原因是：项目现在的重点是先跑通题库、提交、结果和聊天链路；在智谱 Key 还未配置前，引入 SDK 并不会提升联调效率。等正式调用量、重试、超时、流式输出或多模型路由需求出现后，再考虑引入官方 SDK 或 `httpx`。

```python
class AIAdapter(Protocol):
    def generate(self, prompt: str) -> str:
        ...
```

## 三、环境变量

| 变量 | 示例 | 说明 |
|---|---|---|
| `AI_PROVIDER` | `zhipu` | 选择 AI 供应商；未配置时默认 mock。 |
| `ZHIPU_API_KEY` | `sk-...` | 智谱私密 Key，仅能放后端。 |
| `ZHIPU_BASE_URL` | `https://open.bigmodel.cn/api/paas/v4` | 智谱 API 地址。 |
| `ZHIPU_MODEL` | `glm-4-flash` | 默认模型，可后续替换。 |

## 四、需要你提供什么

现在不急着要智谱 Key。等我们进入“真实 AI 报告生成/聊天联调”时，我会再明确向你要 **智谱 API Key**，并告诉你应该放在后端 `.env` 或部署平台的服务端环境变量中，而不是放到前端或公开仓库里。

## 五、后续扩展

如果以后要换模型，只需要新增一个实现，例如 `AnthropicAdapter` 或 `OpenAICompatibleAdapter`，再通过 `AI_PROVIDER` 选择即可。评分、结果页、聊天页和题库逻辑都不需要跟着改。
