# MIRROR AI Chat — Prompt 深度优化方案

> 覆盖三块：ROS 问诊层 / portrait-reader 注入 / triage 意图匹配
> 可直接替换对应文件

---

## 一、ROS 问诊层（`ros_chat_layers.py`）

### 问题

- 触发靠 prefill 字符串匹配，脆而窄
- 注入只有写作规范，没有告诉模型**用哪些数据、怎么用**
- 双人报告场景（层间差距）没有专用指令
- 盲区提示场景与普通层探索混用同一模板

### 改写：`build_ros_inquiry_layer()`

```python
# backend/app/ros_chat_layers.py

ROS_SINGLE_LAYER_TEMPLATE = """
【ROS 关系报告深探层 · 当前聚焦：{layer_label}】
禁止重算分数 / 禁止暴露层级编号（AT/IN/CO/EV/RK）给用户

--- 本层画像原子 ---
{layer_atoms}

--- 跨层关联线索（用于纵深追问，不主动全报） ---
{cross_layer_hints}

--- 本轮回答规范 ---
1. 开头用一句话承接用户在这一层的具体感受，不泛泛共情
2. 用本层原子作为依据给洞察，禁止逐字复读报告
3. 得分区间（{score_band}）用自然语言描述倾向，不报具体数字
4. 以一个开放问题收尾，问题引导用户往相邻层延伸
5. 字数 80–140；短句为主
"""

ROS_BLIND_SPOT_TEMPLATE = """
【ROS 盲区提示深探层】
禁止重算分数 / 禁止暴露维度编号

--- 用户盲区原子 ---
{blind_spot_atoms}

--- 自报与行为暗示的落差证据 ---
{gap_evidence}

--- 本轮回答规范 ---
1. 先说「你自己说的」和「行为暗示」之间的具体落差是什么
2. 不评判对错，给一个「为什么会有这个落差」的解读
3. 提一个可观察的验证点（用户自己能在接下来一周内看到的）
4. 字数 80–140；禁止说「你在骗自己」等评判性用语
"""

ROS_COUPLE_GAP_TEMPLATE = """
【ROS 双人层间差距深探层 · 层级：{layer_label}】
禁止重算分数 / 禁止暴露层级编号 / 不做道德裁判

--- 用户本层原子 ---
{user_layer_atoms}

--- 伴侣本层原子 ---
{partner_layer_atoms}

--- 差距核心 ---
{gap_summary}

--- 本轮回答规范 ---
1. 描述两人在这一层的「不同语言」是什么（不是谁对谁错）
2. 给一个差距为什么会产生的结构性解读
3. 提一个双方都能尝试的具体沟通动作
4. 字数 100–160；禁止说「你们不合适」等绝对结论
"""

def build_ros_inquiry_layer(user_message: str, attempt: dict) -> str:
    """
    触发条件（优先级从高到低）：
    1. prefill 匹配「双人报告」「层间差距」→ ROS_COUPLE_GAP_TEMPLATE
    2. prefill 匹配「盲区提示」→ ROS_BLIND_SPOT_TEMPLATE
    3. prefill 匹配具体层级标签 → ROS_SINGLE_LAYER_TEMPLATE
    4. 无 prefill 但有 ROS attempt → 轻量版（只注入 cross_layer_hints）
    """
    ...
```

### 触发规则重构

```python
# 替换原有字符串匹配，改为意图分类

ROS_TRIGGER_PATTERNS = {
    "couple_gap": [
        r"层间差距", r"双人报告", r"他/她的.*和我的", r"我们俩.*不同"
    ],
    "blind_spot": [
        r"盲区提示", r"盲区", r"自报.*行为", r"落差"
    ],
    "single_layer": {
        "AT": [r"吸引", r"喜欢我吗", r"有没有感觉"],
        "IN": [r"互动", r"沟通", r"说话方式", r"相处"],
        "CO": [r"兼容", r"合不合适", r"价值观"],
        "EV": [r"演化", r"未来", r"发展", r"走向"],
        "RK": [r"风险", r"红旗", r"危险信号", r"该不该继续"],
    }
}

def classify_ros_intent(prefill: str, user_message: str) -> tuple[str, str | None]:
    """返回 (intent_type, layer_code | None)"""
    text = (prefill or "") + user_message
    if any(re.search(p, text) for p in ROS_TRIGGER_PATTERNS["couple_gap"]):
        return "couple_gap", None
    if any(re.search(p, text) for p in ROS_TRIGGER_PATTERNS["blind_spot"]):
        return "blind_spot", None
    for layer_code, patterns in ROS_TRIGGER_PATTERNS["single_layer"].items():
        if any(re.search(p, text) for p in patterns):
            return "single_layer", layer_code
    return "none", None
```

