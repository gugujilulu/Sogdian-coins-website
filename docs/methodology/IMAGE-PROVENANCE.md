# T04：逐图来源引用

指定起点：`644c61b62732cbbf479583aaf97c50bfb2b71bf9`。正式派生结果为 `scripts/export-atlas-db.py` 生成的SQLite；不改显示JSON或前端。T03的来源实体、provider/key及内部specimen/image ID沿用，不创建新来源实体。

## 模型与状态

`image → image_provenance → external_record`，`image.specimen_id`保留原归属；`image_provenance_detail`视图联接所有字段。每个稳定image ID只有一条决策记录，不用数组序号生成ID。

| 字段/入口 | 含义 |
|---|---|
| `image_provenance.image_id` | 图片外键及主键，复用已有ID |
| `external_record_id` | T03来源实体外键，可空；页面URL与实体还受复合外键约束 |
| `source_page_url` | 证据支持的来源页，不由图片托管域名推定 |
| `status` | `resolved` / `unresolved` / `ambiguous` |
| `method` | 选择依据或未解决原因 |
| `evidence_json` | 所有精确匹配证据，去重并排序；包含文档路径、记录ID、页面/图片URL、本地图路径、HTML状态、PDF页码/派生说明（若已保存） |
| `notes` | 待解析原因；无须说明时为null |
| 视图 | 额外提供specimen ID、provider、provider_source_key、identity_status、本地图路径及原图URL |

`resolved`要求路径和原图URL的本地证据只指向一个已解析T03实体，并且该实体已有同specimen来源关系。不同候选实体必须 `ambiguous`，不选择任意首项。无证据、实体缺失、只有comparison关系时为 `unresolved`，不创造关联。

来源页唯一但T03原始key待解析时也标 `unresolved`，仍保留有证据的页面实体外键。此时视图的provider_source_key是T03的 `unresolved-url:` 暂存键，不是原始编号；务必同时读取identity_status。当前13张均属此情况，因此“无来源实体”为0与“unresolved”为13不矛盾。

图片署名、权利状态、权利说明URL、图像路径/尺寸/原图URL均保持原值。`image.citation_id`改为逐图证据页；若不能选择页面，退回图片已有sourceUrl的引用，不再继承specimen首个来源。可用证据的HTML为空时不伪造文件：`raw_html_reference`保留原记录路径，`raw_html_status=missing`，`raw_html=null`。

## 证据与匹配边界

- Zeno：现存manifest/recovered记录的图片路径、原图URL、原始记录ID。对于manifest未存图片path的条目，使用既有导出器的原始记录ID文件名约定，并同时要求原图URL精确相等。
- `image-repair-run-503.json.successful`保存修复后的下载路径/URL；按原始记录ID关联manifest，保留两份证据文档。不能因旧manifest的glyph URL不匹配而改写来源，也不直接使用全部候选图片URL。
- 旧目录：`source-register.json`和`coins.json`按原有ID关联明确图片路径/URL。
- Nana：使用`nana-source-register.json`与既有稳定文件命名规则，区分主图、alternate及PDF派生图。PDF的页码和派生说明原样保留，不做视觉再判断。
- 不使用当前显示JSON内按provider启发式生成的image.sourceRecord字段作为归属证据；不按近似名称、数组顺序或图像外观选择来源。
- `sarc52-1614-photo`的实际图片URL在Bactrianumis域名，但register明确记录它是拍卖目录截图；T03的来源实体是NumisBids `sale/9278/lot/1614`。保留图片托管URL及截图说明，不错误归入Bactrianumis产品5898。

## 本次覆盖

| 指标 | 实测 |
|---|---:|
| 主库图片 | 1013 |
| resolved | 1000 |
| unresolved | 13 |
| ambiguous | 0 |
| 无source entity | 0 |
| 来源实体 / 原始key待解析实体 | 3999 / 6（均不变） |

resolved按provider：Zeno 993、CNG 2、Bactrianumis 1、Stephen Album 2、NumisBids 2。

unresolved：Coins of Central Asia的12张目录图及Google Arts & Culture的1张图；原始编号仍待解析，页面关联明确。包括Nana中的 `sogdcoins-es28-photo`；不为提高覆盖率返工T03。

一个实体有多张图：5个实体。已解析的CNG `4-LGIJRO`贡献2张；其余4个待解析目录页分别贡献3、3、2、3张。两个specimen包含多来源图片：`sr9`（目录图＋Zeno20696，目录原始key待解析）、`zeno-264408`（Zeno264408＋Bactrianumis5898）。这不构成实物去重或新的同币判断。

Nana14/14保护项保持；其22张图片中21张resolved、1张unresolved。五项基线56/120/1010/1013/701不变。所有原始文件均未改写或删除。

48张主库图片的补采证据引用了本地不存在的HTML文件，validator会输出完整ID列表。保留缺失标记和仍存在的JSON/成功修复日志；来源归属依据这些明确记录，不能据此声称48份HTML已保存。没有网络补采。

## 查询与复现

从仓库根目录用已有Python 3/Pillow环境运行；目标数据库必须尚不存在：

```sh
python3 scripts/export-atlas-db.py /absolute/path/atlas.sqlite
python3 scripts/validate-atlas.py
```

A–D查询（视图包含未解决记录；不要用inner join丢掉它们）：

```sql
-- A: 单图 → specimen、provider/key和完整证据
SELECT * FROM image_provenance_detail WHERE image_id = 'z20696';
-- B: 同specimen的全部图及各自来源
SELECT * FROM image_provenance_detail WHERE specimen_id = 'zeno-264408';
-- C: 来源实体贡献的图片，:source_entity_id为绑定参数
SELECT * FROM image_provenance_detail WHERE source_entity_id = :source_entity_id;
-- D: provider/key → 实体及图片
SELECT * FROM image_provenance_detail
WHERE provider = 'CNG' AND provider_source_key = '4-LGIJRO';
```

现有validator完整执行T03及之前的断言，再检查逐图ID/外键、来源关系、署名/权利保留、文件存在、sr9/Nana/CNG案例、ambiguous/无证据/comparison-only边界、证据顺序变化。每次validator内部导出两个临时SQLite并比较完整逻辑dump，验证重复结果稳定；不以SQLite物理文件字节布局作为一致性标准。T04不要求重建前端。
