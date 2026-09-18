# T05：实物钱币身份协调（非破坏式overlay）

起点：`15b7c5cb88c9b8c0e24ce4e0b7fc1b016e5e051f`；分支：`task/T05-physical-specimen-reconciliation`。
本轮用户指定Physical Specimen Reconciliation，覆盖旧MILESTONES的T05筛选引擎安排；后续编号/依赖由协调窗口确认，本轮不做前端。

## 判定规则（包含用户补充）

来源实体、corpus record与physical object分别存在。1010条记录一条不删、不改ID、不转移图片或来源，不设canonical替代；误并代价高于漏判。

confirmed_same只接受可审计强证据：明确object-level provenance cross-reference、唯一机构/馆藏object identifier、具体旧拍卖lot链、明确同物声明，或**exact image identity**。按用户补充，exact image可独立支持确认，不再强制另加object reference：

- 同一原始文件或SHA-256完全一致：核验本地文件、image ID→specimen归属及实际哈希。
- 同一原始照片的直接派生：须有本地可定位、已审核的技术报告，绑定两端实际SHA-256，明确缩放/裁剪/水印/压缩等直接变换。“看起来是裁剪版”不是证据。validator验证报告及引用结构；报告技术内容仍由审核者负责，不用AI相似度替代。
- 必须记录source usage review；stock/reference/误配/占位或未审核风险不得自动confirmed。1766/1767已有照片复用异常，单独保存usage warning，不能用exact-image类型绕过。
- visual/perceptual similarity、pHash接近、AI/CV分数、裂纹/锈色/轮廓、重量/直径近似、同type/variant/die/系列/collection都仅能发现候选。弱证据累加不升级。
- 不同哈希不证明不同实物。确认仍需显式人工审核输入，候选生成器不能生成confirmed。同物判断若依赖缺失HTML中的内容，则保持未决。

## 模型

| 新表 | 用途 |
|---|---|
| reconciliation_candidates | 独立发现层：既有显式comparison引用配对，保存T03实体及T04逐图上下文 |
| reconciliation_assertions | 人工审核层：四状态、证据类型、定位原文、说明；每对一个当前决策 |
| physical_specimen_groups | 已确认physical group，不是canonical record |
| physical_specimen_group_members | 引用原specimen；至少2成员，一条记录最多一个group |
| physical_group_assertions | group成员关系所依据的confirmed_same assertions |

输入为 `research/physical-reconciliation.json`，包括审核assertions、显式groups、image_usage_warnings和本轮限定SHA-256审计。ID由排序后的原记录ID确定性派生。每组所有成员配对均须有confirmed_same，不通过传递闭包把候选变为确认；confirmed_distinct不能同组。

SQL约束负责外键、状态、唯一配对及成员互斥；导出和validator负责最小组规模、证据、逐对确认及冲突。任意SQL写入不能代替validator。T03是唯一source identity基础，T04关系不重写。

## 逐对结果

confirmed groups=0；参与记录=0；confirmed_same=0；confirmed_distinct=0。无真实confirmed group需逐组列举证据，弱证据confirmed group为0。

| 原记录A | 原记录B | 状态 | 本地依据/限制 |
|---|---|---|---|
| cng611-576 | zeno-81165 | candidate_review | atlas.sources明确comparison，非同物声明 |
| sarc22-55 | zeno-130578 | candidate_review | 同上 |
| sarc28-145 | zeno-81165 | candidate_review | comparison；Numista关联不证明等于Zeno81165 |
| sarc28-146 | zeno-77712 | candidate_review | comparison；Ex Hans Mondorf Collection不是唯一object编号 |
| sarc52-1614 | zeno-81165 | candidate_review | comparison；Bactrianumis托管截图不等于产品5898 |
| un22 | zeno-57521 | candidate_review | atlas.sources明确comparison |
| un24 | zeno-63495 | candidate_review | atlas.sources明确comparison |
| zeno-1766 | zeno-1767 | unresolved | review-795.json的/identityReview/doNotMerge/0/basis记录共享正面、反面不同的照片异常；不据此确认same或distinct |

8对涉及14条record、15张图，本轮实际SHA-256核对发现跨配对记录exact-file匹配0；没有全库扫描、pHash或视觉分析，没有可核验的直接派生报告。因此补充规则没有导致本轮新增group。

已有Zeno264408/Bactrianumis5898属于同一条zeno-264408的两个来源；CNG主图/alternate属于同一record的两张图，不伪造第二条record来创建group，不重新搬动既有关系。

corpus records=1010；confirmed multi-record groups X=0；参与记录Y=0；confirmed surplus=Y-X=0；按已确认关系折算1010-0=1010。这不是完整去重后的真实实物总量，候选不扣数。

## 保护和可逆性

修改代码前从精确T04提交导出SQLite，捕获 `research/t04-logical-baseline.json`：38张既有表的列顺序、行数、排序后完整行内容SHA-256。涵盖全部ID、来源、图片、provenance、引用、分类、覆盖及权利，不仅比较总数。

导出前后均比较原表摘要。validator在临时SQLite savepoint中仅清空T05五张新表，再验证全部原表及外键，然后rollback恢复测试库。正式导出不删除/更新原表，不覆盖已有数据库。

五项56/120/1010/1013/701、3999来源实体（待解析6）、T04 provenance 1000 resolved/13 unresolved/0 ambiguous/0无实体全部保持。provider计数Zeno993/CNG2/Bactrianumis1/Stephen Album2/NumisBids2保持。Nana14/14、22图（21 resolved/1 unresolved）保持；48张图的HTML缺失标记保留，不据缺失内容确认实物。

## 查询A–G

当前confirmed group为空，相关查询返回空集是审核结果。

```sql
-- A 原record所属confirmed group
SELECT * FROM physical_specimen_group_members WHERE specimen_id=:specimen_id;
-- B group成员
SELECT specimen_id FROM physical_specimen_group_members WHERE physical_group_id=:group_id;
-- C 实际来源（不把comparison算实际来源）
SELECT * FROM physical_group_sources WHERE physical_group_id=:group_id;
-- D 图片及各自T04来源
SELECT * FROM physical_group_images WHERE physical_group_id=:group_id;
-- E group的确认原文、定位及成员配对
SELECT a.* FROM physical_group_assertions g
JOIN reconciliation_assertions a USING(assertion_id)
WHERE g.physical_group_id=:group_id AND a.status='confirmed_same';
-- F 未确认候选
SELECT * FROM reconciliation_decisions WHERE status='candidate_review';
-- G 已确认不同实物
SELECT * FROM reconciliation_decisions WHERE status='confirmed_distinct';
```

## 验证和限制

`python3 scripts/validate-atlas.py`通过全部既有T03/T04检查、两次完整导出逻辑一致性、T05证据/互斥/可逆性/38表摘要检查；SQLite foreign_key_check clean。6个既有离线测试＋11个协调规则测试，共17个通过，测试时阻止网络访问。合成positive group/exact-image测试只存在临时目录，不是历史结论，不写入corpus。

剩余7对comparison候选与1对照片异常需明确object证据或合格exact-image技术证据；本轮不联网。后续授权增量若改变T04基线，需单独审核新基线与差异，不能为通过校验擅改摘要。旧T05编号/依赖冲突留给协调窗口。本轮未采集、未删除原记录、未改specimen ID、未改前端、未部署、未合入main。
