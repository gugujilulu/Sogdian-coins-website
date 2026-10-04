# T22-4 突骑施范围接入登记

## 当前整体版本（2026-10-01续接）

续接 `72e0f0975498574c575d8bc0d4055dee547a5ed2`；同分支task/T22-4-turgesh-range，fetch确认远端一致，工作树干净。

- 对象：`polity:turgesh`；新版本：`synthesis:turgesh:foundation:overall:v1`。
- 名称：突骑施｜建国初期大致范围。阶段：建国初期，约700年前后；不将699–706的君主在位期赋给所有线段，start/end保留null。
- 空间含义：政权主要历史空间的整体概括版本；本部与地方附属未分层，仍是后续研究项。几何闭合，无人为资料截面。
- 范围状态：本资料版本整体大致范围已制作，待视觉/史料审阅；对象整体建设仍部分完成，其他时期未完成。
- 原局部版本不变，作为研究版本选择；默认按明确的defaultPriority=10排序，不依赖数组顺序，显式选择仍优先。

### 来源与制作

1. Michael Fedorov，Money Circulation in Early-Mediaeval Semirech’e (Jety Su)，ONS Newsletter 178，Winter 2004，pp.7–16；本轮实际使用p.9右栏早期突骑施段。[学会原件](https://www.orientalnumismaticsociety.org/archive/ONS_178.pdf)。作者概括额尔齐斯—锡尔河及石国—别失八里／吐鲁番的空间，七河为中心。本地原件暂存/private/tmp/t22-ons178.pdf；2026-10-01取得，权利未记录，整本未发布。PDF文本编码异常，已渲染第7、9、10页并读取原页，不仅依赖搜索摘要。
2. Yuri Bregel，An Historical Atlas of Central Asia，Brill，2003，p.16乌质勒建国段、map8 p.17地理关系。[既有原件](https://turkistanilibrary.com/sites/default/files/-yuri_bregel-an_historical_atlas_of_central_asia.pdf)。文字支持699建国时石国至别失八里的概括；地图混合西突厥旧疆与突骑施，不整体复制其旧疆。第9图仍属于旧研究摘录，不移植到新版本。
3. NIS教材第20页苏禄图线索已发现，但浏览器DNS失败，未用作本版几何证据。Stark 2016的公开摘要支持阶段区别，但没有可用于落位的逐段边界，未将其列为几何来源。

本轮不是完整扫描图配准描绘：**四个方向全部属于文献综合重建，没有直接描绘的逐点政治边界段**。地理节点以既有石国、碎叶、怛罗斯等空间参照及Bregel第8图河流/城市关系进行小比例尺落位。额尔齐斯至七河北部过渡是较弱的大致推定；没有借用原局部摘录27.5km残差评价新版本。

[分段底稿](../../reviews/T22-4/overall-construction.json)保存西/北/东/南四段坐标、方法、来源ID与具体局限；[派生几何](../../../lib/turgesh-overall-geometry.ts)由 `python3 scripts/build-turgesh-overall.py` 离线重建。邻段共用端点，最终闭合。没有随机扰动、装饰平滑或机械配准误差指标；没有拼接苏禄时期粟特/吐火罗远征或塔里木围城最远点。

### 接入、显示与验收

`lib/turgesh-overall.ts` → `buildMapBackground`，与旧版本并列。6家族／239主库记录关联冻结。全局图层与家族背景共享rangeViews；一个对象同时仅显示一个版本。
全部时期显示所选版本；指定年份为“该年范围待定”，不确认为年匹配，可主动背景查看；年份、模式、对象、版本变化按T22-2清除主动背景。年代未知按数字年代完整性显示，不改钱币年代。主要界面为名称、阶段、大致范围；详细空间/时间证据、方法与来源收纳在“资料与方法”。

31项针对性测试、结构检查41版本/3几何、类型检查通过，最终构建及真实截图见[整体版本页面检查](../../reviews/T22-4/OVERALL-REVIEW.md)。原始Atlas、manifest、图片、来源、日期、ID和西辽几何未改。

### 后续项

T22-4-remaining/polity:turgesh：北/西界独立时期证据、各地控制程度与本部/附属关系、建国后/苏禄及更晚阶段。新整体版本的完成不等于全时期完成。西辽面积与原图含义复核仍暂缓。78对象/58批及13零匹配保持；本轮停止，不自动续批。

---

## 局部摘录执行历史（保留）

# T22-4 突骑施局部范围接入登记

起始SHA fb08fd05c0cf9d8bf1a11b93593aa7afcaa8a7ec；分支task/T22-4-turgesh-range。
本轮只处理Bregel第9图的突骑施一侧边界摘录，不接入其他政权/时期。

## 身份、来源与时期
- 对象polity:turgesh；版本bregel:2003:map9:turgesh:first-half-8c:excerpt。
- Yuri Bregel，An Historical Atlas of Central Asia，Brill，2003，第9图p.19/PDF第33页，说明p.18/PDF第32页。[原件入口](https://turkistanilibrary.com/sites/default/files/-yuri_bregel-an_historical_atlas_of_central_asia.pdf)。2026-10-01取得，原件暂存/private/tmp/t22-bregel.pdf；未核定开放许可，不放public，不提交整本PDF。
- 图标题为8世纪上半叶，图例蓝色点划线合指突骑施、突厥与回鹘边界。仅取突骑施名称南侧连续蓝色路径，不取东北其他政权路径或军事箭头。第8图的混合西突厥/突骑施轮廓不采用。
- 第9图为多时点概括，未给这一段独立起止年份；说明p.18记录711中断、714后恢复等，不能据政权活动史赋予此轮廓连续有效期。start/end均null，原时间文字保留，指定年份无法确认，可主动作为历史背景查看。
- 空间含义：政权边界局部摘录，原图未区分该段本部/附属，不推定；不是钱币流通范围。

## 制作证据
- [原矢量底稿](../../reviews/T22-4/source-trace.json)保留页坐标贝塞尔路径、CMYK/线宽识别、控制点和显示截面。资料原件、工作底稿、派生几何和UI分开。
- 控制点复用既有Suyab、Taraz、Chach、Kucha、Kashgar、Khotan、Samarkand、Bukhara坐标。页坐标以左上为原点；LCC中间平面30/60N、75E，最小二乘仿射，不声称原投影。
- [逐点残差](../../reviews/T22-4/registration.json)最大27.5km，是拟合残差，不是边界精度；北部超过控制点覆盖，外推不确定性较大，不作局部疆界考证。
- `python3 scripts/build-turgesh-sample.py`离线重建，沿源贝塞尔曲线8段取样，不随机扰动或平滑。输出lib/turgesh-geometry.ts和配准报告。
- 北侧选定页y=400为局部资料显示截面；西侧从原开放线端连接该截面，均为人为资料覆盖截断，不是政治边界。填色闭合geometry与南侧boundary、北西coverageEdge分开保存，图例/说明持续标局部。未覆盖其余北部、西部、其他时期，未补造国界。

## 接入和关联
- lib/turgesh-sample.ts适配MapRange；buildMapBackground复用polity:turgesh节点relatedFamilies，替代其待绘占位。
- 6个现有关联家族，冻结主库239记录，未按坐标包含增加/改变关系。source分类标签状态保留。
- 沿用稳定颜色、既有均匀浅染和细虚线（approximate），不开展新视觉选型。西辽几何与时间元数据未改。

## 状态与剩余项
- 当前资料版本：局部摘录已制作，接入与相关验证完成，待审阅；整体对象仍部分完成，不是全时期疆域完成。
- 后续T22-4-remaining/polity:turgesh：北部/西部未覆盖；独立时期边界、资料可能的其他版本和本部/附属区分尚需资料，不自动续批。
- 西辽面积和原图含义复核仍暂缓。本轮不合并、不部署、不启动下一任务。

## 实际验证

20项范围/时间/接入/西辽保护测试、tsc --noEmit、最终production build通过；结构检查40版本/2有几何通过。Git保护文件无修改。真实桌面和390px步骤/截图见[本轮审阅](../../reviews/T22-4/README.md)，真机触控未测。构建相关图片准备仍为701记录/701图；无全库导出。


## T62 显示更新

约700年前后整体版仍为显式稳定默认；南侧研究摘录仅主动版本选择可见。两版几何/分段依据/时间语义未改，短名称明确区分研究摘录。 本轮仅修呈现与显式定位，未新增历史成果或宣称对象全部建设完成。[真实页面记录](../../reviews/T62/README.md)。
