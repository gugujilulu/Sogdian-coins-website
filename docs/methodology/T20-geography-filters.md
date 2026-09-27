# T20 地区、政权、城市／地点筛选

基线 `031018dafb4ff439a66b59de708a046cdc1c8d36`；分支 `task/T20-geography-polity-city-filters`。不部署，不做 T21 图例或 T22 范围。

## 数据与建设范围登记

`lib/geography-index.ts` 从现有 Atlas 字段派生稳定实体、记录成员关系和缺失状态，不写回数据。家族 region/polity 为继承归属；anchor 只增加 display anchor 角色，不能推成铸币地或政治中心。已有空间 evidence 可单独保留 findspot/hoard/context 角色。类型支持九种地点角色，但没有依据的角色不填入数据。

登记完整建设范围：七河、粟特及其地方体系、康国／撒马尔罕、安国／布哈拉、石国、吐火罗／北吐火罗、巴克特里亚、阿富汗北部及东北部、突厥／西突厥、突骑施、葛逻禄、回鹘、黑汗、西辽、费尔干纳、渴石（用户清单亟失）、怛罗斯、塔里木、龟兹、于阗、喀什、新疆其他相关区域、中国等东亚输入钱语境。此清单是用户指定研究范围，不是已证实发行方孔钱的名单。

现有标签使用固定 ID 和中英文名称，复合或争议归属不擅自拆解。未有记录映射的范围节点保留 candidate / not yet mapped，source_status=user_scope；明确来源为本轮用户建设范围登记。每项保留 aliases、status、source references、note、relatedRegions/Places/Families、evidenceState。关联地区与地点仅是已有记录字段共现，不表示分期政治关系。

来源分类只使用 Zeno 的明确 categoryId：800、868、2146、2141、795、870、2145、866、803、867、2142、9299；逐记录保留对应路径字段引用与原标签，标为 source_label，未经学术确认。不会按标题推归属，也不会给相关资料套用主库家族。新研究关系须在有依据时扩充此层，不从候选项反推记录。

实际覆盖（实体选项，不含每维六种状态入口）：

|维度|实体选项|有主库匹配|主库缺字段|主库未定状态|
|---|---:|---:|---:|---:|
|地区|41|31|0|19|
|政权／地方体系|34|29|0|87|
|地点|14|9|122|122|

状态可重叠，不能相加。地区／政权原始“未定”文字保留为实体及 unresolved 状态，不伪装为已确认归属。相关资料 701 条中，637 条有明确地区分类标签、364 条有政权标签；地点关系全部未记录。筛选“未定地点”仍可访问全部相关资料。

无主库映射：地区 Tokharistan、Northern Tokharistan、Bactria、Northern/Northeastern Afghanistan、Tarim、Khotan、Kashgar、其他新疆、Talas；政权 Turkic Khaganates、Western Turkic、Uyghur、Qarakhanid、Bactrian；地点 Navekat、Taraz、Bunjikat、Kashgar、Khotan。候选研究项显示 0，既有地点无记录映射不等于候选地点不存在。上述广义条目不自动吸收复合标签，避免无依据扩大匹配。

## 筛选与浏览

三个维度各自多选 OR，跨维度及其他条件 AND，必须同一记录满足。选项数量是在其他维度及非地理条件下的去重主库记录数，忽略自身维度；0 选项仍可选择。保留搜索、年代、来源、铭文、tamgha、特征、家族、研究状态；清除地理只清三维，清除全部恢复完整结果。

统一结果继续驱动地图、T18集合、主库图库、Atlas树、来源树和主库计数。相关图库独立按自身明确地理关系及原有目录搜索筛选，单独显示全量／地理匹配／搜索匹配数量；不会因来源或年代字段缺失而猜测主库关系。Research 保留全库研究统计，不冒充当前筛选计数。

用户批准的 T19 局部调整：查看对象与匹配集合分离。完全失配的家族面板保留，图库显示“当前筛选下 0 条匹配”；已打开主库高清详情显示“此记录不符合当前筛选”，不计入匹配结果。恢复条件即恢复内容。原集合保持地点／家族身份与滚动位置，返回时投影当前匹配成员；零成员显示“原集合当前无匹配结果”，保留上下文等待恢复。普通筛选不自动平移或缩放。主动关闭／换家族仍执行原有显式导航语义。

## URL

沿用 T14 单一 URL 同步器。重复 `region`、`polity`、`city` 参数表示多选稳定 ID；读取也接受 `place`（不能与 city 同时出现）。例：`#view=atlas&region=region%3Asemirechye&polity=polity%3Aturgesh&city=place%3Asuyab`。

`filters` 是 URL 编码的固定字段 JSON，保存其余 FilterContext：query、familyFilter、sourceFilter、inscriptionFilter、tamghaFilter、featureFilter、statusFilter、year、dateMode。所有复制入口继承当前筛选上下文；刷新、对象链接、前进后退恢复同一状态。非法参数／未知 ID 明确报错。旧对象链接仍支持，未附筛选时恢复默认全部条件；合法旧地理字段按精确别名转换，不模糊匹配。对象可以与筛选不匹配，仍保留详情并标注。

## 验证进度

已通过类型检查、现有26项相关测试及新增7项地理／URL／浏览上下文测试。生产构建和浏览器代表操作待本轮后续验收。原始资料、atlas、manifest、日期、图片、来源关系和 ID 未修改。
