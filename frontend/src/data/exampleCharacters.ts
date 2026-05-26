import type { SelfDimensionCode } from "@/data/selfSuiteSpec";
import type { Behavior, Insight } from "@/data/mockResult";

export type ExampleSuiteTab = "self" | "ros" | "mate";

export type ExampleRosSpec = {
  partner: string;
  relationshipNote: string;
  typeName: string;
  typeOneLiner: string;
  typeDescription: string;
  stageId: number;
  dims: { at: number; in: number; co: number; ev: number; rk: number };
  weather: { icon: "sun" | "cloud-sun" | "cloud" | "cloud-rain" | "cloud-lightning"; label: string; sub: string };
  heroQuote: string;
  insights: Array<{ kind: "strength" | "watch" | "advice" | "action"; title: string; body: string }>;
  blindSpot?: string;
};

export type ExampleMateSpec = {
  positionName: string;
  quadrantDesc: string;
  tagline: string;
  tags: string[];
  assets: Array<{ label: string; summary: string; role: string }>;
  axisX: number;
  axisY: number;
  marketInsight: string;
  moduleScores: Array<{ code: string; label: string; score: number; tag: string; evidence: string }>;
  reverseFront: string;
  reverseBack: string;
  adviceGood: string;
  adviceWarning: string;
  matchZone: string;
  socialQuote: string;
};

export type ExampleCharacter = {
  id: string;
  name: string;
  gender: "female" | "male";
  epithet: string;
  hue: number;
  /** 首页卡片：若 TA 来做我们的测评… */
  hook: string;
  /** 详情页导语 */
  intro: string;
  attachment: string;
  selfScores: Record<SelfDimensionCode, number>;
  /** Hero：第三人称依恋摘要 */
  attachmentSummary: string;
  /** Act II 揭晓：红楼文学金句（第三人称） */
  redChamberLine: string;
  /** 人物侧写引语 */
  literaryQuote: string;
  /** Act I：若 TA 来做 SELF 的三卡特质（人物分析，非红楼对照） */
  profileTraits: Array<{
    icon?: "shield" | "key" | "eye";
    title: string;
    body: string;
    highlight?: boolean;
    source_dimension?: string;
  }>;
  /** Act II：红楼谱系对照（文学 + 体系，不与 profileTraits 重复） */
  mirrorReasons: Array<{ title: string; body: string; highlight?: boolean }>;
  /** Act III：分析师摘要（第三人称） */
  analystHighlights: Insight[];
  /** Act I 场景模拟（第三人称） */
  profileBehaviors: Behavior[];
  ros: ExampleRosSpec;
  mate: ExampleMateSpec;
};

