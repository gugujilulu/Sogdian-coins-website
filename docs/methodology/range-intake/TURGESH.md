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
