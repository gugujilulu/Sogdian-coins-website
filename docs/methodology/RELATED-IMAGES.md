# Related image index


## 导出与 T09 接口

`public/data/related-images.json` 为独立派生索引。使用 `relatedRecordId` 精确关联 `atlas.json.relatedRecords[].id`，不改变原 atlas、manifest、审查状态或原因，不向主库 images 加记录。

离线导出命令：

```sh
python scripts/related_images.py
# 或正常数据构建（同时导出 sidecar）
python scripts/build-atlas.py
python scripts/validate-atlas.py
```

使用已安装 Pillow 的项目 Python 环境。无网络请求、无下载、无图片转换。
索引中的 `images[].path` 是静态 URL；`localPath` 是 Git 中保留的研究原件位置。research 原件按字节复制到 `/public/coins/related/`，该生成目录被忽略，不重复提交约194MB已有研究图片；已有 `/public/coins/zeno/` 图直接复用。

### T09 正常开发与构建准备

`pnpm dev` 和 `pnpm build` 经 `scripts/run-framework.mjs` 自动调用离线 `scripts/related_images.py --prepare`，从已跟踪原件恢复生成目录；无需运行全库 build-atlas，也不在浏览器请求中导出。准备先核对重建索引与已保存 sidecar 完全一致，原件缺失、变化或元数据不一致会停止启动/构建，不能静默交付缺图版本。

需要 Python >=3.10 和 Pillow；默认使用 `python3`，可复用已安装环境：

```sh
ATLAS_PYTHON=/absolute/path/to/python pnpm dev
ATLAS_PYTHON=/absolute/path/to/python pnpm build
```

若缺依赖，启动会输出具体错误和安装说明；不会自动安装。需要新建环境时：

```sh
python3 -m venv .venv
.venv/bin/python -m pip install Pillow
ATLAS_PYTHON=.venv/bin/python pnpm dev
```

Windows 使用 `.venv/Scripts/python.exe` 并设置同名环境变量。独立普通导出命令仅用于已授权的数据索引更新；不要用它绕过准备阶段的原件一致性错误。

T09 图库按 relatedRecordId 精确关联，每批40条，只显示各记录首张现有照片（当前每条一图），图片懒加载、预留区域并保持比例。搜索及相关资料计数独立于主库；索引失败仍提供文字和来源链接，并可重试。原图详情留给T10。

每个索引记录保存来源系统、原始来源编号、页面、原始URL、原审查状态/原因、imageStatus 和 issues。每张图片另有稳定ID、可用原图URL、原件路径、静态路径、实测尺寸/SHA256、署名、原始权利状态及条款链接、关联证据文档。`rightsStatus=unverified` 不表示拥有使用许可，原始来源措辞保存在 sourceRightsStatus/rightsNote。

## 关联依据

- 复用 `source_identity.py` 从来源页面解析 `(provider, original ID)`；不从标题、数组位置或视觉相似建立身份。
- 有原始image metadata或成功修复日志时，逐一核对保存的SHA256；保留跨快照证据，同一原件/URL只导出一项。
- 没有保存hash的下载，以成功采集记录ID、既有来源ID文件名约定及manifest原图URL共同关联，导出实际文件hash。该关联不证明独立实物身份。
- 已移入reviewed-related目录的照片，使用同一原始ID文件名定位；修复日志的旧路径与当前localPath同时保留。
- `/glyph/` 地址拒绝作为照片；旧错误URL仍保留。缺文件、hash不符或无可靠证据时不输出可用图片，记录missing/unresolved及原因，不补采。
- 不解析任意候选URL来补造照片，也不把reviewStatus转为主库收录结论。

## 实际核对

| 项目 | 数量 |
| --- | ---: |
| related/held/excluded记录 | 701 |
| 成功关联记录 / 图片 / 唯一原件路径 | 701 / 701 / 701 |
| 缺图 / 未确定关联 | 0 / 0 |
| 多图记录 / 重复hash组 | 0 / 0 |
| reviewed-related目录文件 | 697 |
| 其中对应本次701条记录 | 686 |
| 从已有public目录复用 | 15 |
| reviewed-related目录内不在当前related集合的文件 | 11 |
| 保存hash核验关联 / 下载ID+文件名+URL关联 | 512 / 189 |
| 保留旧glyph URL、但已关联正确照片的记录 | 497 |

697是特定目录的文件数，不是当前相关资料可关联图片总数。11个不在集合的ID为115509、146052、232909、284607、293374、306552、326586、350958、375693、377305、697；亦不属于当前主库。不删除、不强行关联、不扩展调查。15张public原件与686张research原件共同覆盖701条记录；没有新增采集。

代表：105744旧URL为glyph，采用成功修复日志中真实照片URL及匹配hash；110499复用manifest中明确记录的public照片；128840复用recovered-records与成功下载ID及原始文件名。真实集合没有缺图/多图场景，以夹具验证缺文件、错误hash、glyph拒绝、无证据、双照片及重复快照去重。

## 验证

运行受影响导出、完整validate-atlas及29项离线Python测试通过。检查全部关联文件与生成文件存在、hash相同、尺寸可读、身份一致、导出可重建、审查状态/原因原样保留；原有SQLite外键、重复导出和T03–T06保护校验均通过。
主库仍56家族/120目录组/1010记录/1013图片，相关记录701；Nana14/14和22图保持。原atlas.json字节无变化，T05保护hash不需改动。未运行前端构建，未部署、未合入main；不启动T09。
