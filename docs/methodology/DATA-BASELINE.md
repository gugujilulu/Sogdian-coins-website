# 数据保留基线（T02）

核对日期：2026-09-18 UTC。基线提交：`e2d1a3bd9cc38fd218209d64d43d334d5ac4b44c`（本轮实际远程 main）。本文件记录当前导出的统计口径与保留要求，不改变分类、数据模型或实物判断。

## 当前导出：五项计数

统计入口为仓库根目录下的 `public/data/atlas.json`；不将旧导出、磁盘文件总量或采集快照数量混入。

| 对象 | 文件内字段 / 计算 | 实测 | 待核对值 | 差异 |
|---|---|---:|---:|---:|
| 编辑性家族 | `len(families)` | 56 | 56 | 0 |
| 来源/目录组 | `len(variants)` | 120 | 120 | 0 |
| 主库记录 | `len(specimens)` | 1010 | 1010 | 0 |
| 主库图片条目 | `sum(len(s['images']) for s in specimens)` | 1013 | 1013 | 0 |
| 相关/待定/排除资料记录 | `len(relatedRecords)` | 701 | 701 | 0 |

`variants` 是来源/目录分组，不自动等于最终学术类型；家族和组数不是稀有度或实物存世量。`specimens` 虽沿用该字段名，1010只是当前主库记录数，不能称为已确认1010件独立实物，也不是全站全部来源页的数量。一个记录可能关联多个来源；一个来源页也可能包含多件实物。

1013按图片条目计算，不按正反面拆张、不按来源页计数。本次图片 `id` 与 `path` 的唯一值也各为1013；这不代表视觉去重结果。相关资料图片不计入1013。主库记录与相关资料记录分别报告，不将两者之和称为独立实物数。

701的实际 `reviewStatus` 分布：`related` 686、`pending_multi_specimen_split` 5、`related_non_square_aperture` 3、`pending_family_mapping` 1、`excluded_non_coin` 4、`context_only` 1、`pending_aperture_scope` 1。这里的 related/held/excluded 是概括性状态族，不能只筛字面值 `held` 或 `excluded` 后声称记录缺失。

## 必须保留的身份与证据

- 来源记录、图片、实物、目录组、家族分别计数；实物关系需有证据，不能由页面数、图片相似或共享照片推定。`comparison` 不等于 `same_specimen`。
- 来源身份按 provider + 原始记录ID保留，独立于内部主库ID；同时保留原URL、分类路径、历史分类标签、原始描述及抓取快照。分类成员关系和快照版本不能制造重复来源实体。
- 当前显示导出使用 `sourceName`、`sourceRecordId`、`sourceRecordUrl` / `sourceUrl`、`sourcePath` 和 `sources[]`；原始Zeno证据在 `research/zeno/manifest-*.json` 的 `records[].id/url/breadcrumb/rawHtml`，分类页快照由 `rawGalleryHtml` 指向。补采记录还在 `research/zeno/recovered-records-503.json`。保留这些JSON及引用的原始HTML；不能只保留显示导出。
- 图片保留原图、本地路径、原始URL、来源页、署名/上传者及权利信息；manifest中的 `image`、`uploader`、`rights` 与导出 `images[]` 各有用途。署名不意味着开放许可。
- related / held / excluded 及细分状态仍是保留资料；未进入主库不能成为删除来源记录、原始HTML、图片或审查原因的理由。关联、合并或状态迁移后仍须可追溯原ID和来源。
- 增量允许上述数字变化。每批记录基线SHA、前后计数、增减原因和受影响ID，分别说明新增、来源关联、记录合并或状态调整；同步更新基线并说明证据，不能改数据凑数或只放宽断言。关联/合并不授权删除原始证据。

这些是保留要求，不是“所有字段已规范化”的声明。当前存在已知后续事项：例如 `sr9` 的显示 `sourceRecordId` 为内部ID `sr9`、`sourcePath` 为空，但 `sources[]` 保留 Zeno 20696；数据库导出仍可能据内部ID生成Zeno键。身份修正归T03，逐图来源修正归T04，T02不改模型或数据。

## Lady Nana保护项：14/14是特定快照

`research/zeno/manifest-3106.json` 的分类3106已保存14个Zeno记录；与导出 `specimens` 中 `familyId == 'lady-nana'` 且 `id` 以 `zeno-` 开头的14个记录逐ID对应。既有校验固定的来源ID集合为：

`388312, 334987, 264408, 264184, 227845, 182898, 130578, 81165, 77712, 57887, 54032, 54031, 29609, 30750`。

`atlas.json.coverage` 的 `zenoRecordCount=14`、`importedZenoRecords=14`、`date=2026-09-16`、`status=snapshot`，作用域是Lady Nana分类3106；`coverage.images=22` 是Lady Nana家族含其他来源在内的图片条目数，既不是14张Zeno图，也不是全站1013张图。14/14不表示Zeno全站覆盖、全区域覆盖或永久实时完整；后续快照增长时保留旧快照及这14条记录的可追溯关系。

`scopeCensus`、`research/coverage-scopes.json` 及各分类manifest按各自范围解释，不能直接相加为独立来源总数。#503与#795等覆盖统计不替代上表的显示导出统计。

## 可复用核对方式与本次结果

从仓库根目录使用已有Python 3与Pillow环境运行，无需安装新依赖：

```sh
python3 scripts/validate-atlas.py
```

本次使用Python 3执行，退出码0：`PASS: 56 families / 120 source groups / 1010 main records / 1013 images; 701 related-held-excluded source records remain separately traceable`。现有脚本还检查Nana逐ID集合、来源保留集合、分类快照、图片文件尺寸/署名/权利字段、主库关联和地理约束；在临时目录调用 `export-atlas-db.py` 并检查SQLite计数、外键和关系约束。本轮只运行一次；自动读取已有图片元数据不构成全库视觉审核，未重新下载图片。

复算计数（只读，不运行 `build-atlas.py` 重写导出）：

```sh
python3 - <<'PY'
import json
from pathlib import Path
from collections import Counter
a = json.loads(Path('public/data/atlas.json').read_text())
for key in ('families', 'variants', 'specimens', 'relatedRecords'):
    print(key, len(a[key]))
images = [im for s in a['specimens'] for im in s['images']]
print('images', len(images))
print('unique image IDs/paths', len({im['id'] for im in images}), len({im['path'] for im in images}))
print('related statuses', dict(Counter(r['reviewStatus'] for r in a['relatedRecords'])))
print('Nana coverage', a['coverage'])
PY
```

现有 `research/source-preservation-floor.json` 保留集合为1711个来源记录标签、1707个来源URL、1012个图片来源URL；校验使用子集包含关系，允许新增。这些是不同维度的去重集合，不能代替主库/图片/实物计数，也不能证明provider键已规范化或所有原始快照内容逐字无损。本轮没有新增测试框架、改写保留下限或重新生成数据。五项计数无差异，现有校验通过；未采集、未运行前端构建、未部署。