export const EXAMPLE_CHARACTERS: ExampleCharacter[] = [
  {
    id: "lin-daiyu",
    name: "林黛玉",
    gender: "female",
    epithet: "绛珠仙草 · 深情敏感者",
    hue: 360,
    hook: "若黛玉来做 SELF，几乎一定是焦虑型——她把感情当真，也最容易在沉默里读出一整出戏。",
    intro:
      "红楼里最会把「我爱你」写进细节里的人。SELF 会看见她的敏感与边界，ROS 会照出她和宝玉之间「越在乎越疼」的循环，MATE 则会把她放在关系市场里：不是不够好，而是太需要被正确打开。",
    attachment: "焦虑型",
    selfScores: { SA1: 62, SA2: 38, SA3: 58, SA4: 55, SA5: 48, SA6: 88 },
    attachmentSummary: "她把感情看得比任何人都重；爱得深，所以也更容易在沉默里读出整出戏。",
    redChamberLine: "她不是不够好——她是把整颗心都交出去的人，于是每一次被忽略，都像在确认自己值不值得。",
    literaryQuote: "她哭的不是小事，是「你明知道我会在意，却还要那样做」。",
    profileTraits: [
      {
        highlight: true,
        icon: "shield",
        title: "细节是她的语言",
        source_dimension: "sa6",
        body: "黛玉很少直说「我在乎你」，却会在花谢、冷箭、一句没接住的玩笑里，把整颗心翻出来。测评里她的关系投入几乎拉满——不是黏，是认定了就不会省着爱。",
      },
      {
        icon: "key",
        title: "爱是真的，出口却窄",
        source_dimension: "sa5",
        body: "情绪调节偏低，意味着高浓度情感找不到稳定通道。她常常先在身体里感到受伤，再在嘴里说出伤人的话——这不是刻薄，是来不及把自己的需要翻译清楚。",
      },
      {
        icon: "eye",
        title: "敏感是她的雷达",
        source_dimension: "sa2",
        body: "依恋焦虑偏高——她比多数人更早进入「这段关系对我很重要」。别人还在装平静，她已经在心里排练分离——问题不在敏感，在于有没有可验证的回应。",
      },
    ],
    mirrorReasons: [
      {
        highlight: true,
        title: "绛珠仙草的还债逻辑",
        body: "在红楼谱系里，黛玉代表「把缘分当真到愿意为之损耗」的一类人。不是戏剧性的多情，而是哲学性的认真：爱一人，就默认这套关系值得用尽余生的注意力。",
      },
      {
        title: "质本洁来，却不善「求」",
        body: "她的「洁」不是孤僻，是标准高到懒得敷衍。系统把她归在焦虑型，不是因为脆弱，而是因为她拒绝用「差不多」来交换安全感——宁可疼，也不装没事。",
      },
      {
        title: "和「托底型」的天然张力",
        body: "若把宝钗读成「稳住局面的人」，黛玉就是「要你看见我正在坠落的人」。红楼里最经典的误读，就是把她的认真叫成矫情——测评档案里，同样存在被误读的风险。",
      },
    ],
    analystHighlights: [
      {
        kind: "strength",
        title: "情感浓度",
        body: "关系投入极高——会把整颗心交出去。这种认真在当代关系里稀缺，值得被同样认真的人接住，而不是被劝「想开点」。",
      },
      {
        kind: "watch",
        title: "沉默里的剧本",
        body: "情绪调节与依恋焦虑叠加，容易在对方没回消息、语气变冷的几分钟里，补全最坏版本。不是不信任，是太需要被看见。",
      },
      {
        kind: "match",
        title: "谁能接住她",
        body: "稳定、边界清晰、愿意主动给确认的人——不是要她少爱，而是让她的爱有回应、有证据，而不是靠猜。",
      },
      {
        kind: "growth",
        title: "若关系还要继续",
        body: "把「我需要一点确认」说成一句话，比用试探和冷脸绕圈子更有效。她的真心，值得被直接回应，而不是被讲道理。",
      },
    ],
    profileBehaviors: [
      {
        scene: "冲突",
        title: "她在等一个人追上来",
        body: "当宝玉当众给了别人更多耐心，黛玉往往不会立刻大吵。她会冷下来、说反话，或者借一件极小的事离场——那时她其实在等：宝玉看见她的在意了吗？",
      },
      {
        scene: "分离",
        title: "不确定性会先伤到她",
        body: "长期悬而未决的关系会磨损她。不是不想信任，是大脑会先播放最坏版本，好让自己不被突然的伤害击穿——这让她看起来「难搞」，其实是怕。",
      },
      {
        scene: "亲密",
        title: "安全时，她的好很具体",
        body: "一旦感到被认真对待，她会记得偏好、听得懂沉默、在细节里回馈双倍用心。认定了，就是整颗心的认定——没有「差不多就好」。",
      },
    ],
    ros: {
      partner: "贾宝玉",
      relationshipNote: "假设场景：与宝玉交往 1–2 年，进入「在乎但说不出口」的阶段",
      typeName: "难舍难分",
      typeOneLiner: "彼此都知道重要，却总在表达方式上错位",
      typeDescription:
        "吸引还在，互动被「猜心」拖低。两人不是不爱，是爱的语言不同频——黛玉要确认，宝玉怕压力。",
      stageId: 4,
      dims: { at: 78, in: 52, co: 61, ev: 58, rk: 68 },
      weather: { icon: "cloud-rain", label: "阵雨", sub: "有感情托底，但摩擦会反复打湿彼此" },
      heroQuote: "不是不爱，是每次靠近都像在赌对方会不会接住。",
      insights: [
        {
          kind: "strength",
          title: "吸引基础仍在",
          body: "AT 78：当初走到一起的理由还在——只是被日常误会盖住了，并没有消失。",
        },
        {
          kind: "watch",
          title: "互动质量是瓶颈",
          body: "IN 52：「沉默→脑补→爆发」循环消耗最大；RK 68 提示小伤会累积，别当成「小题大做」。",
        },
        {
          kind: "advice",
          title: "关系处方",
          body: "若继续，需要低伤害确认句——黛玉要的是「你还在」，不是全盘解释。",
        },
      ],
      blindSpot: "黛玉以为自己在表达，宝玉却只收到压力——同样的在意，两种语言。",
    },
    mate: {
      positionName: "需要被正确打开的人",
      quadrantDesc: "第一眼未必惊艳全场，深度连接后价值陡增",
      tagline: "不是冷，是门槛高；一旦进了她心里，留存率惊人。",
      tags: ["高情感浓度", "慢热深度", "误读风险"],
      assets: [
        { label: "情感资产", summary: "极高", role: "真心与细节记忆" },
        { label: "表达出口", summary: "偏窄", role: "需要安全通道" },
        { label: "长期留存", summary: "强", role: "认定后极忠诚" },
      ],
      axisX: 72,
      axisY: 58,
      marketInsight:
        "你的气质和才识会被记住；真正拖后腿的是「第一印象像难靠近」。对的人需要耐心，错的人容易把你归类为「太敏感」。",
      moduleScores: [
        { code: "FS1", label: "吸引力资产", score: 74, tag: "气质型", evidence: "才识与存在感强，但不会主动推销自己" },
        { code: "FS2", label: "情感价值输出", score: 86, tag: "高供给", evidence: "情绪滋养与深度理解是核心竞争力" },
        { code: "FS3", label: "现实自主性", score: 52, tag: "中等", evidence: "精神独立，现实托底需加强叙事" },
        { code: "FS4", label: "社交可见度", score: 48, tag: "偏低", evidence: "不爱混局，容易被低估" },
        { code: "FS5", label: "相处风险", score: 62, tag: "需管理", evidence: "情绪波动会被误读为「难搞」" },
      ],
      reverseFront: "外界误读：太敏感、难伺候、情绪不稳定",
      reverseBack: "真实机制：你不是在刁难谁，而是在用极端认真保护极端在乎；被好好对待时，你其实是最好相处的人。",
      adviceGood: "适合找会主动给确认、不把敏感当缺陷的人。",
      adviceWarning: "别在不对等的关系里反复证明「你值得被认真对待」。",
      matchZone: "稳定、耐心、能接细节的人——温度带：70–85 分共鸣区",
      socialQuote: "看起来需要被哄，其实只需要被认真对待。",
    },
  },
  {
    id: "xue-baichai",
    name: "薛宝钗",
    gender: "female",
    epithet: "蘅芜君 · 稳定托底者",
    hue: 285,
    hook: "SELF 会把她归到安全型——不是没情绪，是把锋利收起来，给关系一个不碎的底。",
    intro:
      "宝钗是关系里的「压舱石」。SELF 看见她的稳定与边界，ROS 照出她在宝玉关系里的「温水同行」——不是没诉求，是更懂节奏；MATE 则会把她放进市场坐标：让人想留下来的人。",
    attachment: "安全型",
    selfScores: { SA1: 78, SA2: 72, SA3: 68, SA4: 82, SA5: 76, SA6: 70 },
    attachmentSummary: "她不是没有情绪，只是把锋利收起来——给关系一个不会碎的底。",
    redChamberLine: "蘅芜君的暖，不是表演出来的周全，是让人敢把日子交给她的那种稳。",
    literaryQuote: "她不抢、不闹、不刻意——却让身边的人都觉得，有她在，就有底。",
    profileTraits: [
      {
        highlight: true,
        icon: "shield",
        title: "稳，是礼物不是表演",
        source_dimension: "sa4",
        body: "自我边界与情绪调节双高——冲突里她先降温再谈事。这不是冷，是成熟关系里最稀缺的底盘：不让情绪烧坏连接。",
      },
      {
        icon: "key",
        title: "理性是她的保护色",
        source_dimension: "sa3",
        body: "依恋回避中等偏低——她能亲密，也需要节奏。宝钗不会用夸张证明爱，但「在场」本身就是语言：事情会落地，话不会悬空。",
      },
      {
        icon: "eye",
        title: "退一步，比赢更重要",
        source_dimension: "sa6",
        body: "关系投入稳健而不泛滥。她懂得在关系里保存余地——不是没诉求，是知道什么时候争输赢，什么时候保关系。",
      },
    ],
    mirrorReasons: [
      {
        highlight: true,
        title: "「冷香」背后的托底逻辑",
        body: "宝钗在谱系里代表「把关系过成日子」的人。不是没感受，是把感受整理成可执行的照顾——这让她成为红楼里最像「长期伴侣原型」的女性角色。",
      },
      {
        title: "和「浓烈型」的互补轴",
        body: "若黛玉是「要你看见我坠落」，宝钗就是「我来把地面铺平」。系统把她归在安全型，因为她默认：关系要可持续，而不是每集都高潮。",
      },
      {
        title: "被误读的「懂事」",
        body: "世人爱说她「太正确」——但在档案里，这种正确不是没个性，而是把个性藏在低波动的高效用里。懂她的人，会把她列为最高优先级。",
      },
    ],
    analystHighlights: [
      { kind: "strength", title: "托底能力", body: "边界与调节组合，让她既能给安全感，又不让人窒息——是让人想留下来的那种稳。" },
      { kind: "watch", title: "克制的代价", body: "表达偏节制时，对方可能误读为「不够爱」。偶尔露出 10% 脆弱，不等于示弱，而是邀请。" },
      { kind: "match", title: "合拍对象", body: "能接她的稳定，也受得住她偶尔柔软的人——不需要她表演热烈，也能看见她的好。" },
      { kind: "growth", title: "关系里的提醒", body: "别把「合适」当成关系的全部——稳定是礼物，偶尔的心跳仍然值得主动经营。" },
    ],
    profileBehaviors: [
      { scene: "冲突", title: "她先修气氛，再谈道理", body: "宝钗很少在情绪峰值时硬碰硬。她会倒水、换话题、给台阶——不是逃避，是给双方留一条不撕破脸的路。" },
      { scene: "日常", title: "爱落在具体里", body: "她记得场合、分寸、谁需要被照顾。她的好不是宣言式的，是「事情已经办妥了」式的。" },
      { scene: "亲密", title: "需要被主动选择", body: "她能给托底，也需要偶尔听见「我选你」——否则关系容易被「合适」定义，而少了被渴望的温度。" },
    ],
    ros: {
      partner: "贾宝玉",
      relationshipNote: "假设场景：与宝玉长期相处，进入「默契但缺火花」的平稳期",
      typeName: "温水同行",
      typeOneLiner: "稳定、可持续，但需要主动注入「被选择感」",
      typeDescription: "兼容度不错，冲突处理成熟；风险在于把「不折腾」误当成「不需要确认」。",
      stageId: 3,
      dims: { at: 68, in: 74, co: 78, ev: 72, rk: 42 },
      weather: { icon: "cloud-sun", label: "多云转晴", sub: "有小摩擦，但整体往长期走" },
      heroQuote: "像一对能过日子的搭档——别忘记，搭档也需要偶尔的心跳。",
      insights: [
        { kind: "strength", title: "兼容与互动", body: "CO 78 · IN 74：日常相处质量高，价值观摩擦少——宝钗的稳，是这段关系的底盘。" },
        { kind: "watch", title: "吸引维护", body: "AT 68：新鲜感需要主动经营，否则关系会被「合适」慢慢定义。" },
        { kind: "action", title: "下一步", body: "每月一次非日常约会或深谈，让宝玉听见「我选你」——稳定是礼物，心跳仍要经营。" },
      ],
    },
    mate: {
      positionName: "让人想留下来的人",
      quadrantDesc: "长期关系里的高留存型",
      tagline: "第一眼未必最亮，相处越久越觉得「离不开」。",
      tags: ["高留存", "低波动", "托底型"],
      assets: [
        { label: "稳定供给", summary: "极高", role: "情绪与日常托底" },
        { label: "边界感", summary: "清晰", role: "不纠缠、不内耗" },
        { label: "市场显示", summary: "中上", role: "越了解越值钱" },
      ],
      axisX: 68,
      axisY: 76,
      marketInsight: "现实托底感是核心卖点——靠谱、能落地、能一起过日子；存在感靠口碑而非张扬。",
      moduleScores: [
        { code: "FS1", label: "吸引力资产", score: 68, tag: "耐看型", evidence: "气质温润，越相处越有光" },
        { code: "FS2", label: "情感价值输出", score: 80, tag: "托底", evidence: "稳定回应，不制造 drama" },
        { code: "FS3", label: "现实自主性", score: 78, tag: "强", evidence: "生活自理与家庭助力平衡" },
        { code: "FS4", label: "社交可见度", score: 62, tag: "稳", evidence: "场面得体，不抢风头" },
        { code: "FS5", label: "相处风险", score: 35, tag: "低", evidence: "波动小，长期持有友好" },
      ],
      reverseFront: "外界误读：太懂事、没个性、像「合适」不像「心动」",
      reverseBack: "真实机制：你的好是慢释放型——懂你的人，会把你列为「最高优先级」。",
      adviceGood: "适合找看重长期、能欣赏稳定的人。",
      adviceWarning: "别为了更讨人喜欢，把自己磨平——你的稳不是没个性，是慢释放型的好。",
      matchZone: "成熟、务实、能共建的人——温度带：75–90",
      socialQuote: "乍看普通，处久了才发现是「想娶回家」那一型。",
    },
  },
  {
    id: "shi-xiangyun",
    name: "史湘云",
    gender: "female",
    epithet: "枕霞旧友 · 真实热烈者",
    hue: 200,
    hook: "SELF 多半判为混合型——热烈、直率、边界灵活，像一团会呼吸的火。",
    intro:
      "湘云是关系里的「生命力」。SELF 看见她的混合依恋与真实，ROS 会是「此刻刚好」式的轻松关系；MATE 则对应「一眼就懂的人」——不需要太多铺垫，同频就能玩在一起。",
    attachment: "混合型",
    selfScores: { SA1: 70, SA2: 58, SA3: 62, SA4: 66, SA5: 68, SA6: 76 },
    attachmentSummary: "她的热烈和撤回都是真的——复杂，才是完整的她。",
    redChamberLine: "枕霞旧友的热闹不是浮，是生命力；认真起来，比很多人都专情。",
    literaryQuote: "她喝酒、说笑、什么都敢——但认真起来，比谁都真。",
    profileTraits: [
      {
        highlight: true,
        icon: "shield",
        title: "热络，但不黏",
        source_dimension: "sa4",
        body: "混合型依恋加上灵活边界——湘云能靠近也能独立。她不会用「24 小时在线」证明爱，但她在场时，场子会亮。",
      },
      {
        icon: "key",
        title: "直率是最好的筛选器",
        body: "她很少长期伪装。关系里的湘云接近真实状态——这能帮她快速识别谁接得住她的火，谁只想要她的乖。",
      },
      {
        icon: "eye",
        title: "有趣是硬通货",
        source_dimension: "sa6",
        body: "关系投入高且带温度。她让人放松，又想靠近——不是因为她完美，而是因为她真。",
      },
    ],
    mirrorReasons: [
      {
        highlight: true,
        title: "「枕霞」式的生命力",
        body: "湘云在谱系里代表「把真实当魅力」的人。红楼里她最像现代意义上的「高社交价值 + 低内耗」——前提是遇见懂她的人。",
      },
      {
        title: "混合型的完整叙事",
        body: "系统不会把她锁死在单一标签：她既能热烈，也需要空间。这不是不稳定，是不愿为了好相处而削平自己。",
      },
      {
        title: "被低估的深度",
        body: "外人爱把她读成「只会玩」——但史湘云的泪、义、认定，都在故事里。档案提醒：别因为热闹，错过她的专情。",
      },
    ],
    analystHighlights: [
      { kind: "strength", title: "真实与趣味", body: "关系里既有温度也有呼吸感——她是让人想继续聊下去的那种人。" },
      { kind: "watch", title: "状态切换", body: "波动时，她需要对方分清：此刻要的是空间还是连接——而不是被说「你怎么又变了」。" },
      { kind: "match", title: "合拍对象", body: "能接她的热烈，也尊重她独立一面的人——同频比一致更重要。" },
      { kind: "growth", title: "长期关系", body: "保持「好玩」，也留严肃对话的时间——避免只有热闹，没有未来。" },
    ],
    profileBehaviors: [
      { scene: "社交", title: "她是场子的发动机", body: "湘云一出现，气氛就活。她不是靠抢话，是靠真觉得好玩——这种轻松会传染。" },
      { scene: "冲突", title: "她会先退，再决定", body: "被误解时，湘云可能用玩笑挡一下，也可能突然冷下来。那不是作，是在测：对方还要不要懂她？" },
      { scene: "亲密", title: "认定后很专情", body: "她玩世不恭的外壳下，对认定的人会极认真——只是不轻易认定。" },
    ],
    ros: {
      partner: "卫若兰（理想同频对象）",
      relationshipNote: "假设场景：与性情相投的伴侣，关系轻盈但有深度",
      typeName: "此刻刚好",
      typeOneLiner: "不必证明，在一起就舒服",
      typeDescription: "吸引与互动平衡，冲突不多——湘云与伴侣像「玩得到一起，也聊得到一起」的朋友型恋人。",
      stageId: 2,
      dims: { at: 76, in: 80, co: 74, ev: 78, rk: 38 },
      weather: { icon: "sun", label: "晴", sub: "整体轻盈，适合继续加深" },
      heroQuote: "好的关系不一定轰轰烈烈，但一定要真——湘云最吃这一套。",
      insights: [
        { kind: "strength", title: "互动质量高", body: "IN 80：相处体验是核心优势——同频的人，和她在一起会轻松。" },
        { kind: "advice", title: "长期提醒", body: "保持「好玩」，也留严肃对话的时间——避免只有热闹，没有未来。" },
      ],
    },
    mate: {
      positionName: "一眼就懂的人",
      quadrantDesc: "社交场里的高识别度",
      tagline: "不必解释太多，同频的人自然会靠近。",
      tags: ["高趣味", "低内耗", "社交友好"],
      assets: [
        { label: "话题密度", summary: "高", role: "能热场也能深聊" },
        { label: "边界", summary: "灵活", role: "亲而不腻" },
        { label: "新鲜感", summary: "强", role: "关系不易腻" },
      ],
      axisX: 82,
      axisY: 64,
      marketInsight: "你容易被记住、被喜欢——这是你的优势；长期要看能否把「好玩」升级成「可共建」。",
      moduleScores: [
        { code: "FS1", label: "吸引力资产", score: 80, tag: "明亮", evidence: "存在感与外形气质在线" },
        { code: "FS2", label: "情感价值输出", score: 78, tag: "有趣", evidence: "情绪价值+话题质量" },
        { code: "FS3", label: "现实自主性", score: 66, tag: "中上", evidence: "独立但不过度功利" },
        { code: "FS4", label: "社交可见度", score: 84, tag: "高", evidence: "场子上的「让人想认识」" },
        { code: "FS5", label: "相处风险", score: 40, tag: "低", evidence: "直率有时伤人，但无恶意" },
      ],
      reverseFront: "外界误读：太野、不够稳、像「只能玩」",
      reverseBack: "真实机制：你的轻不是浮——认真起来，比很多人都专情。",
      adviceGood: "找能接梗也能谈未来的人。",
      adviceWarning: "你若长期迎合氛围、压抑严肃需求，关系只剩热闹，没有未来。",
      matchZone: "同频、幽默、尊重边界的人",
      socialQuote: "见面三分钟就知道能不能玩到一起。",
    },
  },
  {
    id: "wang-xifeng",
    name: "王熙凤",
    gender: "female",
    epithet: "凤辣子 · 高边界掌控者",
    hue: 45,
    hook: "SELF 会落在高边界安全型——清醒、有标准、不将就，爱得现实也绝对忠诚。",
    intro:
      "凤姐是关系里的「操盘手」。SELF 看见她的边界与掌控，ROS 若放在与贾琏的关系里会是「十字路口」——有过放弃念头但仍评估价值；MATE 则是「越了解越值钱的人」——第一眼可能怕，深交才知道能办事。",
    attachment: "高边界安全型",
    selfScores: { SA1: 74, SA2: 70, SA3: 72, SA4: 88, SA5: 80, SA6: 65 },
    attachmentSummary: "她清楚自己要什么，不会被一时氛围带跑——边界不是冷漠，是对关系和自己的尊重。",
    redChamberLine: "凤辣子的笑里藏刀，也藏义——亏她的记一辈子，帮她的也记一辈子。",
    literaryQuote: "她笑里藏刀，也藏义——亏她的她记一辈子，帮她的她也记一辈子。",
    profileTraits: [
      {
        highlight: true,
        icon: "shield",
        title: "标准即筛选",
        source_dimension: "sa4",
        body: "自我边界极高——凤姐快速判断对方是否尊重她的标准。进门槛高，但认定后极护短。",
      },
      {
        icon: "key",
        title: "不被情绪裹挟",
        source_dimension: "sa5",
        body: "情绪调节强。冲突里她能把问题拉回可讨论范围——不是没感受，是不让感受替自己做主。",
      },
      {
        icon: "eye",
        title: "现实里的忠诚",
        source_dimension: "sa6",
        body: "关系投入不是最高，因为她会算——但这不是冷，是「不把命交给不对等的关系」。",
      },
    ],
    mirrorReasons: [
      {
        highlight: true,
        title: "「管家」原型",
        body: "凤姐在谱系里代表「把关系当事业经营」的人。她能把资源、场面、风险算清楚——这在红楼女性里是稀缺能力。",
      },
      {
        title: "锋面下的护短",
        body: "系统给她高边界安全型，不是因为她不需要爱，而是因为她拒绝用混乱证明爱。认定的人，她会拼命兜底。",
      },
      {
        title: "第一印象的代价",
        body: "外人怕她、误读她——但档案里，这种「带锋的存在感」反而筛掉了不对的人，留下能势均力敌的。",
      },
    ],
    analystHighlights: [
      { kind: "strength", title: "清醒与扛事", body: "边界与调节双高——关系里不内耗，能办事，也能谈规则。" },
      { kind: "watch", title: "强与靠近", body: "太「强」有时让人不敢靠近。偶尔露出柔软，是邀请，不是降格。" },
      { kind: "match", title: "合拍对象", body: "势均力敌、尊重她标准的人——不是用混乱证明爱，而是能共建规则。" },
      { kind: "growth", title: "信任议题", body: "在已失信的关系里，别无限追加沉没成本——要么重建透明，要么止损。" },
    ],
    profileBehaviors: [
      { scene: "冲突", title: "她谈规则，不只谈感受", body: "凤姐习惯把冲突翻译成「怎么办」——这高效，但有时让对方觉得被管理，而不是被理解。" },
      { scene: "场面", title: "她能撑局", body: "社交对她不是表演，是资源调度。她知道谁要什么、什么场合说什么话——这也是她的爱法之一。" },
      { scene: "亲密", title: "认定后极度护短", body: "她对认定的人会兜底到令人咋舌——前提是进了她的「自己人」名单。" },
    ],
    ros: {
      partner: "贾琏",
      relationshipNote: "假设场景：长期婚姻，信任受损后的评估期",
      typeName: "十字路口",
      typeOneLiner: "有过放弃的念头，仍在算这笔关系的账",
      typeDescription: "现实兼容还在，情感账本复杂——凤姐在评估继续的 ROI，而不只是感觉。",
      stageId: 6,
      dims: { at: 58, in: 62, co: 66, ev: 55, rk: 72 },
      weather: { icon: "cloud-lightning", label: "雷暴预警", sub: "有重启可能，但必须先过信任关" },
      heroQuote: "她不是不能忍，是不想在不对等里继续当管家。",
      insights: [
        { kind: "watch", title: "风险层偏高", body: "RK 72：未修复的背叛或失信会反复触发。" },
        { kind: "advice", title: "处方", body: "要么重建透明规则，要么止损——中间态最耗她。" },
      ],
      blindSpot: "凤姐以为自己在「管理关系」，贾琏却只感到被控制。",
    },
    mate: {
      positionName: "越了解越值钱的人",
      quadrantDesc: "能力型 · 深度价值后置",
      tagline: "第一眼可能怕，深交才知道能办事、能托底。",
      tags: ["高能力", "强边界", "现实导向"],
      assets: [
        { label: "办事能力", summary: "顶级", role: "资源与执行力" },
        { label: "社交场面", summary: "强", role: "能撑局、能谈判" },
        { label: "信任成本", summary: "高", role: "进门槛高" },
      ],
      axisX: 76,
      axisY: 82,
      marketInsight: "现实托底感是你的核心——靠谱、能办事、能托底；气场带锋，容易劝退不对的人，反而筛选精准。",
      moduleScores: [
        { code: "FS1", label: "吸引力资产", score: 72, tag: "气场", evidence: "存在感强，有记忆点" },
        { code: "FS2", label: "情感价值输出", score: 58, tag: "选择性", evidence: "对认定的人好，对其他人节能" },
        { code: "FS3", label: "现实自主性", score: 88, tag: "极强", evidence: "资源、手腕、抗风险" },
        { code: "FS4", label: "社交可见度", score: 78, tag: "高", evidence: "场面与话语权" },
        { code: "FS5", label: "相处风险", score: 55, tag: "中等", evidence: "控制欲与信任议题" },
      ],
      reverseFront: "外界误读：太强、太算计、不好惹",
      reverseBack: "真实机制：你会把关系当事业经营——认定后会极度护短。",
      adviceGood: "适合找能欣赏你能力、不试图「驯服」你的人。",
      adviceWarning: "别在已失信的关系里无限追加沉没成本。",
      matchZone: "势均力敌、透明、能共建规则的人",
      socialQuote: "怕她的人不少，真用到她的人更不少。",
    },
  },
  {
    id: "jia-baoyu",
    name: "贾宝玉",
    gender: "male",
    epithet: "怡红公子 · 用心认真者",
    hue: 320,
    hook: "SELF 对男性宝玉，常见焦虑型——重情、怕辜负、在「万人宠」与「只对一人真」之间撕裂。",
    intro:
      "宝玉是「把感情当回事」的男性样本。SELF 看见他的焦虑与投入，ROS 放在与黛玉的关系里是经典的「难舍难分」；MATE 则是「被读懂之前的人」——表面风流，实则极需要被理解。",
    attachment: "焦虑型",
    selfScores: { SA1: 68, SA2: 42, SA3: 55, SA4: 52, SA5: 50, SA6: 82 },
    attachmentSummary: "他不是滥情，是太怕辜负——所以宁愿拖延选择，也不愿选错。",
    redChamberLine: "怡红公子的「风流」是壳，里面是对一个人真正上心的笨拙。",
    literaryQuote: "他看似万花丛中，其实只对一个人真正上心。",
    profileTraits: [
      {
        highlight: true,
        icon: "shield",
        title: "重情，但怕定",
        source_dimension: "sa6",
        body: "关系投入高，但自我边界偏低——宝玉容易在「万人宠」与「只对一人真」之间撕裂，用拖延保护所有人。",
      },
      {
        icon: "key",
        title: "敏感藏在温柔里",
        source_dimension: "sa2",
        body: "依恋焦虑偏高——他在意的人一个眼神就能牵动整天。他不是没感觉，是太有感觉，却说不出口。",
      },
      {
        icon: "eye",
        title: "要读懂，不要规训",
        source_dimension: "sa5",
        body: "情绪调节一般。压力来时他倾向逃避而非正面谈——被催「长大」只会让他更退。",
      },
    ],
    mirrorReasons: [
      {
        highlight: true,
        title: "「通灵」少年的错位",
        body: "宝玉在谱系里代表「感受力极强、却缺现实轨道」的男性。他能把关系读得很细，却难把关系落到选择上——这是红楼悲剧的核心动力之一。",
      },
      {
        title: "万人迷与唯一真",
        body: "系统给他焦虑型，因为他把感情当真，却在结构压力前反复退缩。不是不想负责，是太怕任何选择都意味着辜负。",
      },
      {
        title: "被误读的风流",
        body: "外人看他「花心」，内里却是「心里只留一个位置」。档案里的误读风险：人缘很好，真实自我却藏在深处。",
      },
    ],
    analystHighlights: [
      { kind: "strength", title: "投入与细节", body: "记得偏好、感受细腻——他是会「用心认真」的人，不是不会爱，是不会选。" },
      { kind: "watch", title: "拖延的伤害", body: "回避选择会同时伤害两个人——拖延不是保护，也是伤害。" },
      { kind: "match", title: "合拍对象", body: "能接他的敏感、也逼他做清晰选择的人——温柔要有，边界也要有。" },
      { kind: "growth", title: "关系里的关键", body: "把「我需要确认」说出来，而不是用「对所有人都好」逃避对一个人负责。" },
    ],
    profileBehaviors: [
      { scene: "冲突", title: "他会逃进温柔里", body: "面对硬冲突，宝玉常转移话题、用玩笑或沉默挡过去——不是没立场，是怕立场一旦明确，就有人要受伤。" },
      { scene: "亲密", title: "认定后极深", body: "他对认定的人会记得极细的细节——问题是他常常迟迟不敢「认定」。" },
      { scene: "压力", title: "外部期待会压垮他", body: "家族、礼法、面子——这些结构压力一来，他更容易退回到「谁都不得罪」的状态。" },
    ],
    ros: {
      partner: "林黛玉",
      relationshipNote: "假设场景：与黛玉的情感纠缠期",
      typeName: "难舍难分",
      typeOneLiner: "知道彼此重要，却在表达与选择上反复错位",
      typeDescription: "吸引与情感深度都高，互动被误读和拖延消耗；宝玉与黛玉需要一次真正的「选择对话」。",
      stageId: 5,
      dims: { at: 80, in: 48, co: 58, ev: 52, rk: 70 },
      weather: { icon: "cloud-rain", label: "阴雨", sub: "感情浓，消耗也浓" },
      heroQuote: "他不是不想给，是太怕给错了就回不了头。",
      insights: [
        { kind: "watch", title: "互动与走向", body: "IN 48 · EV 52：沟通与未来方向是双瓶颈。" },
        { kind: "action", title: "行动", body: "停止用「对所有人都好」代替「对黛玉清晰」——拖延不是保护，也是伤害。" },
      ],
      blindSpot: "宝玉以为拖延是在保护，黛玉却只感到不被选择。",
    },
    mate: {
      positionName: "被读懂之前的人",
      quadrantDesc: "人缘与真实自我有时错位",
      tagline: "外面看起来不缺人喜欢，内里却在等那一个懂他的人。",
      tags: ["高显示", "低表达", "选择困难"],
      assets: [
        { label: "人缘可见度", summary: "高", role: "社交场宠儿" },
        { label: "情感专一", summary: "conditional", role: "认定后极深" },
        { label: "现实轨道", summary: "模糊", role: "需要外部结构" },
      ],
      axisX: 78,
      axisY: 54,
      marketInsight: "浪漫、审美、情绪价值强——人缘很好；长期关系需要补「可执行的未来」。",
      moduleScores: [
        { code: "MS1", label: "资源与事业轨道", score: 58, tag: "中", evidence: "家底在，个人轨道不清" },
        { code: "MS2", label: "稳定性与可靠度", score: 52, tag: "波动", evidence: "承诺履约度看对象" },
        { code: "MS3", label: "情感供给能力", score: 82, tag: "高", evidence: "细腻、记得细节" },
        { code: "MS4", label: "门面社交资本", score: 76, tag: "高", evidence: "人缘与审美" },
        { code: "MS5", label: "相处风险", score: 65, tag: "中高", evidence: "回避选择、拖延" },
      ],
      reverseFront: "外界误读：花心、不成熟、靠不住",
      reverseBack: "真实机制：你不是不能专一，是太怕伤害任何一方而迟迟不选。",
      adviceGood: "适合找能逼你清晰、也接得住你敏感的人。",
      adviceWarning: "你若用「对所有人都好」逃避对一个人负责，会同时伤害两个人。",
      matchZone: "深度理解型 + 边界清晰型",
      socialQuote: "看起来谁都能聊，其实心里只留了一个位置。",
    },
  },
  {
    id: "jia-tanchun",
    name: "贾探春",
    gender: "female",
    epithet: "蕉下客 · 清醒独立者",
    hue: 165,
    hook: "SELF 典型安全型——有原则、不内耗，像一把干净的刀，切开混账局面。",
    intro:
      "探春是「清醒女性」样本。SELF 看见她的边界与独立，ROS 会是「彼此生长」式的关系——要同频不要拖拽；MATE 对应让人想留下来的人，但带锋芒。",
    attachment: "安全型",
    selfScores: { SA1: 76, SA2: 74, SA3: 70, SA4: 86, SA5: 78, SA6: 68 },
    attachmentSummary: "清醒不是冷——她早就学会：不对的关系，越早止损越体面。",
    redChamberLine: "蕉下客不怕得罪人，怕的是把一生耗在不对等里。",
    literaryQuote: "她不怕得罪人，怕的是把一生耗在不对等里。",
    profileTraits: [
      {
        highlight: true,
        icon: "shield",
        title: "边界是自尊",
        source_dimension: "sa4",
        body: "自我边界极高——探春不将就，也不内耗。她要的是对等，不是拯救。",
      },
      {
        icon: "key",
        title: "独立，不是不需要爱",
        body: "依恋较为安全——她能亲密，也保持自主。爱对她不是失去自己，是一起把日子往前推。",
      },
      {
        icon: "eye",
        title: "能扛事",
        source_dimension: "sa5",
        body: "情绪调节强。冲突里她谈规则多于谈情绪——像队友，也像恋人。",
      },
    ],
    mirrorReasons: [
      {
        highlight: true,
        title: "「才自精明」的原型",
        body: "探春在谱系里代表「清醒女性 / 共建型伴侣」。她能把局面看穿，也敢在不对等里抽身——这在红楼里是罕见的现代性。",
      },
      {
        title: "锋芒不是冷",
        body: "系统给她安全型，因为她有稳定的内核。外人误读她「太强势」，其实是她拒绝把命运交给混账局面。",
      },
      {
        title: "合伙人式爱情",
        body: "若宝钗是托底，探春是拍板。她适合的关系叙事不是「谁宠谁」，而是「我们一起把路走出来」。",
      },
    ],
    analystHighlights: [
      { kind: "strength", title: "清醒与对等", body: "边界清晰、调节稳定——关系里势均力敌，能共建，不拖拽。" },
      { kind: "watch", title: "靠近的邀请", body: "太清醒有时让人不敢靠近——偶尔示弱不是降格，是邀请。" },
      { kind: "match", title: "合拍对象", body: "同频成长型，不把复杂当成问题的人——要合伙人，不要拯救者。" },
      { kind: "growth", title: "关系提醒", body: "保持独立，也安排「无效率」的亲密时间——别只当队友，忘了当恋人。" },
    ],
    profileBehaviors: [
      { scene: "冲突", title: "她谈规则，也谈底线", body: "探春会把冲突翻译成「什么可以接受、什么不行」——清晰，有时显得硬，但很少拖泥带水。" },
      { scene: "亲密", title: "她要同频，不要拯救", body: "她不会被「我来搞定一切」打动，更吃「我们一起搞定」——对等让她安心。" },
      { scene: "选择", title: "不对等就止损", body: "她不怕分开，怕的是在烂局里耗尽一生——这种清醒，是她的保护，也是她的孤独。" },
    ],
    ros: {
      partner: "理想同频伴侣",
      relationshipNote: "假设场景：与尊重她独立性的伴侣，共建型关系",
      typeName: "彼此生长",
      typeOneLiner: "不是互相拯救，是一起变好",
      typeDescription: "兼容与走向一致，互动成熟——探春与伴侣像队友，也像恋人。",
      stageId: 7,
      dims: { at: 72, in: 78, co: 82, ev: 80, rk: 36 },
      weather: { icon: "sun", label: "晴朗", sub: "稳定向上，有未来感" },
      heroQuote: "好的关系，是两个人都把日子往前推。",
      insights: [
        { kind: "strength", title: "兼容与走向", body: "CO 82 · EV 80：价值观与未来方向同频。" },
        { kind: "advice", title: "建议", body: "保持独立，也安排「无效率」的亲密时间——别只当队友。" },
      ],
    },
    mate: {
      positionName: "让人想留下来的人",
      quadrantDesc: "清醒独立 · 长期持有",
      tagline: "不是最会撒娇的，是最能一起把日子过明白的。",
      tags: ["高边界", "能共建", "低 drama"],
      assets: [
        { label: "自主性", summary: "强", role: "不拖后腿" },
        { label: "决策力", summary: "清晰", role: "能拍板" },
        { label: "情感表达", summary: "克制", role: "需要主动邀请" },
      ],
      axisX: 70,
      axisY: 80,
      marketInsight: "现实托底感是核心——靠谱、有主见、能共建；存在感靠专业感与口碑。",
      moduleScores: [
        { code: "FS1", label: "吸引力资产", score: 70, tag: "利落", evidence: "气质清醒，有辨识度" },
        { code: "FS2", label: "情感价值输出", score: 68, tag: "稳", evidence: "不制造情绪 drama" },
        { code: "FS3", label: "现实自主性", score: 86, tag: "强", evidence: "经济与人格独立" },
        { code: "FS4", label: "社交可见度", score: 64, tag: "中", evidence: "不抢戏，但有话语权" },
        { code: "FS5", label: "相处风险", score: 32, tag: "低", evidence: "原则清晰，内耗少" },
      ],
      reverseFront: "外界误读：太强势、不够女人、难接近",
      reverseBack: "真实机制：你要的是对等，不是服从——对的人会把你看作合伙人。",
      adviceGood: "适合找尊重你独立、能一起拍板的人。",
      adviceWarning: "别用「太清醒」挡住所有靠近——偶尔示弱，是邀请不是降格。",
      matchZone: "成熟、同频、能共建的人",
      socialQuote: "不是最好追的，是最值得一起过日子的。",
    },
  },
];

export function getExampleCharacter(id: string): ExampleCharacter | undefined {
  return EXAMPLE_CHARACTERS.find((c) => c.id === id);
}

export function getExampleCharacterIds(): string[] {
  return EXAMPLE_CHARACTERS.map((c) => c.id);
}
