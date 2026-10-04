# 流程实例：西辽，1141年后｜局部范围

这是T22-3对既有样本的登记实例，不重新描绘或复核其面积/原图含义。[接入流程](../T22-3-range-intake.md)。

## 身份与本轮边界
- 对象 `polity:qara-khitai`，范围版本 `bregel:2003:map15:qara-khitai:after-1141:excerpt`；本轮只验证接入流程。
- [78对象登记表](../POLITY-RANGE-REGISTER.md)及[T22-61批次](../T22-RANGE-BATCHES.md#t22-61)保留；该批复核须用户解除暂缓。
- `qaraKhitaiSample(n.relatedFamilies)`在`lib/map-layers.ts`中接入；familyIds复用地理索引已有关联，未根据范围包含重定归属。

## 来源与制作
- Yuri Bregel，*An Historical Atlas of Central Asia*，Brill，2003，第15图，印刷p.31/PDF第45页。
- [资料访问入口](https://turkistanilibrary.com/sites/default/files/-yuri_bregel-an_historical_atlas_of_central_asia.pdf)；原完整PDF永久留存位置、精确获取日期及开放许可均未记录。本轮未下载；不默认public留存或认定开放权利。
- 原图表达与既有制作解释：1141年后西辽本部实线摘录，不含虚线附属范围；东侧超出图框。这是已有说明复用，面积和原图含义待后续复核。
- [制作与来源说明](../../reviews/T21/qara-khitai-study/README.md)、[原矢量摘录/页坐标底稿](../../reviews/T21/qara-khitai-study/source-trace.json)、[配准记录](../../reviews/T21/qara-khitai-study/registration.json)。制作记录不等于原PDF。
- 8个既有Atlas地点：巴拉沙衮、怛罗斯、龟兹、喀什、于阗、撒马尔罕、布哈拉、巴尔赫。LCC中间平面30/60°N、75°E及最小二乘仿射；不是原图投影断言。逐点残差2.5–8.4km，最大8.4km，不等于政治边界准确度；北部控制点之外外推局限保留。
- 原贝塞尔路径取样转换，经原有脚本 `scripts/build-qara-khitai-sample.py`生成`lib/qara-khitai-geometry.ts`；本轮不重建。历史制作说明保留湖岸填色接合、x=1048pt资料接缝处理；不添加政治线。

## 显示和时间
- 适配模块 `lib/qara-khitai-sample.ts`：kind polity、precision documented（资料描绘状态，不是精确边界证明）、spatialMeaning core；coverage partial。
- start1141/endnull，periodText“1141年后（原图未指定终年）”，startInclusive false。1141及以前明确不匹配，之后无法确认；全时期/未知可显示部分时间证据。没有推定政权终年或币期。
- geometry Polygon闭合填色；boundary独立MultiLineString；coverageEdge独立LineString。东侧仅资料截断，不绘国界，持续提示“范围延伸至原图之外”。原几何与标签完全未改。
- label [85.0,46.7]、角度-5，稳定赭色；原定位使用rangeBounds，代表资料覆盖而非完整疆域。不是钱币流通范围，不根据覆盖城市推断发行/铸地。
- 生产构造器只引用正式模块；测试夹具与开发`t21-preview`未成为正式集合。

## 本轮交付与对象状态
- T22-3任务状态：执行完成待审阅；现有版本流程结构通过。对象状态仍“已有局部样本；范围含义待后续复核”，不是完整范围完成。
- 时间/版本、接缝、配准保护沿用既有测试；新增离线结构检查见接入流程。本轮未修改渲染/生产接入/几何，未重复构建、配准或页面截图；既有桌面/390px资料见[T22-2验收](../../reviews/T22-2/README.md)与T21制作说明，非本轮新页面实测。
- 剩余：面积/原图含义复核继续暂缓；东侧未覆盖、附属范围、其他时期保留T22-61具体后续归属；精确获取日期/原件留存与权利状态仍未记录。
- 修改记录：本轮仅整理文档与离线结构校验；最终SHA见提交记录。不合并、不部署、不启动T22-4。


## T62 显示更新

仍为1141年后局部范围，面积/原图含义复核暂缓。普通地图移除常驻“范围延伸至原图之外”，该信息保留资料与方法；东侧仅填色，独立政治boundary保持，手机主动定位可查看现有全部局部轮廓。 本轮仅修呈现与显式定位，未新增历史成果或宣称对象全部建设完成。[真实页面记录](../../reviews/T62/README.md)。