---

## 二、Portrait-Reader 注入（`chat_prompt_layers.py`）

### 问题

- portrait-reader 和 profile_block 去重逻辑只在注释里，代码层没有强制执行
- portrait-reader 把所有套的 headline 都列出来，token 浪费且干扰焦点
- 没有「何时引入跨套线索」的指令，模型不知道 cross_model_summary 什么时候用
- 画像原子是键值对格式，模型容易直接复读字段名

### 改写：`build_portrait_reader_layer()`

```python
# backend/app/chat_prompt_layers.py

PORTRAIT_READER_WITH_ATTEMPT = """
【跨套画像摘要 · 补充视角层】
当前对话已绑定：{bound_suite_label}（详细画像见 profile_block）
以下为其他已完成套件的摘要，仅作补充，不重复 profile_block 内容

{other_suite_headlines}

跨套联动线索（优先用于「为什么总是这样」类模式追问）：
{cross_model_summary}

使用规范：
- 用户问当前套（{bound_suite_label}）相关问题：不引用本层，以 profile_block 为准
- 用户问模式/根源/为什么反复：优先引用跨套联动线索
- 用户问其他套细节：可轻度引用 other_suite_headlines，但提醒「这套没有绑定，细节有限」
"""

PORTRAIT_READER_NO_ATTEMPT = """
【跨套画像摘要 · 主要画像层】
用户已完成以下套件，以下为综合摘要：

{all_suite_headlines}

跨套联动线索：
{cross_model_summary}

使用规范：
- 回答时优先织入与用户问题最相关的套件线索
- 跨套联动线索用于模式类、根源类问题
- 禁止报具体分数和维度编号
- 禁止说「根据你的测试」「你的数据显示」等暴露系统感的句式
  → 改用：「从你描述的方式来看」「你提到的这个倾向」
"""

PORTRAIT_READER_NO_DATA = """
【画像状态：用户尚未完成任何套件】
- 完全基于对话内容回答
- 不说「你还没有画像」「等你完成测试」等催促话术
- 可在合适时机自然提及：「如果你做过 SELF 测评，我们可以看得更深」
- 禁止说「尚未接入数据」
"""

def build_portrait_reader_layer(
    portrait: dict,
    bound_suite: str | None,
    cross_model_summary: list[str]
) -> str:
    if not portrait:
        return PORTRAIT_READER_NO_DATA

    other_headlines = _build_other_suite_headlines(portrait, exclude=bound_suite)
    cross_summary = _format_cross_summary(cross_model_summary)

    if bound_suite:
        return PORTRAIT_READER_WITH_ATTEMPT.format(
            bound_suite_label=_suite_label(bound_suite),
            other_suite_headlines=other_headlines or "（暂无其他已完成套件）",
            cross_model_summary=cross_summary,
        )
    else:
        return PORTRAIT_READER_NO_ATTEMPT.format(
            all_suite_headlines=_build_all_suite_headlines(portrait),
            cross_model_summary=cross_summary,
        )
```

### Headline 格式标准化

```python
def _build_suite_headline(suite_code: str, suite_data: dict) -> str:
    """
    输出格式（自然语言，不暴露字段名）：

    · SELF：你在自我关系上的底色是「{attachment_type}」——{one_line_theme}
    · ROS：这段关系目前的主型是「{relationship_type}」，处于{stage}阶段
    · MATE：在择偶市场上，你的位置偏向{quadrant_narrative}

    禁止输出：SA1/RK/FS 等编号、具体分数、JSON 字段名
    """
    ...
```

### 画像原子自然语言化

