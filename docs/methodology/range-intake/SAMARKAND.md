# T22-17 康国／撒马尔罕接入登记

本轮限定两个资料版本；对象整体建设仍有后续项。起始main：866b6a14be27a19d154a404e7c2d0c7bb4f8b067。

|对象／版本|时间与空间定义|本轮状态|冻结关联|
|---|---|---|---|
|polity:samarkand / synthesis:samarkand:core-c7:v1|7世纪后半叶（概括阶段）；撒马尔罕—达尔戈姆大致本部核心|局部核心重建；周边分界推定|10家族、189主库记录|
|region:samarkand / synthesis:samarkand:four-doabs:v1|四个河渠间地区构成的绿洲；跨时期地域背景|本定义整体概括；其他定义待后续|19家族、266主库记录|

两项计数有重叠，不相加为主库总数。已有地理索引关联原样复用，不通过几何包含关系改钱币归属。

## 来源与制作

- [Bregel, An Historical Atlas of Central Asia (2003)](https://turkistanilibrary.com/sites/default/files/-yuri_bregel-an_historical_atlas_of_central_asia.pdf)，p.16及第8图p.17：政权阶段和宗主关系背景；图中没有康国本部边界。
- [Lurje, SOGDIANA ii (2017)](https://www.iranicaonline.org/articles/sogdiana-historical-geography/)：周边地方体系区分。
- [Grenet, SAMARQAND i (2002，2013更新)](https://www.iranicaonline.org/articles/samarqand-i/)：前伊斯兰城市及约660年背景。
- [Rondelli / Mantellini (2004), The Silk Road 2/2](https://edspace.american.edu/silkroadjournal/wp-content/uploads/sites/984/2017/09/srjournal_v2n2-December-2004.pdf)，pp.35–39，图2 p.36：绿洲四个河渠间地区。地域轮廓概括该图，不采用现代行政区或完整泽拉夫尚流域。

用户已批准采用核心区大致本部重建。这是制作范围的授权，历史依据仍来自上述资料。北、东、西过渡为推定；南侧以达尔戈姆地理形态参照，河渠不被认定为已证政治边界。周边宗主关系不填成连续本部；潘治、布哈拉未纳入本部。

原件访问入口、页码、访问日期、权利状态、分段依据和图上点位见[construction.json](../../reviews/T22-17/construction.json)。下载的原件为临时研究文件，不放入public；可由登记入口重新取得。缺失权利信息保留未记录。

图2为未给投影的小比例尺示意图。使用图上北向、295像素=100公里比例尺和一个近似城市锚点（330,166 → 66.9877,39.6713）作局部等距经纬标定。锚点复用现有Samarkand/Afrasiab位置；图上城市中心与考古锚点不完全一致。没有独立控制点残差，不将该标定称为精确配准，也不把小数位数当历史精度。

离线重建：`python3 scripts/build-samarkand-ranges.py`。输入为construction.json；产物lib/samarkand-geometry.ts；适配入口lib/samarkand-ranges.ts及buildMapBackground。填色闭合与独立边界分别登记；本次无资料窗口裁切闭合段。边线表达大致范围，不升级为确定国界。

## 时间与展示

政权阶段不补数字端点：全部时期显示；指定年份无法确认，保留来源及主动背景查看；年代未知按范围自身端点状态处理。绿洲明确cross-period，全部时期及指定年份显示；年代未知不自动混为缺失年代，可主动背景查看。默认优先级10，不依赖数组排序。政权虚线与地域点线沿用现有样式。

## 剩余项

T22-17-remaining：本部与曹国、米国等分界的专门史料细化；其他政权时期及附属关系；古河渠变化、多控制点标定；其他地域定义。完成本轮两个版本不等于两个对象全部范围建设完成。西辽面积与原图含义复核继续暂缓。

验证与截图结果完成后记录于STATUS及docs/reviews/T22-17/README.md。


## T62 显示更新

政权本部与独立绿洲分别使用短名称和原版本，几何及已批准核心重建保持；未扩张附属空间，时期/来源全文保留资料与方法。 本轮仅修呈现与显式定位，未新增历史成果或宣称对象全部建设完成。[真实页面记录](../../reviews/T62/README.md)。
