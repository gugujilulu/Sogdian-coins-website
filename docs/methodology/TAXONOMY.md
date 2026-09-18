# T06 · Taxonomy Foundation

起始提交：`de9ac217f3c40ffa402b508c4fbe5861ec31dcb5`。任务分支：`task/T06-taxonomy-foundation`。
本轮按用户指定任务替代旧里程碑同编号的地图/筛选接线任务；不修改 UI、年代、地理、实物身份或来源身份。

## 模型与研究边界

新增六张表、三个视图，旧表无结构或内容变化：

| 表/视图 | 用途 |
| --- | --- |
| taxonomy_node | 独立的规范化类型节点，parent、rank、canonical/display name、status、证据、notes；family 保留 legacy_family_id |
| taxonomy_alias | 有证据的非破坏式别名，多名称对应同一稳定节点 |
| specimen_taxonomy_assignment | 独立 specimen→node 关系，confirmed/provisional/unresolved、证据和说明 |
| taxonomy_resolution | 每条记录 major_type/variant 的 assigned/provisional/unresolved 状态，缺层级不造节点 |
| source_taxonomy_label | 来源实体、scheme、完整路径上下文、原始分类编号和标签，保留来源文字 |
| source_taxonomy_mapping | label→node，区分 contextual_family/equivalent/broader/narrower 和映射状态 |
| taxonomy_ancestry | 节点到自身及祖先的路径 |
| specimen_taxonomy_path | assignment 及其祖先，便于查询完整 family/type/variant 路径 |
| source_taxonomy_detail | label、provider、原始 source key/URL 和映射的联查 |

层级严格为 family → major_type → variant → 可选 subvariant。没有证据就停在 family；不建立占位 major type 或“未知 variant”。
56 个 family 是原有编辑分组的正式接入，accepted/confirmed 表示其既有编辑身份及归属已明确，并不宣布学术归属均已定论。原有问题、竞争性 attribution 和原始文字仍在底层数据中完整保存。

节点状态：accepted 为当前采用；provisional 为待研究确认；unresolved 为尚未解决的已登记概念；deprecated 为保留但不再采用。confirmed assignment 只能指向 accepted 节点；同一 specimen 的 confirmed assignments 必须在同一祖先链，不能跨 family 或互相冲突的兄弟分支。provisional/unresolved assignment 可保留竞争性解释；查询须显示状态。

## 稳定 ID 与增量登记

`taxonomy_id = "taxonomy:" + stable_key`。现有 family 的不可变 key 为 `family:<既有family ID>`，如 `taxonomy:family:lady-nana`。
未来节点由人工登记永久 accession key（例如 `type:research-accession-001`），创建后不重编号、不从显示名称、数组位置或父节点路径重新生成。修改 canonical/display name 或添加相邻节点不改变 ID；重归父节点须审查层级及 assignment 冲突。

`research/taxonomy.json` 保存新增节点、assignments、aliases、mappings 的审阅登记。本轮四个数组均为空。family 和既有 family assignment 从 atlas.json 的稳定 ID 确定性接入。
未来 nodes 项提供 stable_key、parent_key、rank、canonical_name、display_name、status、notes、reviewed_by、evidence；assignments 项提供 specimen_id、taxonomy_key、assignment_status、notes 及相同审阅证据；aliases 提供 taxonomy_key、alias 及审阅证据；mappings 提供 label_id、taxonomy_key、relation、mapping_status、notes 及审阅证据。
证据使用仓库内 document、locator、quoted_text；JSON 必须给出准确 JSON pointer，引用必须实际存在。自动校验只能核对引用和结构，研究真实性仍需人工负责。新增数据后，T04/T05保护基线的更新必须另行审阅，不能为了让测试通过重写基线。

没有图像/OCR/重量聚类/文件名/embedding 判型逻辑；也没有半年 ingestion pipeline。未来可追加节点和 assignment，无须重编号全库或改 specimen 主表。

## 来源标签与规范化分类

本轮复用 T03 的 `external_record_classification`，将每个非空 leaf_label 按来源实体、scheme、完整 path_json 分开保存。original_label/original_text 均为叶标签逐字原文；context_json 保留完整来源分类路径，source_label_key 保留原编号。provider、原始记录 key 和 URL 通过来源实体联查，不使用内部 specimen ID 冒充来源编号。

label ID 是来源实体 + scheme + 完整上下文的确定性摘要；它标识来源标签出现的上下文，不是 Atlas 类型身份。相同字符串在不同来源/上下文不合并。未来来源改变名称时可以保存新上下文，不能覆盖旧证据。

现存 same_specimen 来源关系与 family assignment 可生成 `contextual_family / provisional` 映射。它只表示“当前属于此 family 的记录使用这个来源标签”，不表示该来源 category 与 family 等价，更不表示 major type/variant 等价；comparison 关系不参与自动映射。

原始 type、catalogue、description、legend、attribution、variant wording、HTML/JSON 快照均继续保存在原位置；新标签表不是完整来源全文的替代品。本轮不解析原始 HTML，不从拼接后的 Atlas catalogue 文本反推某个 provider 的原话。非 Zeno 的分类标签、同一来源的历史文字版本、文献编号间的等价关系仍需未来有定位证据的人工登记。

