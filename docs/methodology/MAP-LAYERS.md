# T21 地图图层与视觉系统

基线 f8d4dcc22f2b336f1b5c3fffabb0a9f8898156c9。分支 task/T21-historical-map-layers。不部署、不建设 T22 正式范围。

## 视觉参考（有边界的四项）

- [Colton，Central Asia，1885，Library of Congress](https://www.loc.gov/item/2013593027/)：馆藏描述确认晕滃地形、地域着色与比例尺并存。采用地形优先、区域色克制、城市字级小于范围字级。原先馆藏2004629038页面访问报错；未据此判断任何历史疆界。
- [Kitchin，Asia，1787，David Rumsey](https://www.davidrumsey.com/maps2532.html)：铜版轮廓着色与图绘地形。借鉴细线＋淡色边缘，不复制纸张污渍或旧地图地理结论；馆藏页面缩略图已实看，交互高分辨率服务读取受阻。
- [Crusader Kings III，Paradox 官方画面入口](https://www.paradoxinteractive.com/games/crusader-kings-iii/about)：借鉴宏观范围名／局部地点与对象入口的层级、选择背景与主交互分离。另实看[Paradox论坛实际画面](https://forum.paradoxplaza.com/forum/threads/full-map-screenshots.1391727/page-4)：按空间伸展的衬线政权名、稳定区域色和较淡的下级分界。只参考制图原则，不使用游戏素材。
- [Total War: PHARAOH DYNASTIES，开发者地图演示](https://www.youtube.com/watch?v=qJHre9auMY0)及[SEGA官方说明](https://sega.prezly.com/total-war-pharaoh-dynasties-out-july-25th)：借鉴地形和聚落为骨架、范围与场景细节随层级展开。外部视频未完成逐帧播放验收；另实看[Steam玩家实际地图截图](https://steamcommunity.com/app/2951630/?curator_clanid=4777282)：控制面板独立于地图，河流与地名在范围色之上；官方静态宣传画面与网页可访问，Steam游戏截图入口遇到年龄门槛，未提交年龄信息。

以上参考用于设计方向，访问限制如实保留；不是本项目地理证据。范围使用灰青／赭石等固定对象ID配色；底图不做泛黄噪声覆盖。明确边界采用米白细衬线与墨色发丝线，大致边缘采用随缩放受限的柔边，不随机偏移坐标。流通范围采用断续线，与政权轮廓区分。城市／政治中心／遗址／铸币地／候选／单枚出土／窖藏为同一32单位原创SVG笔触；图例和地图引用同一资产。

## 可运行样张 A

正常开发命令启动后访问 `/t21-preview`。生产环境返回404；演示数据只由该开发路由加载，不进入 atlas.json、主库计数或正式范围适配。

七河—粟特演示的两块多边形、650–750时期和演示政治中心／窖藏均非历史断言；真实地点与钱币仍来自已有Atlas。所有演示入口明确标识。支持地图拖拽缩放、层开关、来源弹窗、家族详情；样张记录点击进入正式既有高清详情。

正式资料当前只有14个地点、0条空间证据、0块范围。政权候选目录继续保留；尚未绘制不代表无关联。正式范围首批数据留T22。
