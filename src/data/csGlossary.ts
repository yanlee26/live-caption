import { CSTerm, AcademicCategory } from '../types';

export const ACADEMIC_CATEGORIES: AcademicCategory[] = [
  "All Categories",
  "Computer Science & AI",
  "Science & Mathematics",
  "Business & Economics",
  "Engineering & Technology",
  "Medicine & Life Sciences",
  "Humanities & Social Sciences",
  "General Academic"
];

export const CS_CATEGORIES = ACADEMIC_CATEGORIES;

export const DEFAULT_CS_GLOSSARY: CSTerm[] = [
  // --- Computer Science & AI ---
  {
    id: "term-1",
    term: "Gradient Descent",
    chinese: "梯度下降算法",
    category: "Computer Science & AI",
    definition: "An optimization algorithm used to minimize a loss function by iteratively moving in the direction of steepest descent.",
    definitionCn: "一种用于最小化损失函数的迭代优化算法，每次向最陡下降方向更新参数。",
    codeExample: "w = w - learning_rate * dw"
  },
  {
    id: "term-2",
    term: "Transformer",
    chinese: "Transformer 神经架构",
    category: "Computer Science & AI",
    definition: "A deep learning neural network architecture based on self-attention mechanisms that processes sequence data in parallel.",
    definitionCn: "基于自注意力机制的深度神经网络架构，能并行处理序列数据。",
    codeExample: "Attention(Q,K,V) = softmax(QK^T / sqrt(d_k)) * V"
  },
  {
    id: "term-3",
    term: "MapReduce",
    chinese: "映射化简分布式计算框架",
    category: "Computer Science & AI",
    definition: "A programming model and software framework for processing large datasets in parallel across clusters.",
    definitionCn: "在分布式集群上并行处理海量数据集的编程模型与软件框架。",
    codeExample: "map(key, value) -> list(k2, v2); reduce(k2, list(v2)) -> list(v3)"
  },
  {
    id: "term-4",
    term: "Raft Consensus",
    chinese: "Raft 分布式共识协议",
    category: "Computer Science & AI",
    definition: "A consensus algorithm designed to manage replicated logs across distributed nodes in a fault-tolerant manner.",
    definitionCn: "用于在分布式节点间管理复制日志的容错共识算法。",
    codeExample: "RequestVote(term, candidateId, lastLogIndex, lastLogTerm)"
  },
  {
    id: "term-5",
    term: "Overfitting",
    chinese: "过拟合现象",
    category: "Computer Science & AI",
    definition: "When a model learns training data too well, capturing noise and failing to generalize to unseen test data.",
    definitionCn: "模型过度拟合训练集噪声，导致在新测试数据上的泛化能力下降。"
  },

  // --- Science & Mathematics ---
  {
    id: "term-6",
    term: "Hypothesis Testing",
    chinese: "假设检验",
    category: "Science & Mathematics",
    definition: "A statistical method used to determine whether there is enough evidence in a sample to infer a condition for a population.",
    definitionCn: "利用样本数据推断总体特征的统计学决策方法（零假设 H0 与 备择假设 H1）。"
  },
  {
    id: "term-7",
    term: "Central Limit Theorem",
    chinese: "中心极限定理",
    category: "Science & Mathematics",
    definition: "States that the distribution of sample means approaches a normal distribution as sample size increases, regardless of population shape.",
    definitionCn: "无论总体样本分布如何，独立同分布随机变量之和的均值在样本量极大时趋近正态分布。"
  },
  {
    id: "term-8",
    term: "Quantum Superposition",
    chinese: "量子叠加态",
    category: "Science & Mathematics",
    definition: "A principle of quantum mechanics where a physical system exists in multiple states simultaneously until measured.",
    definitionCn: "量子力学基本原理，表明量子系统在被测量前可同时处于多个可能状态的叠加。"
  },

  // --- Business & Economics ---
  {
    id: "term-9",
    term: "Opportunity Cost",
    chinese: "机会成本",
    category: "Business & Economics",
    definition: "The potential loss of gain from alternative choices when one alternative is chosen over others.",
    definitionCn: "做出某一选择时放弃的其他最高价值备选方案的潜在收益。"
  },
  {
    id: "term-10",
    term: "Supply and Demand",
    chinese: "供求关系均衡",
    category: "Business & Economics",
    definition: "The economic model determining price in a market based on product availability and consumer desire.",
    definitionCn: "市场上商品供给量与需求量相互作用决定市场均衡价格的经济学模型。"
  },
  {
    id: "term-11",
    term: "Net Present Value (NPV)",
    chinese: "净现值",
    category: "Business & Economics",
    definition: "The difference between the present value of cash inflows and outflows over a period of time.",
    definitionCn: "项目未来现金流入现值与未来现金流出现值之间的差额。"
  },

  // --- Medicine & Life Sciences ---
  {
    id: "term-12",
    term: "DNA Replication",
    chinese: "DNA 复制过程",
    category: "Medicine & Life Sciences",
    definition: "The biological process of producing two identical replicas of DNA from one original DNA molecule.",
    definitionCn: "DNA 双链解开并以半保留复制方式合成两条相同 DNA 分子的生物学过程。"
  },
  {
    id: "term-13",
    term: "Immune Response",
    chinese: "免疫应答",
    category: "Medicine & Life Sciences",
    definition: "The reaction of the cells and fluids of the body to the presence of a substance that is not recognized as a constituent of the body.",
    definitionCn: "机体免疫系统识别外源抗原并做出防御性生理反应的过程。"
  },

  // --- Engineering & Technology ---
  {
    id: "term-14",
    term: "Finite Element Analysis (FEA)",
    chinese: "有限元分析",
    category: "Engineering & Technology",
    definition: "A computerized method for predicting how a product reacts to real-world forces, vibration, heat, and fluid flow.",
    definitionCn: "使用数值近似方法模拟预测物理结构在应力、温度、振动等受力条件下的反应。"
  },

  // --- General Academic Vocabulary ---
  {
    id: "term-15",
    term: "Empirical Evidence",
    chinese: "实证依据 / 经验证据",
    category: "General Academic",
    definition: "Information acquired by observation or experimentation used to verify a hypothesis or theory.",
    definitionCn: "通过系统性观察或科学实验获得的检验理论假设的真实事实证据。"
  },
  {
    id: "term-16",
    term: "Qualitative Analysis",
    chinese: "定性分析",
    category: "General Academic",
    definition: "A research methodology focused on non-numerical data like narrative descriptions, interview text, and observation.",
    definitionCn: "关注非数值化资料（文本、访谈、观察记录）以探索事物性质与规律的研究方法。"
  }
];
