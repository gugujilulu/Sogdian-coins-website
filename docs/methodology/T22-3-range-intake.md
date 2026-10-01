# T22-3 可复用历史范围接入流程

只整理既有接入链路；不代表78对象范围完成。78对象／58批及13零匹配项保留，西辽面积与原图含义复核继续暂缓。复制[登记/交付模板](templates/RANGE-INTAKE.md)，参照[西辽实例](range-intake/QARA-KHITAI.md)。时间规则以[T22-2](T22-2-range-time-semantics.md)为准，美术沿用[MAP-LAYERS](MAP-LAYERS.md)。

## 身份与实际入口

|内容|现有承载位置|接入约束|
|---|---|---|
|建设对象|`lib/geography-index.ts` 的 node.id；完整对象清单见 POLITY-RANGE-REGISTER.md|例如 polity:qara-khitai；地区不是政权，尚未建节点先保留文档行|
|范围版本|`lib/map-layers.ts` 的 MapRange.id / objectId|对象和版本分开；同对象多时期/资料用不同固定ID，不随标题、数组次序改变|
|来源/资料版本|MapRange.source / note，加独立登记文档|source引用作者、资料、年份、页图和URL；长制作记录通过文档引用，不新增重复字段|
|原件/摘录/制作底稿|登记文档引用受控留存位置；西辽在 docs/reviews/T21/qara-khitai-study|原资料、研究说明、派生几何、UI分别留存；权利未知不默认为开放，不默认复制到public|
|几何资源|西辽 `lib/qara-khitai-geometry.ts`，适配 `lib/qara-khitai-sample.ts`|新版本可采用同类独立模块，按需命名；不强制新增另一套JSON库|
|生产集合|`buildMapBackground`（lib/map-layers.ts）|在明确objectId分支复用登记版本；有几何版本替代该对象待绘占位，不同时重复占位；同对象多个版本均保留|
|家族关联|GeographyIndex节点 relatedFamilies → MapRange.familyIds|只用现有明确关系；已有 area 则保持 area:ID 与原familyId；不以坐标包含推断关系|
|边界/显示|range-boundaries.ts / historical-map-renderer.ts / map-layer-style.ts|填色Polygon、boundary MultiLineString、coverageEdge分别登记；保持已验收样式|
|时间/版本|range-time.ts / range-controls.tsx|范围自身start/end/periodText/timeEvidence，未知保留；不复制币期；版本稳定排序、不按年静默换版|

source为现有字符串，不需要增加来源ID框架：版本登记保留资料页/图号及原件链接即可区分。共用资料和配准底稿不自动共用边界，同批各对象仍各有成果登记。政治范围不能转换为钱币流通范围。

## 八步执行与产物

1. **锁定批次**：读 T22-RANGE-BATCHES.md 指定卡及登记表对应行。写清本轮对象ID、一个时期/资料版本和停止边界，其他时期写具体后续任务。T22-4首先为 polity:turgesh 寻找可区分单期及裁切的资料；已有第8/9图只是线索，不自动复用西辽轮廓。
2. **登记证据**：复制模板到 `docs/workflow/range-intake/`，填来源、权利、获取日期、原件/摘录路径；缺失填“未记录”。引用已有说明而非复制长文。若资料不足，交付线索与具体缺口，对象状态仍待建，不补画。
3. **准备几何**：原资料→配准底稿→派生坐标，记录控制点、方法、残差及简化策略。GeoJSON经纬度次序为经度/纬度。Polygon必要闭合；政治边界另存，不含裁切闭合段，coverageEdge及coverage.note明确未覆盖方向。局部、完整、未知与空间含义分别登记。仅有未知几何的待绘记录允许保留。
4. **接入范围**：遵循上表，使用固定版本ID、对象ID及已有familyIds，添加时期原文、来源、precision、spatialMeaning、coverage、label和独立boundary。地图位置不推断钱币发行/铸造/流通。无证据不增加角色。测试夹具只在tests/或开发预览，不导入生产buildMapBackground。
5. **必要离线检查**（仓库根目录，Node≥22.13；复用现有依赖）：
   ```sh
   node --experimental-strip-types scripts/check-range-intake.mjs
   node --experimental-strip-types --test tests/range-intake.test.mjs tests/qara-khitai-sample.test.mjs tests/range-time.test.mjs
   node node_modules/typescript/bin/tsc --noEmit
   git diff --check
   ```
   西辽现有离线重建命令为 `python3 scripts/build-qara-khitai-sample.py`，仅在确需更新该派生样本且已获任务授权时使用，本轮未执行。未来其他样本不假称适用此专用脚本。生产接入变化才运行 `npm run build`，无需重新导出全库。检查结果写入登记模板。
6. **页面代表验收**：生产接入变化时 `npm run dev`，正式Atlas使用既有关联家族。桌面/390px检查范围和出处、全时期/指定年份/未知、版本选择及背景查看、边界与资料边缘图例、家族失配保留、图层关闭恢复。记录真实步骤与截图；真机触控未测即注明。只改流程/离线辅助且显示输入未变时不重复既有页面与构建验收。
7. **更新三层状态**：本轮交付状态（review等）、对象范围状态（待建/局部/完整/未知）、当前资料版本状态分别写；未覆盖时期/附属/裁切部分列具体后续任务。更新登记表/本批卡/STATUS及必要MILESTONES。只有找到资料不等于完成范围；资料不足不删除对象。
8. **交付停止**：显式stage任务文件，commit、push任务分支，`git ls-remote --heads origin <任务分支>`核对HEAD；提交截图链接及实际检查结果后停止，不自动执行下一批或合并部署。

## 校验边界

已有西辽测试负责配准数据、闭合无自交和资料接缝；range-time测试负责三态时间及版本/背景行为。新增离线check-range-intake仅补版本重复、有效对象/家族引用、来源登记、年代异常、合法坐标/闭合、局部说明和独立裁切边界的结构缺口。允许多版本共用objectId、未知年代和无几何待绘对象。当前正式集合40版本（含既有area背景和待绘政权），1个有几何，不是78项范围完成数量。

此检查不验证史学正确性、权利许可真实性、polygon拓扑全套有效性或所有未覆盖边段；接缝检查识别同坐标段及反向段，不替代复杂共享边界人工核对。新复杂几何需要本批针对性无自交/边缘检查，复用西辽测试思路，不为本轮引入GIS框架。正式构造器与开发路由仍是隔离边界，demo标记检查不能检测故意伪装为正式ID的任意夹具。