## 当前覆盖与已知问题

| 指标 | 实际值 |
| --- | ---: |
| family / major_type / variant / subvariant 节点 | 56 / 0 / 0 / 0 |
| family confirmed assignment | 1010 / 1010（100%） |
| major_type / variant assignment coverage | 0 / 1010，各为 0% |
| provisional / unresolved assignment 行 | 0 / 0 |
| major_type unresolved resolution | 1010 条记录 |
| variant unresolved resolution | 1010 条记录 |
| 任一更深层级 unresolved 的独立记录 | 1010；两层共2020条状态行，不是2020条记录 |
| source label 上下文 | 3986，当前均为已有 Zeno breadcrumb |
| contextual_family / provisional 映射 | 993 |
| confirmed 等价映射 / aliases | 0 / 0 |

旧 `atlas.variants` 的120项仍是 source/catalog groups，SQLite 旧 type_level 也全部标作 source_reference_group，没有现成已审阅 major_type/variant 层级。本轮不将其机械转换。
Nana 的 Smirnova 769 ff./834 ff./846 ff. 等是范围/目录表达；CNG 的 Shagalov Variant 2 · 245 是来源明确引用，但缺少可审定的 Atlas major type 父层级和跨目录关系。因此保留原引用，不凭一个标签创造规范化 variant。
七河分组混合地区、发行政权、目录及页面分类，不能把 Zeno 目录结构整体升级为类型学层级。

Lady Nana：整个 family 的20条主库记录均为 family confirmed，major_type/variant unresolved；14/14 是其 Zeno 覆盖快照，不能与20条多来源主库记录混算。22张图片及21 resolved/1 unresolved 均保持；未拆 Nana、未改 source/specimen identity。

## 可复用查询 A–H

下列命名参数由调用者绑定，查询在导出的 SQLite 上执行。

```sql
-- A: specimen 的 family / major type / variant（无更深结果即未知）
SELECT * FROM specimen_taxonomy_path WHERE specimen_id=:specimen_id;
SELECT * FROM taxonomy_resolution WHERE specimen_id=:specimen_id;
-- B: 直接分配到节点的记录；包含后代可改查 specimen_taxonomy_path
SELECT * FROM specimen_taxonomy_assignment WHERE taxonomy_id=:taxonomy_id;
-- C: major type 的 variants
SELECT * FROM taxonomy_node WHERE parent_taxonomy_id=:major_type_id AND rank='variant';
-- D: variant 的自身、major type 和 family
SELECT n.* FROM taxonomy_ancestry a JOIN taxonomy_node n ON n.taxonomy_id=a.ancestor_id
WHERE a.taxonomy_id=:variant_id ORDER BY a.depth;
-- E: 指定来源上下文标签映射（无映射时 taxonomy_id 为 NULL）
SELECT * FROM source_taxonomy_detail WHERE label_id=:label_id;
-- F: 只有 confirmed family、没有任何已确认/暂定 major type
SELECT DISTINCT p.specimen_id FROM specimen_taxonomy_path p
JOIN taxonomy_resolution r ON r.specimen_id=p.specimen_id
WHERE p.rank='family' AND p.assignment_status='confirmed'
AND r.rank='major_type' AND r.status='unresolved';
-- G: major type 已确认但 variant 未解决
SELECT m.specimen_id FROM taxonomy_resolution m JOIN taxonomy_resolution v USING(specimen_id)
WHERE m.rank='major_type' AND m.status='assigned' AND v.rank='variant' AND v.status='unresolved';
-- H: provisional assignments（映射的 provisional 单独查询，不混算）
SELECT * FROM specimen_taxonomy_assignment WHERE assignment_status='provisional';
SELECT * FROM source_taxonomy_mapping WHERE mapping_status='provisional';
```

## 验证与保护

`python scripts/validate-atlas.py` 运行全部既有校验并调用 taxonomy validator：

- 对照精确T05起点保存的 `research/t05-logical-baseline.json`，43张旧表所有列和行的逻辑指纹完全一致；atlas.json 和 T05研究登记文件的字节SHA256一致。
- 56/120/1010/1013/701、3999来源实体、T04的1000 resolved/13 unresolved、Nana保护项、T05的0确认组/7候选对/1未解决对不变。
- 检查稳定ID、父节点、无环、rank相邻、合法状态、同一confirmed链、合法specimen/node引用和来源文字/上下文一致性。
- 删除新层的savepoint试验保留全部旧表且外键干净；从登记文件重建新层的完整指纹一致，随后回滚savepoint。
- 既有T04校验执行两次完整SQLite导出并比较逻辑dump，本轮新增表/视图也包含在比较内。`foreign_key_check` 无结果。
- 26项离线单元测试通过：6项原缓存、11项T05、9项T06。新测试覆盖未来增量和改名保持身份、未知层级、provisional、跨family/兄弟冲突、rank跳级/环、非法状态/重复ID/无效引用、deprecated、同名不同来源上下文。

未采集、未下载图片、未删数据、未修改specimen ID、未构建前端、未部署、未合入main。后续由协调窗口审阅集成；T06不继续下一任务。
