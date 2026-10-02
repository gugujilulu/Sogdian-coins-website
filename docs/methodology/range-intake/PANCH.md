# T22-18 潘治本部与地方绿洲登记

分支task/T22-18-panch-ranges；起始main 3fc4eb5384caa7218ee6385b3bcf8f3f4d499da1，T22-17已集成。只制作一个前伊斯兰末期核心版本及一个地方绿洲版本，不扩展其他对象。

|对象／版本|空间与时间|本轮完整性|冻结关联|
|---|---|---|---|
|polity:panch / synthesis:panch:core-early-c8:v1|古城与近侧农业阶地本部核心；7世纪末—8世纪初概括阶段|核心轮廓闭合、局部本部；广义统辖空间待建|4家族、35主库记录|
|region:panch / synthesis:panch:local-oasis:v1|古城附近泽拉夫尚南岸河谷—马吉安河口阶地；跨时期地方地域核心|闭合地方核心；更宽绿洲过渡仍待细化|4家族、29主库记录|

对象名称、原标签及争议状态保留；同4家族lady-nana、panch-chekin-chur-bilge、panch-amukian、panch-pycwtt，记录级地区关系不同。计数有重叠，不相加。Zeno2146与钱币字段只用于关联追溯。

## 来源与制作边界

- [Boris I. Marshak, PANJIKANT](https://www.iranicaonline.org/articles/panjikant/)，2002，更新2016，Location and early history / Archaeology：古城为潘治中心、临近肥沃灌溉谷地，盛期为7世纪末至8世纪初；东侧帕尔加尔与德瓦什提奇关系独立研究。本轮不将活动和撤退路线填成完整政权。
- [Basira Mir-Makhamad等，PLOS ONE 19(3), e0297896](https://doi.org/10.1371/journal.pone.0297896)，2024，Introduction、Study area、图1–3：城址与桑贾尔沙赫的坐标和河谷农业背景；CC BY见原文版权段。本文没有绘潘治国界。
- [Sanjar-shah Excavations Report, 2013](https://www.exploration-eurasia.com/inhalt/projekt_5.htm)，Survey及图22：河谷、阶地和山前地形参照。报告说明地方管辖界限仍是研究目标；不把该调查范围当潘治国界。

2026-10-01读取。底稿[construction.json](../../reviews/T22-18/construction.json)记录原图入口、来源版本、权利、分段依据及点位；研究原件在/private/tmp/t22-18-survey.jpg，原图公开权利未记录，不放public。报告/原图URL保留，临时原件可重新取得。未重新读取全Bregel或重做全粟特普查，已有Bregel不是本版政治边界来源。

两版均为地理综合重建，不是原图已有政治线的描绘。政权北南沿近城农业阶地概括，东西为有限核心的推定过渡；不按现代边界或任意城市半径画圈。地域使用调查图的南岸河谷与马吉安河口地貌，西侧核心过渡仍属推定。更东的桑贾尔沙赫管辖及帕尔加尔不被自动纳入政权核心；区域图中出现前者的附近地貌不意味着政治归属。

## 地理落位

图22在线图659×337。以古城与桑贾尔沙赫符号中心近似读取的两个点作局部等距经纬米制相似变换：

|控制点|图像像素|经度、纬度|坐标来源|
|---|---|---|---|
|古潘治shahristan|151,187|67.620844,39.487199|PLOS Study area|
|Sanjar-Shah|343,194|67.722012,39.485359|同上|

两点拟合的残差由构造为0，没有独立检核点；不作为精度证明。图像分辨率和符号中心近似读数限制定位。仅在古城附近及河口段使用，不外推到全上泽拉夫尚。没有借用撒马尔罕配准精度，也没有以考古点包络产生边界。

离线命令`python3 scripts/build-panch-ranges.py`读取底稿，生成lib/panch-geometry.ts；lib/panch-ranges.ts接入buildMapBackground。填色与独立大致边线分别保存；本次没有资料窗口裁切边。闭合为核心地貌过渡，底稿保留推定而非伪装为原图国界。

## 生产与时间

polity/core与context/region分别接入，固定颜色、默认优先级10、虚线及点线沿用已验收样式。范围定位采用实际小范围，不放大几何制造可见性。全局图层、家族背景选择、图例及资料与方法复用现有入口。

政权阶段只保留原始概括文字，数字端点null；指定年份无法确认，可主动背景查看；全部时期与未知沿用T22-2。地域cross-period在全部/指定年份显示，未知模式不自动混为年代资料缺失；可主动背景查看。普通筛选、用户查看对象与计数规则未改。

## 余项与交付

T22-18-remaining/polity:panch：更广本部、桑贾尔沙赫关系、帕尔加尔等附属/个人领域及其他时期；region:panch：西侧绿洲过渡、古河渠/阶地、较宽地方地域定义。当前版本完成不等于两个对象全部范围建设完成。西辽面积及含义复核暂缓；78对象/58批及10月7日路线保留。

验证和真实截图见[审阅记录](../../reviews/T22-18/README.md)。
