# T11 · 主库多来源浏览索引

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