```python
# 原始注入（问题版）：
# trait_atoms：高吸引低亲密、阶段·磨合阵痛

# 改为注入前转换：
ATOM_NATURALIZER_PROMPT = """
将以下画像原子转换为自然语言线索，供顾问内部参考。
要求：用「你/ta」视角，不暴露字段名，每条 15 字以内。

输入：{atoms}
输出：转换后的自然语言列表
"""

# 或者直接在 Python 层维护映射表（推荐，不消耗 LLM token）：
ATOM_NATURAL_MAP = {
    "高吸引低亲密": "彼此有吸引力，但情感亲密还没跟上",
    "阶段·磨合阵痛": "正处于从热恋进入磨合的转折点",
    "冲突后各自消化": "吵完之后两个人都倾向于自己消化，不主动修复",
    "共鸣·温柔磨合": "整体关系基调是温柔的，但有摩擦在消化中",
    "依恋底色偏焦虑": "在关系里容易担心失去连接，需要更多确认",
    ...
}
```

---

## 三、Triage 意图匹配（`chat_prompt_layers.py`）

### 问题

- 纯关键词计分，歧义多（「我不想分手」被分到 haven）
- 没有否定词处理
- 中英混排、缩写、隐喻完全漏掉
- 相似度高的信号无法区分主次
- 无置信度兜底逻辑

### 改写：三阶段 Triage

#### 阶段一：否定词前置过滤（立即可做）

```python
NEGATION_PATTERNS = [
    r"不想(分手|崩溃|哭|放弃)",
    r"没有(在哭|崩|失恋)",
    r"只是想(分析|聊聊|了解)",
    r"不是.*问题.*是.*",
]

def strip_negated_signals(message: str) -> str:
    """把否定语境里的关键词 mask 掉再做关键词匹配"""
    for pattern in NEGATION_PATTERNS:
        message = re.sub(pattern, "[NEGATED]", message)
    return message
```

#### 阶段二：意图模板匹配（低成本升级）

```python
# 比关键词更精准，比 LLM 更快

INTENT_TEMPLATES = {
    "haven": [
        # 情绪崩溃
        (r"(刚|刚刚).*(分手|被甩|被拒)", 0.9),
        (r"(哭|崩|难受|睡不着).*(好久|很久|一直|整晚)", 0.85),
        (r"(陪|陪我|在吗|我很难受)", 0.8),
        # 长期压抑
        (r"(憋|压抑|说不出口).*(好久|很久|一直)", 0.75),
    ],
    "oracle": [
        # 值不值得
        (r"(值不值得|要不要继续|还有没有必要)", 0.9),
        (r"(他到底|她到底).*(喜不喜欢|什么意思|啥意思)", 0.85),
        (r"(信号|暗示|什么意思).*(看不懂|不确定|搞不清)", 0.8),
        # 择偶
        (r"(追|表白|要不要).*(时机|时间|现在)", 0.75),
    ],
    "darwin": [
        # 恋爱脑 / 止损
        (r"(知道.*(不好|有问题)|明明.*(不对|不合适)).*(就是|但是|可是)", 0.9),
        (r"(沉没成本|放不下|走不了|离不开)", 0.85),
        (r"(消耗|内耗|很累).*(还在|还没走|不知道怎么)", 0.8),
        # 位置判断
        (r"(我是不是.*(备胎|将就|凑合))", 0.85),
    ],
    "sage": [
        # 模式 / 根源
        (r"(为什么.*(总是|一直|反复|每次))", 0.9),
        (r"(依恋|模式|根源|深层)", 0.85),
        (r"(为什么我.*(这样|会这样|老是这样))", 0.8),
    ],
}

def match_intent_templates(message: str) -> dict[str, float]:
    """返回各顾问的意图得分，取最高匹配权重"""
    scores = {k: 0.0 for k in INTENT_TEMPLATES}
    clean = strip_negated_signals(message)
    for counselor, patterns in INTENT_TEMPLATES.items():
        for pattern, weight in patterns:
            if re.search(pattern, clean):
                scores[counselor] = max(scores[counselor], weight)
    return scores
```

#### 阶段三：LLM 分类兜底（置信度低时触发）

