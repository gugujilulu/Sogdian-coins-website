# 七河地域背景接入登记

起始SHA `9ed92e20a68acdfee30d9f589c7a524ef5cba7f1`，分支task/T22-8-semirechye-background；最新main与已知一致，初始工作树干净。只执行本资料定义版本，不执行其他范围。

## 身份、定义和来源

- 对象 `region:semirechye`，历史地域；版本 `synthesis:semirechye:core-chu:v1`。稳定defaultPriority=10，不按数组顺序。17家族／513去重主库记录的现有索引关联冻结，不按坐标包含新增关系。
- 采用苏联历史百科《СЕМИРЕЧЬЕ》条目的核心七河＋楚河流域广义定义：巴尔喀什南部、萨瑟克／阿拉湖周缘、准噶尔阿拉套、北天山、楚伊犁山及楚河谷/下游过渡。选择理由：明确列出自然地理参照，且明确说明历史文献中的楚河扩展；与本项目七河历史钱币背景相容。
- 主要入口：[百科条目文本转载](https://gufo.me/dict/history_encyclopedia/СЕМИРЕЧЬЕ)，作者、卷年、页码未记录；2026-10-01读取。原卷扫描尚未取得，后续复核项保留，不冒称已配准原图。条目权利未记录，未提交整篇原文。
- 复用Michael Fedorov，Money Circulation in Early-Mediaeval Semirech’e (Jety Su)，ONS178，2004，p.7历史地理语境。[原件](https://www.orientalnumismaticsociety.org/archive/ONS_178.pdf)，已有原件 `/private/tmp/t22-ons178.pdf`，本轮视觉复读印刷p.7；开放权利未记录，不放public。资料对历史地域的概括不是俄国行政区几何。
- Nina Bogutskaya，[FEOW Balkash–Alakul 624](https://www.feow.org/ecoregions/details/624)，出版年未记录，2026-10-01读取；山系、水系位置参照，不将完整生态区或全上伊犁直接当七河。
- 未预设全怛罗斯、整个伊塞克湖盆地或全上伊犁均属于此版本。不同历史定义留作后续版本，不修改相关钱币归属或建设对象。
- 定向补查Hallez2025论文入口可读，但PDF发生重定向循环，未作为几何依据；不反复尝试。既有Bregel不是本版范围边界来源。

## 制作底稿与方法

[分段底稿](../../reviews/T22-8/construction.json)逐段记录来源ID、地理参照与方法，4段：湖岸/湖盆、准噶尔阿拉套山前、北天山与楚河谷南侧、楚河下游过渡。所有轮廓为文献地理综合重建；无直接描边段，西缘为较弱自然过渡。

未使用扫描地图配准；控制点、投影拟合、逐点残差不适用，不借用突骑施配准精度。按具名湖岸、山前、谷地作显示尺度概括，非精确分水岭GIS提取；不随机扰动，不按现代国界或钱币点包络闭合。未复制突骑施几何。

离线确定性重建：
```sh
python3 scripts/build-semirechye-background.py
```
产物 `lib/semirechye-geometry.ts`；适配 `lib/semirechye-background.ts`。底稿、派生几何和生产显示分开；不改原始atlas、manifest、图片或来源。

## 显示和时间

kind=context，spatialMeaning=region，precision=approximate。coverage=complete表示本定义的整体概括已闭合，不表示全部地域定义研究完成。独立boundary是地域边缘，不是政治国界；无资料裁切闭合边，coverageEdge不存在。点线地域边缘与政权虚线区分；稳定灰紫色，与突骑施灰青色区分。标签在内部，定位按整体几何。

新增受限显式 `timeApplicability: cross-period`，只允许context＋region且数字端点均null；不补造年。全部时期、任意指定年份显示同一地域定义，不表示当年政权存在，不改币期匹配；年代未知模式默认不显示（跨时期不等于年代缺失），保留版本/来源，可主动作为背景查看。模式变化清除主动背景沿用T22-2。突骑施、西辽判定不变。

生产入口：buildMapBackground读取已有地区节点familyIds，global context开关、家族背景体系选择、范围定位、图例与资料与方法复用原入口。与政权可同时显示；关闭家族恢复基础开关，普通筛选不移动相机。

## 状态和剩余项

本轮版本：制作/接入完成，验证及截图见[审阅记录](../../reviews/T22-8/README.md)。对象建设：本定义整体版本，其他定义及过渡细化未完成。T22-8-remaining/region:semirechye：原百科卷页复核、楚河下游荒漠西缘与山麓细化、怛罗斯/伊塞克湖/上伊犁在其他定义中的适用性。阶段成果不取消后续项。

78对象、58批及13零匹配保留；西辽面积/原图含义复核仍暂缓。未合入main、未部署，提交推送后停止，不启动T22-17。


## T62 显示更新

跨时期地域定义与既有整体几何保持；地图/图例/家族入口统一七河名称，地域点线和政权虚线保持独立。 本轮仅修呈现与显式定位，未新增历史成果或宣称对象全部建设完成。[真实页面记录](../../reviews/T62/README.md)。
