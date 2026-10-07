# 主库多来源浏览索引

`public/data/source-index.json` 是独立派生文件，不改 atlas、manifest 或研究数据库。只覆盖现有主库 `specimens[].sources` 关系，不表示3999来源实体或Zeno快照的完整浏览。

离线重建：使用现有项目Python运行 `python scripts/source_index.py`。不下载、无第三方依赖；今后已授权更新主库来源关系后应重建此文件。测试会比较当前atlas重建结果与已保存索引，避免静默过期。正常前端构建直接使用已跟踪文件，不触发全库导出。

## 结构与身份

- `sources[]`：id、provider、recordKey、identityStatus、原urls、原labels、paths。直接调用T03 `source_identity`，external ID与SQLite算法一致。未解析键保留`unresolved-url:`及原URL，编号显示待解析。
- `links[]`：recordId、sourceId、relation。按记录/来源去重；相同配对若出现冲突关系则报错，不自行改判。同一来源可有多个URL、分类路径和主库记录关系。
- 分类路径沿用T03守卫：仅在Zeno来源键与该记录显式sourceRecordId一致时接受sourcePath。不从标题、catalogue字段或主来源给次要来源补路径。相同来源实体的已知路径可复用，但不跨来源借用。没有扫描额外快照补全树。
- 不把来源链接等同于该记录每张图的来源。目录进入原主库图片详情，T04逐图元数据原样使用，本轮不改图来源。

`projectSourceIndex(index, matchedRecords, query)` 只投影T40统一结果，返回按provider分组、bySource/byRecord双向实际来源映射、references及计数。same_specimen进入实际映射，其他关系单列references；query只缩小目录入口，不反向扩大主库集合。原记录保持对象引用及稳定ID。T12/T13可复用此层，本轮未建完整来源树。

## 计数

|范围|来源记录入口|来源关联|去重主库记录|
|---|---:|---:|---:|
|实际same_specimen|1006|1013|1010|
|参考comparison|5|7|7|

5个comparison来源同时也是其他主库记录的实际来源，因此sidecar仍1006个来源实体、1020条关系。实际入口中6个pending_resolution；5个Coins of Central Asia页面关联12条记录，保留网页级待解析身份，不拿内部记录ID冒充原始编号。这些都不是独立实物计数。

实际provider分组（来源入口/关联/主库记录）：Zeno 993/993/993；Coins of Central Asia 5/12/12；Bactrianumis 1/1/1；CNG 1/1/1；NumisBids 2/2/2；Numista 1/1/1；Stephen Album 2/2/2；artsandculture.google.com 1/1/1。provider间主库记录可以重复，不能相加作为主库总数。

## 验证

3项Python测试检查重建、T03身份、重复分类成员、待解析键和冲突拒绝；2项索引Node测试检查实际多来源、comparison排除、原数据不变、筛选投影和重复链接。连同既有图库/筛选共19项Node测试通过。

一次临时SQLite导出核对全部1006实体身份/ID及1020条关系逐项一致；全库external_record仍3999，外键干净。原atlas、related索引、研究文件、schema均未改。类型检查和生产构建通过；代表性页面验收见STATUS T11记录。

## T13 · 来源分类树

`lib/source-tree.ts`消费T11索引在T40 matchedRecords中的实际关联，生成平台→原分类路径→来源记录。分类实体键为provider+原categoryId；树中位置键为provider+完整祖先分类ID序列，来源叶再加既有external ID。没有路径的记录进入独立missing-path浏览节点，不借用主来源路径，不按标题造分类。相同分类/来源可有多个树中位置；父节点对来源ID、来源/主库配对、主库ID分别去重，不相加子计数。

搜索按当前关联的来源编号、原标签、主库ID/标题、路径名称和原分类ID匹配；comparison继续单列。选中来源/分类可看对应关联，进入既有图片或Atlas家族；“返回来源目录”恢复来源选择、搜索及展开状态。零结果清理失效选中项，清空搜索恢复当前全局筛选。相关图库保持独立。未改T12对比、重量/尺寸及说明组件。

### 覆盖证据

离线 `python scripts/source_coverage.py` 生成独立 `public/data/source-coverage.json`（31条证据）。仅读取：

- research/coverage-scopes.json：日期、分类ID与分类照片数登记；原注记保留，覆盖未核定。
- research/zeno/coverage-gaps-503.json：登记日期、明确分类的直接观察链接数/声明数/已知缺口；#503另保留涉及24分类的分页缺口提示。历史登记不宣称已补齐。
- atlas.json coverage：明确category URL中的3106，2026-09-16 Nana快照14条。

仅provider+categoryId准确对应时展示，不向子分类继承或相加快照计数；没有对应证据显示覆盖未核定。快照值不随查询变化，不以当前主库关联数量推导采集率。范围仍是已关联主库的来源子集，不扩展全3999实体或全部快照。没有联网、改原资料或重建研究数据库。