```python
TRIAGE_LLM_PROMPT = """
你是 MIRROR 平台的分诊系统。根据用户消息，判断最适合的顾问。

四位顾问核心定位：
- haven：情绪崩溃、失恋、需要先被接住、长期压抑
- oracle：值不值得、信号判断、择偶策略、尊严问题
- darwin：恋爱脑、依赖模式、止损判断、关系位置
- sage：为什么总这样、依恋根源、模式分析、深层结构

用户消息：{message}

只输出 JSON，格式：
{
  "counselor": "haven|oracle|darwin|sage",
  "confidence": 0.0-1.0,
  "reason": "10字以内"
}
"""

TRIAGE_LLM_THRESHOLD = 0.65  # 低于此置信度时调用 LLM

async def triage_counselor_v2(message: str) -> TriageResult:
    # 1. 否定词过滤
    clean = strip_negated_signals(message)
    
    # 2. 关键词基础分
    keyword_scores = keyword_score(clean)  # 现有逻辑
    
    # 3. 意图模板分（权重更高）
    template_scores = match_intent_templates(message)
    
    # 4. 融合得分
    final_scores = {
        k: keyword_scores.get(k, 0) * 0.3 + template_scores.get(k, 0) * 0.7
        for k in ["haven", "oracle", "darwin", "sage"]
    }
    
    top = max(final_scores, key=final_scores.get)
    confidence = final_scores[top]
    
    # 5. 置信度低 → LLM 兜底
    if confidence < TRIAGE_LLM_THRESHOLD:
        return await triage_with_llm(message)
    
    return TriageResult(
        counselorId=top,
        confidence=confidence,
        reason=_reason(top),
        matchedSignals=_matched_signals(message, top),
        alternatives=_alternatives(final_scores, top),
    )
```

---

## 四、三块联动时的 Prompt 组装顺序

```python
# build_chat_messages() 最终建议顺序

messages = [
    {
        "role": "system",
        "content": "\n\n".join([
            analyst.system_prompt,        # 人格身份（DB，已优化版）
            MIRROR_CHAT_BASE,             # 全局规则（优先级 + 禁止项）
            mirror_tone_layer,            # 词库 + 禁止腔调
            crisis_guard_layer,           # 仅 elevated/high 注入
            agent_skill_persona,          # SKILL.md persona_prompt
        ])
    },
    {
        "role": "user",
        "content": portrait_reader_layer  # 跨套摘要（已去重）
    },
    {
        "role": "assistant",
        "content": _profile_anchor_ack(bound_suite)
        # 有绑定套："好的，我已了解你在 {suite_label} 的画像，
        #            以及其他套件的摘要线索。"
        # 无绑定套："好的，我已了解你目前的综合画像摘要。"
        # 无画像：  "好的，我们直接聊。"
    },
    {
        "role": "user",
        "content": profile_block          # 单套详情（有绑定时）
    },
    {
        "role": "assistant",
        "content": "明白，画像已记录，我不会直接复读，会在需要时织入。"
    },
    # 历史 12 轮
    *history_turns,
    # 当前消息
    {
        "role": "user",
        "content": "\n\n".join(filter(None, [
            ros_inquiry_layer,            # ROS 深探（有触发时）
            agent_skill_method,           # SKILL.md 方法论部分
            user_message,
            CHAT_ANSWER_REQUIREMENTS,
        ]))
    },
]
```

---

## 五、快速落地优先级

| 优先级 | 改动 | 文件 | 预估工时 |
|--------|------|------|----------|
| P0 | Triage 否定词过滤 + 意图模板 | `chat_prompt_layers.py` | 2h |
| P0 | Portrait-reader 去重强制执行 + 格式标准化 | `chat_prompt_layers.py` | 3h |
| P1 | ROS 触发分类重构（3 模板） | `ros_chat_layers.py` | 4h |
| P1 | 画像原子自然语言映射表 | `ai_context_assembler.py` | 3h |
| P2 | Triage LLM 兜底 | `chat_prompt_layers.py` | ✅ `triage_with_llm()` · `TRIAGE_USE_LLM` · 阈值 0.65 |
| P3 | Profile anchor ack 动态化 | `chat_context.py` | ✅ |
