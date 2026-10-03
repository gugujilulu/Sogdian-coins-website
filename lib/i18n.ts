export type Locale='en'|'zh'|'ru';
export const languageNames={en:'English',zh:'中文',ru:'Русский'} as const;
export const storageKey='atlas-language';
export function validLocale(value:unknown):Locale{return value==='zh'||value==='ru'?value:'en'}
export function readLocale(storage:Pick<Storage,'getItem'>|null):Locale{try{return validLocale(storage?.getItem(storageKey))}catch{return 'en'}}
export function saveLocale(storage:Pick<Storage,'setItem'>|null,locale:Locale){try{storage?.setItem(storageKey,locale);return true}catch{return false}}
export const dictionary={
 "关闭": {
  "en": "Close",
  "zh": "关闭",
  "ru": "Закрыть"
 },
 "返回": {
  "en": "Back",
  "zh": "返回",
  "ru": "Назад"
 },
 "清除筛选": {
  "en": "Clear filters",
  "zh": "清除筛选",
  "ru": "Сбросить фильтры"
 },
 "全部时期": {
  "en": "All periods",
  "zh": "全部时期",
  "ru": "Все периоды"
 },
 "指定年份": {
  "en": "Selected year",
  "zh": "指定年份",
  "ru": "Выбранный год"
 },
 "年代未知": {
  "en": "Unknown date",
  "zh": "年代未知",
  "ru": "Дата неизвестна"
 },
 "搜索类型、铭文、编号、来源…": {
  "en": "Search families, inscriptions, IDs, sources…",
  "zh": "搜索类型、铭文、编号、来源…",
  "ru": "Поиск семейств, надписей, номеров, источников…"
 },
 "类型家族": {
  "en": "Coin family",
  "zh": "类型家族",
  "ru": "Семейство монет"
 },
 "全部家族": {
  "en": "All families",
  "zh": "全部家族",
  "ru": "Все семейства"
 },
 "来源": {
  "en": "Source",
  "zh": "来源",
  "ru": "Источник"
 },
 "全部来源": {
  "en": "All sources",
  "zh": "全部来源",
  "ru": "Все источники"
 },
 "研究状态": {
  "en": "Research status",
  "zh": "研究状态",
  "ru": "Статус исследования"
 },
 "全部状态": {
  "en": "All statuses",
  "zh": "全部状态",
  "ru": "Все статусы"
 },
 "铭文 / Legend": {
  "en": "Inscription",
  "zh": "铭文 / Legend",
  "ru": "Надпись"
 },
 "全部已标注铭文": {
  "en": "All inscriptions",
  "zh": "全部已标注铭文",
  "ru": "Все надписи"
 },
 "Tamgha / 徽记": {
  "en": "Tamgha",
  "zh": "Tamgha / 徽记",
  "ru": "Тамга"
 },
 "全部已标注徽记": {
  "en": "All tamghas",
  "zh": "全部已标注徽记",
  "ru": "Все тамги"
 },
 "其他特征": {
  "en": "Other features",
  "zh": "其他特征",
  "ru": "Другие признаки"
 },
 "全部其他特征": {
  "en": "All features",
  "zh": "全部其他特征",
  "ru": "Все признаки"
 },
 "筛选摘要": {
  "en": "Filter summary",
  "zh": "筛选摘要",
  "ru": "Выбранные фильтры"
 },
 "年代筛选": {
  "en": "Date filter",
  "zh": "年代筛选",
  "ru": "Фильтр по дате"
 },
 "年代未知：当前没有完整有效的年代区间。": {
  "en": "Unknown date: no complete, valid date interval is recorded.",
  "zh": "年代未知：当前没有完整有效的年代区间。",
  "ru": "Дата неизвестна: полный допустимый период не указан."
 },
 "没有匹配记录。请调整或清除筛选。": {
  "en": "No matching records. Adjust or clear filters.",
  "zh": "没有匹配记录。请调整或清除筛选。",
  "ru": "Нет подходящих записей. Измените или сбросьте фильтры."
 },
 "目录": {
  "en": "Catalogue",
  "zh": "目录",
  "ru": "Каталог"
 },
 "返回此集合": {
  "en": "Back to this collection",
  "zh": "返回此集合",
  "ru": "Вернуться к этой группе"
 },
 "返回集合": {
  "en": "Back to collection",
  "zh": "返回集合",
  "ru": "Вернуться к группе"
 },
 "定位": {
  "en": "Locate",
  "zh": "定位",
  "ru": "Показать на карте"
 },
 "暂无地图定位": {
  "en": "No mapped location",
  "zh": "暂无地图定位",
  "ru": "Местоположение не указано"
 },
 "详情面板高度": {
  "en": "Detail panel height",
  "zh": "详情面板高度",
  "ru": "Высота панели"
 },
 "收起摘要": {
  "en": "Summary",
  "zh": "收起摘要",
  "ru": "Кратко"
 },
 "半展开浏览": {
  "en": "Browse",
  "zh": "半展开浏览",
  "ru": "Обзор"
 },
 "展开阅读": {
  "en": "Read",
  "zh": "展开阅读",
  "ru": "Чтение"
 },
 "展开家族详情": {
  "en": "Expand family details",
  "zh": "展开家族详情",
  "ru": "Развернуть сведения"
 },
 "收起家族详情": {
  "en": "Collapse family details",
  "zh": "收起家族详情",
  "ru": "Свернуть сведения"
 },
 "展开": {
  "en": "Expand",
  "zh": "展开",
  "ru": "Развернуть"
 },
 "收起": {
  "en": "Collapse",
  "zh": "收起",
  "ru": "Свернуть"
 },
 "时间 / 地图": {
  "en": "Time / map",
  "zh": "时间 / 地图",
  "ru": "Время / карта"
 },
 "返回筛选结果": {
  "en": "Restore filtered results",
  "zh": "返回筛选结果",
  "ru": "Вернуться к результатам фильтра"
 },
 "家族来源／目录组": {
  "en": "Family sources / catalogue groups",
  "zh": "家族来源／目录组",
  "ru": "Источники / группы каталога"
 },
 "全部来源／目录组": {
  "en": "All sources / catalogue groups",
  "zh": "全部来源／目录组",
  "ru": "Все источники / группы"
 },
 "分组待定": {
  "en": "Ungrouped",
  "zh": "分组待定",
  "ru": "Без группы"
 },
 "家族铭文／徽记／特征": {
  "en": "Inscriptions / tamghas / features",
  "zh": "家族铭文／徽记／特征",
  "ru": "Надписи / тамги / признаки"
 },
 "全部铭文 / 徽记 / 特征": {
  "en": "All inscriptions / tamghas / features",
  "zh": "全部铭文 / 徽记 / 特征",
  "ru": "Все надписи / тамги / признаки"
 },
 "图片未记录，仍可查看详情": {
  "en": "No image recorded. Details remain available.",
  "zh": "图片未记录，仍可查看详情",
  "ru": "Изображение не указано. Сведения доступны."
 },
 "图片详情": {
  "en": "Image details",
  "zh": "图片详情",
  "ru": "Сведения об изображении"
 },
 "重量未记录": {
  "en": "Weight not recorded",
  "zh": "重量未记录",
  "ru": "Вес не указан"
 },
 "直径未记录": {
  "en": "Diameter not recorded",
  "zh": "直径未记录",
  "ru": "Диаметр не указан"
 },
 "取消对比": {
  "en": "Remove from comparison",
  "zh": "取消对比",
  "ru": "Убрать из сравнения"
 },
 "对比": {
  "en": "Compare",
  "zh": "对比",
  "ru": "Сравнить"
 },
 "加入对比": {
  "en": "Add to comparison",
  "zh": "加入对比",
  "ru": "Добавить к сравнению"
 },
 "没有符合条件的记录。": {
  "en": "No matching records.",
  "zh": "没有符合条件的记录。",
  "ru": "Нет подходящих записей."
 },
 "清除家族内筛选": {
  "en": "Clear family filters",
  "zh": "清除家族内筛选",
  "ru": "Сбросить фильтры семейства"
 },
 "家族说明与研究问题": {
  "en": "Family notes and research questions",
  "zh": "家族说明与研究问题",
  "ru": "Описание и вопросы исследования"
 },
 "铭文、文献与来源": {
  "en": "Inscriptions, literature and sources",
  "zh": "铭文、文献与来源",
  "ru": "Надписи, литература и источники"
 },
 "铭文 / Inscription": {
  "en": "Inscription",
  "zh": "铭文 / Inscription",
  "ru": "Надпись"
 },
 "年代未记录": {
  "en": "Date not recorded",
  "zh": "年代未记录",
  "ru": "Дата не указана"
 },
 "地区未记录": {
  "en": "Region not recorded",
  "zh": "地区未记录",
  "ru": "Регион не указан"
 },
 "政权未记录": {
  "en": "Polity not recorded",
  "zh": "政权未记录",
  "ru": "Государство не указано"
 },
 "位置未记录": {
  "en": "Location not recorded",
  "zh": "位置未记录",
  "ru": "Место не указано"
 },
 "位置角色未记录": {
  "en": "Place role not recorded",
  "zh": "位置角色未记录",
  "ru": "Роль места не указана"
 },
 "来源索引加载中": {
  "en": "Loading source index…",
  "zh": "来源索引加载中",
  "ru": "Загрузка указателя источников…"
 },
 "来源索引加载失败；原始来源见详情": {
  "en": "Source index unavailable; original sources are in details.",
  "zh": "来源索引加载失败；原始来源见详情",
  "ru": "Указатель недоступен; источники доступны в сведениях."
 },
 "图层与图例": {
  "en": "Layers and legend",
  "zh": "图层与图例",
  "ru": "Слои и легенда"
 },
 "图层设置": {
  "en": "Map layers",
  "zh": "图层设置",
  "ru": "Слои карты"
 },
 "关闭图层设置": {
  "en": "Close map layers",
  "zh": "关闭图层设置",
  "ru": "Закрыть слои карты"
 },
 "完成 · 关闭": {
  "en": "Done",
  "zh": "完成 · 关闭",
  "ru": "Готово"
 },
 "钱币": {
  "en": "Coins",
  "zh": "钱币",
  "ru": "Монеты"
 },
 "历史地点": {
  "en": "Historical places",
  "zh": "历史地点",
  "ru": "Исторические места"
 },
 "发现与历史范围": {
  "en": "Finds and historical areas",
  "zh": "发现与历史范围",
  "ru": "Находки и исторические области"
 },
 "当前图例": {
  "en": "Legend",
  "zh": "当前图例",
  "ru": "Легенда"
 },
 "暂无对应数据": {
  "en": "No data available",
  "zh": "暂无对应数据",
  "ru": "Данных пока нет"
 },
 "当前家族临时背景": {
  "en": "Selected family background",
  "zh": "当前家族临时背景",
  "ru": "Контекст выбранного семейства"
 },
 "地域边缘 · 点线": {
  "en": "Regional edge · dotted",
  "zh": "地域边缘 · 点线",
  "ru": "Граница региона · точки"
 },
 "大致范围 · 虚线": {
  "en": "Approximate extent · dashed",
  "zh": "大致范围 · 虚线",
  "ru": "Примерная область · пунктир"
 },
 "政权边界（原图所绘）": {
  "en": "Polity boundary from source map",
  "zh": "政权边界（原图所绘）",
  "ru": "Граница государства по источнику"
 },
 "资料范围边缘": {
  "en": "Source coverage edge",
  "zh": "资料范围边缘",
  "ru": "Край охвата источника"
 },
 "历史背景": {
  "en": "Historical background",
  "zh": "历史背景",
  "ru": "Исторический контекст"
 },
 "资料与方法": {
  "en": "Sources and methods",
  "zh": "资料与方法",
  "ru": "Источники и методы"
 },
 "范围资料来源 ↗": {
  "en": "Range source ↗",
  "zh": "范围资料来源 ↗",
  "ru": "Источник области ↗"
 },
 "范围版本（不叠加）": {
  "en": "Range version",
  "zh": "范围版本（不叠加）",
  "ru": "Версия области"
 },
 "所选版本不存在，请重新选择": {
  "en": "Version unavailable. Select another.",
  "zh": "所选版本不存在，请重新选择",
  "ru": "Версия недоступна. Выберите другую."
 },
 "范围版本未记录": {
  "en": "No range version recorded",
  "zh": "范围版本未记录",
  "ru": "Версия области не указана"
 },
 "大致范围": {
  "en": "Approximate extent",
  "zh": "大致范围",
  "ru": "Примерная область"
 },
 "范围资料": {
  "en": "Range information",
  "zh": "范围资料",
  "ru": "Сведения об области"
 },
 "作为历史背景查看": {
  "en": "View as historical background",
  "zh": "作为历史背景查看",
  "ru": "Показать как исторический контекст"
 },
 "停止背景查看": {
  "en": "Stop background view",
  "zh": "停止背景查看",
  "ru": "Убрать исторический контекст"
 },
 "说明未记录": {
  "en": "No notes recorded",
  "zh": "说明未记录",
  "ru": "Примечания не указаны"
 },
 "地图背景 · 当前查看家族": {
  "en": "Historical background",
  "zh": "地图背景 · 当前查看家族",
  "ru": "Исторический контекст"
 },
 "当前查看家族的历史背景": {
  "en": "Background for the viewed family",
  "zh": "当前查看家族的历史背景",
  "ru": "Контекст просматриваемого семейства"
 },
 "显示相关背景": {
  "en": "Show background",
  "zh": "显示相关背景",
  "ru": "Показать контекст"
 },
 "背景解释／时期体系": {
  "en": "Background object",
  "zh": "背景解释／时期体系",
  "ru": "Объект контекста"
 },
 "家族背景体系": {
  "en": "Family background",
  "zh": "家族背景体系",
  "ru": "Контекст семейства"
 },
 "请选择（不合并解释）": {
  "en": "Choose a background",
  "zh": "请选择（不合并解释）",
  "ru": "Выберите контекст"
 },
 "请先选择背景体系，再查看对应范围。": {
  "en": "Choose a background to view its extent.",
  "zh": "请先选择背景体系，再查看对应范围。",
  "ru": "Выберите контекст для просмотра области."
 },
 "范围待补": {
  "en": "Range pending",
  "zh": "范围待补",
  "ru": "Область ещё не нанесена"
 },
 "全域": {
  "en": "Full map",
  "zh": "全域",
  "ru": "Вся карта"
 },
 "底图": {
  "en": "Basemap",
  "zh": "底图",
  "ru": "Подложка"
 },
 "Historical · 历史地图": {
  "en": "Historical",
  "zh": "Historical · 历史地图",
  "ru": "Историческая"
 },
 "Terrain · 地形": {
  "en": "Terrain",
  "zh": "Terrain · 地形",
  "ru": "Рельеф"
 },
 "Topographic · 现代地形": {
  "en": "Topographic",
  "zh": "Topographic · 现代地形",
  "ru": "Топографическая"
 },
 "重试图层一次": {
  "en": "Retry layers",
  "zh": "重试图层一次",
  "ru": "Повторить загрузку слоёв"
 },
 "Filters": {
  "en": "Filters",
  "zh": "筛选",
  "ru": "Фильтры"
 },
 "Clear filters": {
  "en": "Clear filters",
  "zh": "清除筛选",
  "ru": "Сбросить фильтры"
 },
 "Close details": {
  "en": "Close details",
  "zh": "关闭详情",
  "ru": "Закрыть сведения"
 },
 "Basemap": {
  "en": "Basemap",
  "zh": "底图",
  "ru": "Подложка"
 },
 "Issue date filter": {
  "en": "Year",
  "zh": "年份",
  "ru": "Год"
 },
 "历史地区 / Region": {
  "en": "Historical region",
  "zh": "历史地区 / Region",
  "ru": "Исторический регион"
 },
 "政权／地方体系 / Polity": {
  "en": "Polity / local system",
  "zh": "政权／地方体系 / Polity",
  "ru": "Государство / местная система"
 },
 "城市／遗址／地点 / Place": {
  "en": "City / site / place",
  "zh": "城市／遗址／地点 / Place",
  "ru": "Город / памятник / место"
 },
 "检索地区政权地点选项": {
  "en": "Search geographic options",
  "zh": "检索地区政权地点选项",
  "ru": "Поиск географических вариантов"
 },
 "检索中英文名称、别名或状态…": {
  "en": "Search names, aliases or status…",
  "zh": "检索中英文名称、别名或状态…",
  "ru": "Поиск названий, вариантов или статуса…"
 },
 "清除地区／政权／地点": {
  "en": "Clear geography filters",
  "zh": "清除地区／政权／地点",
  "ru": "Сбросить географические фильтры"
 },
 "状态与依据": {
  "en": "Status and evidence",
  "zh": "状态与依据",
  "ru": "Статус и основания"
 },
 "未记录": {
  "en": "Not recorded",
  "zh": "未记录",
  "ru": "Не указано"
 },
 "复制链接": {
  "en": "Copy link",
  "zh": "复制链接",
  "ru": "Копировать ссылку"
 },
 "加载中…": {
  "en": "Loading…",
  "zh": "加载中…",
  "ru": "Загрузка…"
 },
 "重试": {
  "en": "Retry",
  "zh": "重试",
  "ru": "Повторить"
 },
 "Atlas": {
  "en": "Atlas",
  "zh": "地图",
  "ru": "Атлас"
 },
 "Catalogue": {
  "en": "Catalogue",
  "zh": "目录",
  "ru": "Каталог"
 },
 "Research": {
  "en": "Research",
  "zh": "研究",
  "ru": "Исследования"
 },
 "CENTRAL ASIAN SQUARE-HOLE COINAGE ATLAS": {
  "en": "CENTRAL ASIAN SQUARE-HOLE COINAGE ATLAS",
  "zh": "中亚方孔钱地图",
  "ru": "АТЛАС МОНЕТ ЦЕНТРАЛЬНОЙ АЗИИ"
 },
 "中亚方孔钱地图与图像资料库": {
  "en": "Square-hole coinage · map and images",
  "zh": "中亚方孔钱地图与图像资料库",
  "ru": "Монеты с квадратным отверстием · карта и изображения"
 },
 "钱币家族与集合": {
  "en": "Coin families and collections",
  "zh": "钱币家族与集合",
  "ru": "Семейства и группы монет"
 },
 "核心历史地点": {
  "en": "Core historical places",
  "zh": "核心历史地点",
  "ru": "Основные исторические места"
 },
 "政治中心": {
  "en": "Political centers",
  "zh": "政治中心",
  "ru": "Политические центры"
 },
 "考古遗址": {
  "en": "Archaeological sites",
  "zh": "考古遗址",
  "ru": "Археологические памятники"
 },
 "铸币地及候选": {
  "en": "Mints and candidates",
  "zh": "铸币地及候选",
  "ru": "Монетные дворы и кандидаты"
 },
 "单枚出土": {
  "en": "Single finds",
  "zh": "单枚出土",
  "ru": "Отдельные находки"
 },
 "窖藏": {
  "en": "Hoards",
  "zh": "窖藏",
  "ru": "Клады"
 },
 "政权范围": {
  "en": "Polity extent",
  "zh": "政权范围",
  "ru": "Область государства"
 },
 "钱币流通范围": {
  "en": "Coin circulation",
  "zh": "钱币流通范围",
  "ru": "Область обращения монет"
 },
 "地域背景": {
  "en": "Regional context",
  "zh": "地域背景",
  "ru": "Региональный контекст"
 },
 "历史城市／地点": {
  "en": "Historical cities / places",
  "zh": "历史城市／地点",
  "ru": "Исторические города / места"
 },
 "铸币地": {
  "en": "Mint",
  "zh": "铸币地",
  "ru": "Монетный двор"
 },
 "铸币地候选": {
  "en": "Mint candidate",
  "zh": "铸币地候选",
  "ru": "Предполагаемый монетный двор"
 },
 "原集合当前无匹配结果": {
  "en": "No matches in this collection",
  "zh": "原集合当前无匹配结果",
  "ru": "В этой группе нет совпадений"
 },
 "原集合当前无匹配结果；恢复筛选后可继续浏览。": {
  "en": "No matches. Restore filters to browse this collection.",
  "zh": "原集合当前无匹配结果；恢复筛选后可继续浏览。",
  "ru": "Нет совпадений. Восстановите фильтры для просмотра группы."
 },
 "显示集合": {
  "en": "Display collection",
  "zh": "显示集合",
  "ru": "Группа на карте"
 },
 "空间集合": {
  "en": "Spatial collection",
  "zh": "空间集合",
  "ru": "Пространственная группа"
 },
 "来源待解析": {
  "en": "Source unresolved",
  "zh": "来源待解析",
  "ru": "Источник уточняется"
 },
 "编号待解析": {
  "en": "ID unresolved",
  "zh": "编号待解析",
  "ru": "Номер уточняется"
 },
 "无可用图片；仍可打开家族": {
  "en": "No image available; open family details.",
  "zh": "无可用图片；仍可打开家族",
  "ru": "Изображение недоступно; сведения о семействе доступны."
 },
 "家族详情": {
  "en": "Family details",
  "zh": "家族详情",
  "ru": "Сведения о семействе"
 },
 "打开图片": {
  "en": "Open image",
  "zh": "打开图片",
  "ru": "Открыть изображение"
 },
 "查看全部": {
  "en": "View all",
  "zh": "查看全部",
  "ru": "Показать все"
 },
 "已选": {
  "en": "Selected",
  "zh": "已选",
  "ru": "Выбрано"
 },
 "相关图层尚未开启": {
  "en": "Related layer is off",
  "zh": "相关图层尚未开启",
  "ru": "Соответствующий слой выключен"
 },
 "范围版本": {
  "en": "Range version",
  "zh": "范围版本",
  "ru": "Версия области"
 },
 "显示所选版本": {
  "en": "Selected version displayed",
  "zh": "显示所选版本",
  "ru": "Показана выбранная версия"
 },
 "范围年代待定": {
  "en": "Range dates unresolved",
  "zh": "范围年代待定",
  "ru": "Даты области уточняются"
 },
 "跨时期地域背景，非年代缺失": {
  "en": "Cross-period regional context",
  "zh": "跨时期地域背景，非年代缺失",
  "ru": "Региональный контекст для разных периодов"
 },
 "该范围起止已知，不属于年代未知": {
  "en": "This version has known dates",
  "zh": "该范围起止已知，不属于年代未知",
  "ru": "Даты этой версии известны"
 },
 "跨时期地域背景": {
  "en": "Cross-period regional context",
  "zh": "跨时期地域背景",
  "ru": "Региональный контекст для разных периодов"
 },
 "所选版本明确匹配": {
  "en": "Version matches this year",
  "zh": "所选版本明确匹配",
  "ru": "Версия соответствует году"
 },
 "所选版本明确不匹配": {
  "en": "Version does not match this year",
  "zh": "所选版本明确不匹配",
  "ru": "Версия не соответствует году"
 },
 "该年范围待定": {
  "en": "Range for this year is uncertain",
  "zh": "该年范围待定",
  "ru": "Область для этого года не определена"
 },
 "所选范围版本不存在；请明确选择已有版本": {
  "en": "Version unavailable. Choose an existing version.",
  "zh": "所选范围版本不存在；请明确选择已有版本",
  "ru": "Версия недоступна. Выберите существующую."
 },
 "范围待补；对象与来源入口保留": {
  "en": "Range pending. Sources remain available.",
  "zh": "范围待补；对象与来源入口保留",
  "ru": "Область ещё не нанесена. Источники доступны."
 },
 "其他版本有明确匹配，请主动选择（不会自动换期）": {
  "en": "Another version matches. Select it to view.",
  "zh": "其他版本有明确匹配，请主动选择（不会自动换期）",
  "ru": "Другая версия соответствует году. Выберите её."
 },
 "全部图层已关闭": {
  "en": "All layers are off",
  "zh": "全部图层已关闭",
  "ru": "Все слои выключены"
 },
 "查看来源 ↗": {
  "en": "View source ↗",
  "zh": "查看来源 ↗",
  "ru": "Открыть источник ↗"
 },
 "链接已复制": {
  "en": "Link copied",
  "zh": "链接已复制",
  "ru": "Ссылка скопирована"
 },
 "无法访问剪贴板，请手动复制": {
  "en": "Clipboard unavailable. Copy the link below.",
  "zh": "无法访问剪贴板，请手动复制",
  "ru": "Буфер обмена недоступен. Скопируйте ссылку ниже."
 },
 "手动复制完整链接": {
  "en": "Copy full link manually",
  "zh": "手动复制完整链接",
  "ru": "Скопировать полную ссылку"
 },
 "缩小": {
  "en": "Zoom out",
  "zh": "缩小",
  "ru": "Уменьшить"
 },
 "放大": {
  "en": "Zoom in",
  "zh": "放大",
  "ru": "Увеличить"
 },
 "适应窗口": {
  "en": "Fit to window",
  "zh": "适应窗口",
  "ru": "По размеру окна"
 },
 "原尺寸 100%": {
  "en": "Actual size 100%",
  "zh": "原尺寸 100%",
  "ru": "Исходный размер 100%"
 },
 "图片缩放": {
  "en": "Image zoom",
  "zh": "图片缩放",
  "ru": "Масштаб изображения"
 },
 "当前图片缩放": {
  "en": "Current image zoom",
  "zh": "当前图片缩放",
  "ru": "Текущий масштаб"
 },
 "新标签页打开原图": {
  "en": "Open original in new tab",
  "zh": "新标签页打开原图",
  "ru": "Открыть оригинал в новой вкладке"
 },
 "原始来源图片": {
  "en": "Source image",
  "zh": "原始来源图片",
  "ru": "Изображение источника"
 },
 "上一张": {
  "en": "Previous image",
  "zh": "上一张",
  "ru": "Предыдущее изображение"
 },
 "下一张": {
  "en": "Next image",
  "zh": "下一张",
  "ru": "Следующее изображение"
 },
 "图片加载中…": {
  "en": "Loading image…",
  "zh": "图片加载中…",
  "ru": "Загрузка изображения…"
 },
 "图片加载失败": {
  "en": "Image could not load",
  "zh": "图片加载失败",
  "ru": "Не удалось загрузить изображение"
 },
 "重试图片": {
  "en": "Retry image",
  "zh": "重试图片",
  "ru": "Повторить загрузку изображения"
 },
 "没有图片": {
  "en": "No image",
  "zh": "没有图片",
  "ru": "Нет изображения"
 },
 "部分地图瓦片未能加载，可切换底图或稍后重试。": {
  "en": "Some map tiles could not load. Try another basemap.",
  "zh": "部分地图瓦片未能加载，可切换底图或稍后重试。",
  "ru": "Некоторые фрагменты карты не загрузились. Выберите другую подложку."
 },
 "当前浏览器未能启动交互地图；Catalogue 仍可正常浏览。": {
  "en": "Interactive map unavailable. Catalogue remains accessible.",
  "zh": "当前浏览器未能启动交互地图；Catalogue 仍可正常浏览。",
  "ru": "Интерактивная карта недоступна. Каталог доступен."
 },
 "当前时期没有可显示的相关范围；请选定背景体系和范围时期。": {
  "en": "No range is visible for this period. Choose a background and version.",
  "zh": "当前时期没有可显示的相关范围；请选定背景体系和范围时期。",
  "ru": "Для этого периода область не показана. Выберите контекст и версию."
 },
 "当前查看家族的背景": {
  "en": "Background for the viewed family",
  "zh": "当前查看家族的背景",
  "ru": "Контекст просматриваемого семейства"
 },
 "不属于当前匹配结果": {
  "en": "Outside the current results",
  "zh": "不属于当前匹配结果",
  "ru": "Не входит в текущие результаты"
 },
 "查看相关范围": {
  "en": "View related extent",
  "zh": "查看相关范围",
  "ru": "Показать связанную область"
 },
 "相关政权／地方体系关系未记录，保留原有归属说明。": {
  "en": "No background relationship recorded.",
  "zh": "相关政权／地方体系关系未记录，保留原有归属说明。",
  "ru": "Связь с историческим контекстом не указана."
 },
 "图层只改变地图显示。展示锚点不等于铸币地或出土地；范围年份独立于钱币年代。": {
  "en": "Layers change the map display, not search results.",
  "zh": "图层只改变地图显示。展示锚点不等于铸币地或出土地；范围年份独立于钱币年代。",
  "ru": "Слои меняют отображение карты, а не результаты поиска."
 },
 "币图／集合 · 角标为匹配家族数": {
  "en": "Coins / collections · badge shows family count",
  "zh": "币图／集合 · 角标为匹配家族数",
  "ru": "Монеты / группы · число семейств на значке"
 },
 "资料覆盖边缘 · 填色截断，不绘国界": {
  "en": "Source coverage edge",
  "zh": "资料覆盖边缘 · 填色截断，不绘国界",
  "ru": "Край охвата источника"
 },
 "所有图层已关闭；筛选计数保持。": {
  "en": "All layers are off.",
  "zh": "所有图层已关闭；筛选计数保持。",
  "ru": "Все слои выключены."
 },
 "关闭详情": {
  "en": "Close details",
  "zh": "关闭详情",
  "ru": "Закрыть сведения"
 },
 "主库图片详情": {
  "en": "Record image details",
  "zh": "主库图片详情",
  "ru": "Изображения записи"
 },
 "此记录不符合当前筛选；不计入当前匹配数量。": {
  "en": "This record is outside the current results.",
  "zh": "此记录不符合当前筛选；不计入当前匹配数量。",
  "ru": "Эта запись не входит в текущие результаты."
 },
 "来源／目录组不等同于已审定学术 variant。": {
  "en": "Source / catalogue groups are editorial groupings.",
  "zh": "来源／目录组不等同于已审定学术 variant。",
  "ru": "Группы источников / каталога — редакционные группы."
 },
 "Interactive terrain map of Central Asia; drag to pan, scroll or pinch to zoom": {
  "en": "Central Asia map: drag to pan, scroll or pinch to zoom",
  "zh": "中亚地图：拖动平移，滚轮或双指缩放",
  "ru": "Карта Центральной Азии: перемещение перетаскиванием, масштаб колесом или жестом"
 },
 "图片视口：滚轮或双指缩放，Shift＋方向键或拖动平移": {
  "en": "Image: scroll to zoom; drag or Shift+arrows to pan",
  "zh": "图片视口：滚轮或双指缩放，Shift＋方向键或拖动平移",
  "ru": "Изображение: колесо — масштаб; перетаскивание или Shift+стрелки — перемещение"
 },
 "（待解析）": {
  "en": " (unresolved)",
  "zh": "（待解析）",
  "ru": " (уточняется)"
 },
 "资料所绘范围": {
  "en": "Extent from source",
  "zh": "资料所绘范围",
  "ru": "Область по источнику"
 },
 "confirmed": {
  "en": "Confirmed",
  "zh": "已确认",
  "ru": "Подтверждено"
 },
 "probable": {
  "en": "Probable",
  "zh": "可能",
  "ru": "Вероятно"
 },
 "candidate": {
  "en": "Candidate",
  "zh": "候选",
  "ru": "Кандидат"
 },
 "contextual": {
  "en": "Contextual",
  "zh": "背景",
  "ru": "Контекст"
 },
 "unresolved": {
  "en": "Unresolved",
  "zh": "未定",
  "ru": "Не определено"
 },
 "not yet reviewed": {
  "en": "Not yet reviewed",
  "zh": "尚未审查",
  "ru": "Ещё не изучено"
 },
 "researching": {
  "en": "Under study",
  "zh": "研究中",
  "ru": "Исследуется"
 },
 "source_label": {
  "en": "Source label",
  "zh": "来源标签",
  "ru": "Метка источника"
 },
 "unassigned": {
  "en": "Unassigned",
  "zh": "未定",
  "ru": "Не определено"
 },
 "无坐标": {
  "en": "Unmapped",
  "zh": "无坐标",
  "ru": "Без координат"
 },
 "城市及地点未记录": {
  "en": "Place not recorded",
  "zh": "城市及地点未记录",
  "ru": "Место не указано"
 },
 "Zoom in": {
  "en": "Zoom in",
  "zh": "放大",
  "ru": "Увеличить"
 },
 "Zoom out": {
  "en": "Zoom out",
  "zh": "缩小",
  "ru": "Уменьшить"
 },
 "Toggle attribution": {
  "en": "Map attribution",
  "zh": "地图署名",
  "ru": "Источники карты"
 },
 "正在加载原图…": {
  "en": "Loading original image…",
  "zh": "正在加载原图…",
  "ru": "Загрузка оригинала…"
 },
 "图片加载失败；记录和来源仍可阅读。": {
  "en": "Image unavailable. Record and sources remain accessible.",
  "zh": "图片加载失败；记录和来源仍可阅读。",
  "ru": "Изображение недоступно. Запись и источники доступны."
 },
 "已达两次重试上限": {
  "en": "Retry limit reached",
  "zh": "已达两次重试上限",
  "ru": "Число повторов исчерпано"
 },
 "暂无可用图片；记录与来源仍可阅读。": {
  "en": "No image available. Record and sources remain accessible.",
  "zh": "暂无可用图片；记录与来源仍可阅读。",
  "ru": "Изображение отсутствует. Запись и источники доступны."
 },
 "当前完整原图": {
  "en": "Original image",
  "zh": "当前完整原图",
  "ru": "Исходное изображение"
 },
 "尺寸待图片加载确认。": {
  "en": "Dimensions available after loading.",
  "zh": "尺寸待图片加载确认。",
  "ru": "Размеры появятся после загрузки."
 },
 "左右键切图，＋／－缩放，0适应窗口，Shift＋方向键平移。滚轮／双指缩放，放大后拖动。": {
  "en": "Arrows: switch image. +/−: zoom. 0: fit. Shift+arrows: pan. Scroll or pinch to zoom, drag to pan.",
  "zh": "左右键切图，＋／－缩放，0适应窗口，Shift＋方向键平移。滚轮／双指缩放，放大后拖动。",
  "ru": "Стрелки: смена изображения. +/−: масштаб. 0: вписать. Shift+стрелки: перемещение. Колесо или жест: масштаб; перетаскивание: перемещение."
 },
 "新标签页打开本地原图 ↗": {
  "en": "Open original in new tab ↗",
  "zh": "新标签页打开本地原图 ↗",
  "ru": "Открыть оригинал в новой вкладке ↗"
 },
 "历史图层未能加载。底图与目录仍可使用。": {
  "en": "Historical layers unavailable. Map and catalogue remain accessible.",
  "zh": "历史图层未能加载。底图与目录仍可使用。",
  "ru": "Исторические слои недоступны. Карта и каталог доступны."
 },
 "筛选": {
  "en": "Filters",
  "zh": "筛选",
  "ru": "Фильтры"
 },
 "年代 · 收起": {
  "en": "Time · collapse",
  "zh": "年代 · 收起",
  "ru": "Время · свернуть"
 },
 "关联地点": {
  "en": "Related places",
  "zh": "关联地点",
  "ru": "Связанные места"
 },
 "相关 / held / excluded": {
  "en": "Related / held / excluded",
  "zh": "相关 / held / excluded",
  "ru": "Связанные / отложенные / исключённые"
 },
 "条来源记录匹配当前搜索": {
  "en": "source records match this search",
  "zh": "条来源记录匹配当前搜索",
  "ru": "записей источников найдено"
 },
 "数据异常：年代区间非法或倒置。": {
  "en": "Invalid or reversed date interval.",
  "zh": "数据异常：年代区间非法或倒置。",
  "ru": "Недопустимый или обратный интервал дат."
 },
 "搜索": {
  "en": "Search",
  "zh": "搜索",
  "ru": "Поиск"
 },
 "unknown": {
  "en": "Unassigned / unknown",
  "zh": "未标注／未定",
  "ru": "Не указано / неизвестно"
 },
 "research": {
  "en": "Under study / insufficient evidence",
  "zh": "研究中／资料不足",
  "ru": "Исследуется / недостаточно данных"
 },
 "source_only": {
  "en": "Source label only",
  "zh": "仅来源标签",
  "ru": "Только метка источника"
 },
 "multiple": {
  "en": "Multiple attributions",
  "zh": "多种关联",
  "ru": "Несколько атрибуций"
 },
 "catalogue_linked": {
  "en": "Catalogue-linked",
  "zh": "已关联目录",
  "ru": "Связано с каталогом"
 },
 "exploration": {
  "en": "Under study",
  "zh": "研究中",
  "ru": "Исследуется"
 },
 "mapped": {
  "en": "Mapped",
  "zh": "已定位",
  "ru": "Нанесено на карту"
 },
 "source_linked": {
  "en": "Source-linked",
  "zh": "已关联来源",
  "ru": "Связано с источником"
 },
 "source_linked_candidate": {
  "en": "Source-linked candidate",
  "zh": "有来源的候选",
  "ru": "Кандидат со ссылкой на источник"
 },
 "source_linked_context_family": {
  "en": "Contextual family",
  "zh": "背景家族",
  "ru": "Контекстное семейство"
 },
 "atlas_field": {
  "en": "Atlas attribution",
  "zh": "已有归属",
  "ru": "Атрибуция атласа"
 },
 "user_scope": {
  "en": "Research scope",
  "zh": "建设范围",
  "ru": "Объект исследования"
 },
 "Close popup": {
  "en": "Close popup",
  "zh": "关闭弹窗",
  "ru": "Закрыть окно"
 },

 "Atlas 钱币纲目": {
  "en": "Atlas coin catalogue",
  "zh": "Atlas 钱币纲目",
  "ru": "Каталог монет Atlas"
 },
 "Atlas 纲目": {
  "en": "Atlas catalogue",
  "zh": "Atlas 纲目",
  "ru": "Каталог Atlas"
 },
 "来源目录": {
  "en": "Sources",
  "zh": "来源目录",
  "ru": "Источники"
 },
 "纲目与来源目录 · 当前 Atlas 筛选同步": {
  "en": "Catalogue and sources · current Atlas filters",
  "zh": "纲目与来源目录 · 当前 Atlas 筛选同步",
  "ru": "Каталог и источники · фильтры Atlas"
 },
 "搜索名称、编号、来源…": {
  "en": "Search names, IDs, sources…",
  "zh": "搜索名称、编号、来源…",
  "ru": "Поиск названий, номеров, источников…"
 },
 "清空目录搜索": {
  "en": "Clear catalogue search",
  "zh": "清空目录搜索",
  "ru": "Очистить поиск"
 },
 "清除全部筛选": {
  "en": "Clear all filters",
  "zh": "清除全部筛选",
  "ru": "Сбросить все фильтры"
 },
 "返回来源目录": {
  "en": "Back to sources",
  "zh": "返回来源目录",
  "ru": "Назад к источникам"
 },
 "请选择有匹配记录的目录节点": {
  "en": "Choose a catalogue entry",
  "zh": "请选择有匹配记录的目录节点",
  "ru": "Выберите раздел каталога"
 },
 "当前选择可能已被筛掉。请从左侧重新选择，或返回 Atlas 调整筛选。": {
  "en": "Select an entry on the left, or adjust Atlas filters.",
  "zh": "当前选择可能已被筛掉。请从左侧重新选择，或返回 Atlas 调整筛选。",
  "ru": "Выберите раздел слева или измените фильтры Atlas."
 },
 "来源索引加载失败，仍可按主库ID或名称浏览。": {
  "en": "Source index unavailable. Browse by record ID or name.",
  "zh": "来源索引加载失败，仍可按主库ID或名称浏览。",
  "ru": "Индекс источников недоступен. Поиск по номеру или названию доступен."
 },
 "来源索引加载失败；主库与相关资料仍可访问。": {
  "en": "Source index unavailable. Records and related material remain accessible.",
  "zh": "来源索引加载失败；主库与相关资料仍可访问。",
  "ru": "Индекс источников недоступен. Записи и связанные материалы доступны."
 },
 "来源索引加载中…": {
  "en": "Loading source index…",
  "zh": "来源索引加载中…",
  "ru": "Загрузка индекса источников…"
 },
 "重试来源索引": {
  "en": "Retry source index",
  "zh": "重试来源索引",
  "ru": "Загрузить индекс повторно"
 },
 "参考资料 comparison / 其他非实际关系": {
  "en": "References · comparison and other links",
  "zh": "参考资料 comparison / 其他非实际关系",
  "ru": "Справочные материалы · сравнения и другие связи"
 },
 "参考关系不计入实际来源。": {
  "en": "Reference links are listed separately from actual sources.",
  "zh": "参考关系不计入实际来源。",
  "ru": "Справочные ссылки приведены отдельно от источников монет."
 },
 "来源/目录组不是已审定 variant；major type / variant 尚未审定。": {
  "en": "Source / catalogue groups are editorial groupings; types and variants are under review.",
  "zh": "来源/目录组不是已审定 variant；major type / variant 尚未审定。",
  "ru": "Группы источников / каталога — редакционные группы; типы и варианты уточняются."
 },
 "没有匹配的主库记录。请清空目录搜索或调整筛选。": {
  "en": "No matching records. Clear the catalogue search or adjust filters.",
  "zh": "没有匹配的主库记录。请清空目录搜索或调整筛选。",
  "ru": "Нет подходящих записей. Очистите поиск или измените фильтры."
 },
 "家族 {name}": {
  "en": "Family: {name}",
  "zh": "家族 {name}",
  "ru": "Семейство: {name}"
 },
 "目录组 {name}": {
  "en": "Catalogue group: {name}",
  "zh": "目录组 {name}",
  "ru": "Группа каталога: {name}"
 },
 "记录 {id}": {
  "en": "Record {id}",
  "zh": "记录 {id}",
  "ru": "Запись {id}"
 },
 "从左侧展开家族、来源/目录组和记录。所有时期的无年代、无坐标记录仍可访问；数量表示主库记录。": {
  "en": "Expand families, source / catalogue groups and records on the left. Undated and unmapped records remain accessible in All periods.",
  "zh": "从左侧展开家族、来源/目录组和记录。所有时期的无年代、无坐标记录仍可访问；数量表示主库记录。",
  "ru": "Раскройте семейства, группы источников / каталога и записи слева. В режиме «Все периоды» доступны записи без дат и координат."
 },
 "未分组（目录归属未明确）": {
  "en": "Ungrouped",
  "zh": "未分组（目录归属未明确）",
  "ru": "Без группы"
 },
 "未明确": {
  "en": "Unspecified",
  "zh": "未明确",
  "ru": "Не указано"
 },
 "地域": {
  "en": "Region",
  "zh": "地域",
  "ru": "Регион"
 },
 "政权": {
  "en": "Polity",
  "zh": "政权",
  "ru": "Политическое образование"
 },
 "重量": {
  "en": "Weight",
  "zh": "重量",
  "ru": "Вес"
 },
 "直径": {
  "en": "Diameter",
  "zh": "直径",
  "ru": "Диаметр"
 },
 "实际来源": {
  "en": "Actual sources",
  "zh": "实际来源",
  "ru": "Источники монеты"
 },
 "来源索引未加载或未记录": {
  "en": "Source index unavailable or source not recorded",
  "zh": "来源索引未加载或未记录",
  "ru": "Индекс недоступен или источник не указан"
 },
 "来源记录": {
  "en": "Source record",
  "zh": "来源记录",
  "ru": "Запись источника"
 },
 "来源分类": {
  "en": "Source category",
  "zh": "来源分类",
  "ru": "Категория источника"
 },
 "分类路径未记录": {
  "en": "Category path not recorded",
  "zh": "分类路径未记录",
  "ru": "Путь категории не указан"
 },
 "没有匹配的实际来源。请清空搜索或调整筛选。": {
  "en": "No matching sources. Clear the search or adjust filters.",
  "zh": "没有匹配的实际来源。请清空搜索或调整筛选。",
  "ru": "Нет подходящих источников. Очистите поиск или измените фильтры."
 },
 "当前可浏览主库子集": {
  "en": "Currently browsable records",
  "zh": "当前可浏览主库子集",
  "ru": "Доступные записи"
 },
 "历史快照": {
  "en": "Dated snapshot",
  "zh": "历史快照",
  "ru": "Снимок источника"
 },
 "覆盖未核定：没有明确对应此分类ID的覆盖证据。": {
  "en": "Coverage not established for this category.",
  "zh": "覆盖未核定：没有明确对应此分类ID的覆盖证据。",
  "ru": "Охват этой категории не установлен."
 },
 "历史快照不随筛选变化；主库关联数量不是来源采集完成率。": {
  "en": "Snapshot counts stay fixed when filters change. Linked records are shown separately.",
  "zh": "历史快照不随筛选变化；主库关联数量不是来源采集完成率。",
  "ru": "Число записей в снимке не зависит от фильтров. Связанные записи учитываются отдельно."
 },
 "出处": {
  "en": "Source reference",
  "zh": "出处",
  "ru": "Источник сведений"
 },
 "范围仅为当前筛选结果已关联的主库来源，不代表全部3999来源实体或全部来源快照。参考关系不计入实际来源。": {
  "en": "Browse sources linked to the current records. Reference links are listed separately.",
  "zh": "范围仅为当前筛选结果已关联的主库来源，不代表全部3999来源实体或全部来源快照。参考关系不计入实际来源。",
  "ru": "Здесь показаны источники текущих записей. Справочные ссылки приведены отдельно."
 },
 "打开记录 {id}": {
  "en": "Open record {id}",
  "zh": "打开记录 {id}",
  "ru": "Открыть запись {id}"
 },
 "主库记录 ID": {
  "en": "Record ID",
  "zh": "主库记录 ID",
  "ru": "Номер записи"
 },
 "关系": {
  "en": "Relationship",
  "zh": "关系",
  "ru": "Связь"
 },
 "原始标签": {
  "en": "Original labels",
  "zh": "原始标签",
  "ru": "Исходные метки"
 },
 "来源分类路径": {
  "en": "Source category path",
  "zh": "来源分类路径",
  "ru": "Путь категории источника"
 },
 "原始来源页面": {
  "en": "Original source page",
  "zh": "原始来源页面",
  "ru": "Страница первоисточника"
 },
 "same_specimen": {
  "en": "Same coin",
  "zh": "same_specimen",
  "ru": "Та же монета"
 },
 "comparison": {
  "en": "Comparison",
  "zh": "comparison",
  "ru": "Сравнение"
 },
 "相关与暂缓资料": {
  "en": "Related and held material",
  "zh": "相关与暂缓资料",
  "ru": "Связанные и отложенные материалы"
 },
 "相关资料来源图片": {
  "en": "Source image for related material",
  "zh": "相关资料来源图片",
  "ru": "Изображение связанного материала"
 },
 "图片加载失败；文字与来源仍可访问": {
  "en": "Image unavailable. Text and sources remain accessible.",
  "zh": "图片加载失败；文字与来源仍可访问",
  "ru": "Изображение недоступно. Текст и источники доступны."
 },
 "暂无可用图片": {
  "en": "No image available",
  "zh": "暂无可用图片",
  "ru": "Изображение отсутствует"
 },
 "相关资料": {
  "en": "Related material",
  "zh": "相关资料",
  "ru": "Связанные материалы"
 },
 "地理条件匹配": {
  "en": "Matching geography",
  "zh": "地理条件匹配",
  "ru": "По географическим фильтрам"
 },
 "当前搜索匹配": {
  "en": "Search results",
  "zh": "当前搜索匹配",
  "ru": "Результаты поиска"
 },
 "主库记录": {
  "en": "Main records",
  "zh": "主库记录",
  "ru": "Основные записи"
 },
 "保留原始来源、分类路径、审查状态和原因；状态不触发原始资料删除。": {
  "en": "Original sources, category paths and review decisions are retained.",
  "zh": "保留原始来源、分类路径、审查状态和原因；状态不触发原始资料删除。",
  "ru": "Сохранены исходные источники, пути категорий и решения проверки."
 },
 "图片索引加载失败，文字资料和来源链接仍可访问。": {
  "en": "Image index unavailable. Text and source links remain accessible.",
  "zh": "图片索引加载失败，文字资料和来源链接仍可访问。",
  "ru": "Индекс изображений недоступен. Текст и ссылки на источники доступны."
 },
 "重试图片索引": {
  "en": "Retry image index",
  "zh": "重试图片索引",
  "ru": "Загрузить индекс изображений повторно"
 },
 "正在加载图片索引；文字资料可先浏览。": {
  "en": "Loading image index. You can browse text now.",
  "zh": "正在加载图片索引；文字资料可先浏览。",
  "ru": "Загрузка индекса изображений. Текст уже доступен."
 },
 "没有匹配的相关资料。请调整搜索词。": {
  "en": "No related material found. Try another search.",
  "zh": "没有匹配的相关资料。请调整搜索词。",
  "ru": "Связанные материалы не найдены. Измените запрос."
 },
 "查看详情": {
  "en": "View details",
  "zh": "查看详情",
  "ru": "Подробнее"
 },
 "查看详情：{title}": {
  "en": "View details: {title}",
  "zh": "查看详情：{title}",
  "ru": "Подробнее: {title}"
 },
 "图片索引不可用": {
  "en": "Image index unavailable",
  "zh": "图片索引不可用",
  "ru": "Индекс изображений недоступен"
 },
 "图片索引加载中": {
  "en": "Loading image index",
  "zh": "图片索引加载中",
  "ru": "Загрузка индекса изображений"
 },
 "打开原始记录": {
  "en": "Open original record",
  "zh": "打开原始记录",
  "ru": "Открыть исходную запись"
 },
 "已显示 {visible} / {total} 条相关资料": {
  "en": "Showing {visible} of {total} related records",
  "zh": "已显示 {visible} / {total} 条相关资料",
  "ru": "Показано {visible} из {total} связанных записей"
 },
 "加载更多（40条）": {
  "en": "Load 40 more",
  "zh": "加载更多（40条）",
  "ru": "Загрузить ещё 40"
 },
 "相关资料详情": {
  "en": "Related record details",
  "zh": "相关资料详情",
  "ru": "Связанная запись"
 },
 "审查状态": {
  "en": "Review status",
  "zh": "审查状态",
  "ru": "Статус проверки"
 },
 "原始审查原因": {
  "en": "Original review reason",
  "zh": "原始审查原因",
  "ru": "Исходная причина решения"
 },
 "原始记录页面": {
  "en": "Original record page",
  "zh": "原始记录页面",
  "ru": "Страница исходной записи"
 },
 "related": {
  "en": "Related",
  "zh": "related",
  "ru": "Связанный материал"
 },
 "held": {
  "en": "Held for review",
  "zh": "held",
  "ru": "Отложено для проверки"
 },
 "excluded": {
  "en": "Excluded from main catalogue",
  "zh": "excluded",
  "ru": "Не включено в основной каталог"
 },
 "当前图片来源信息：未记录": {
  "en": "Image provenance not recorded",
  "zh": "当前图片来源信息：未记录",
  "ru": "Происхождение изображения не указано"
 },
 "当前图片来源信息": {
  "en": "Current image provenance",
  "zh": "当前图片来源信息",
  "ru": "Происхождение текущего изображения"
 },
 "当前图片来源": {
  "en": "Current image source",
  "zh": "当前图片来源",
  "ru": "Источник текущего изображения"
 },
 "来源平台": {
  "en": "Source platform",
  "zh": "来源平台",
  "ru": "Платформа источника"
 },
 "原始记录编号": {
  "en": "Original record ID",
  "zh": "原始记录编号",
  "ru": "Исходный номер записи"
 },
 "未记录 / 待解析": {
  "en": "Not recorded / unresolved",
  "zh": "未记录 / 待解析",
  "ru": "Не указано / уточняется"
 },
 "来源记录页面": {
  "en": "Source record page",
  "zh": "来源记录页面",
  "ru": "Страница записи источника"
 },
 "来源网站原始图片": {
  "en": "Original source image",
  "zh": "来源网站原始图片",
  "ru": "Исходное изображение источника"
 },
 "图片署名": {
  "en": "Image credit",
  "zh": "图片署名",
  "ru": "Авторство изображения"
 },
 "权利状态": {
  "en": "Rights status",
  "zh": "权利状态",
  "ru": "Статус прав"
 },
 "未核实（unverified），不表示开放许可": {
  "en": "Unverified",
  "zh": "未核实（unverified），不表示开放许可",
  "ru": "Не проверено"
 },
 "原始权利说明": {
  "en": "Original rights statement",
  "zh": "原始权利说明",
  "ru": "Исходные сведения о правах"
 },
 "权利说明出处": {
  "en": "Rights statement source",
  "zh": "权利说明出处",
  "ru": "Источник сведений о правах"
 },
 "记录尺寸": {
  "en": "Recorded dimensions",
  "zh": "记录尺寸",
  "ru": "Указанные размеры"
 },
 "未记录；加载后的实际尺寸见图片视口": {
  "en": "Not recorded; loaded dimensions appear in the image viewer",
  "zh": "未记录；加载后的实际尺寸见图片视口",
  "ru": "Не указано; размеры загруженного изображения показаны в просмотрщике"
 },
 "署名不等于权利人，也不代表开放许可。": {
  "en": "Credit does not establish rights or an open licence.",
  "zh": "署名不等于权利人，也不代表开放许可。",
  "ru": "Указание авторства не подтверждает права или открытую лицензию."
 },
 "计数说明": {
  "en": "About these counts",
  "zh": "计数说明",
  "ru": "Об этих числах"
 },
 "目录说明": {
  "en": "About the catalogue",
  "zh": "目录说明",
  "ru": "О каталоге"
 },
 "资料说明": {
  "en": "About this material",
  "zh": "资料说明",
  "ru": "Об этих материалах"
 }

,
 "分类照片数": {"en":"category photos","zh":"分类照片数","ru":"фотографий категории"},
 "来源编号": {"en":"source IDs","zh":"来源编号","ru":"номеров источника"}
,
"项目与资料":{"en": "About the collection", "zh": "项目与资料", "ru": "О коллекции"},
"研究资料库":{"en": "Research collection", "zh": "研究资料库", "ru": "Исследовательская коллекция"},
"项目简介":{"en": "Explore Central Asian square-hole coinage through images, recorded sources and historical geography. Browse families in Atlas, follow catalogue groups, or return to the original source pages.", "zh": "通过图片、来源和历史地理浏览中亚方孔钱。可在地图查看家族、沿目录组浏览，或访问原始来源页面。", "ru": "Изучайте монеты Центральной Азии с квадратным отверстием по изображениям, источникам и исторической географии. Просматривайте семейства на карте, группы каталога и исходные страницы."},
"当前资料":{"en": "Current collection", "zh": "当前资料", "ru": "Коллекция сегодня"},
"来源与方法":{"en": "Sources and methods", "zh": "资料与方法", "ru": "Источники и методы"},
"资料分类说明":{"en": "Families organize related coin records. Catalogue groups retain source or catalogue divisions. One coin may have several source records; related material remains separate from the main collection.", "zh": "家族组织相关钱币记录，目录组保留来源或目录分组。同一钱币可能有多条来源记录；相关资料与主库分别浏览。", "ru": "Семейства объединяют связанные записи о монетах. Группы сохраняют деления источников и каталогов. У одной монеты может быть несколько записей источников; сопутствующие материалы просматриваются отдельно."},
"图片方法说明":{"en": "Each image has its own source link and recorded credit. Open image details to see these and the original image. Rights information, where recorded, is available in the image’s sources and methods section; a credit identifies the recorded attribution, not a licence.", "zh": "每张图片都有自己的来源链接和已记录署名，可在图片详情查看并打开原图。已记录的权利信息集中在该图的资料与方法中；署名用于说明归属记录，不表示许可。", "ru": "У каждого изображения есть собственная ссылка на источник и указанное авторство. Они доступны в подробностях вместе с оригиналом. Сведения о правах собраны в разделе источников и методов изображения; указание авторства не является лицензией."},
"年代方法说明":{"en": "Date filters use the recorded family interval. Unknown dates mean that a complete usable interval is missing. Original date descriptions remain available; family dates are not individual datings of every coin.", "zh": "年代筛选使用已记录的家族区间。“年代未知”表示缺少完整可计算区间，原始年代说明仍保留；家族年代不是每枚钱币的独立断代。", "ru": "Фильтр дат использует записанный интервал семейства. «Дата неизвестна» означает отсутствие полного пригодного интервала. Исходные описания сохранены; даты семейства не являются отдельной датировкой каждой монеты."},
"地点方法说明":{"en": "Map anchors locate a family for browsing. Recorded roles distinguish political centres, mints or mint candidates, findspots, hoards and other places. The role and its source are shown with the place.", "zh": "地图锚点用于定位家族。地点角色区分政治中心、铸币地及候选地、出土点、窖藏等，具体角色和来源随地点展示。", "ru": "Опорные точки помогают находить семейства на карте. Роли различают политические центры, монетные дворы и кандидатов, места находок, клады и другие места. Роль и источник указаны для каждого места."},
"范围方法说明":{"en": "Political ranges and regional backgrounds are separate layers. Select a version to view its period, spatial meaning and sources. Reconstructed outlines summarize the cited evidence; local versions retain their coverage limits. Date changes use the range’s own evidence, with an option to view it as historical background.", "zh": "政权范围和地域背景是独立图层。选择版本可查看时期、空间含义和来源。概括重建依据所列资料；局部版本保留覆盖边缘说明。年份切换使用范围自身年代，也可主动作为历史背景查看。", "ru": "Политические территории и региональный фон — разные слои. Выберите версию, чтобы увидеть период, пространственный смысл и источники. Реконструированные контуры обобщают приведённые свидетельства; локальные версии сохраняют ограничения охвата. Фильтр года использует собственные даты территории; её также можно открыть как исторический фон."},
"资料覆盖说明":{"en": "Coverage snapshots describe source material recorded on a particular date. They are separate from today’s filtered record counts. Missing dates, places and unresolved relationships remain available for further study.", "zh": "覆盖快照描述特定日期保存的来源资料，与当前筛选数量分别统计。缺失年代、地点和未定关系继续保留，供后续研究。", "ru": "Снимки охвата описывают материалы источника на определённую дату и учитываются отдельно от текущих результатов фильтра. Неизвестные даты, места и неустановленные связи сохранены для дальнейшего изучения."},
"主要参考资料":{"en": "References and source pages", "zh": "参考资料与来源入口", "ru": "Литература и страницы источников"},
"后续建设":{"en": "Further work", "zh": "后续建设", "ru": "Дальнейшая работа"},
"后续建设说明":{"en": "The collection will expand its regional backgrounds, source coverage and links between inscriptions, tamghas and coins. Learning resources and auction histories are planned alongside continued documentation of uncertain records.", "zh": "后续继续完善地域背景、来源覆盖及铭文、徽记与钱币的关联，并建设学习资料和拍卖履历，持续整理未定记录。", "ru": "Планируется расширять региональный фон, охват источников и связи надписей и тамг с монетами, а также добавлять учебные материалы и историю аукционов, продолжая изучение неустановленных записей."},
"主要来源分布":{"en": "Main records by primary source", "zh": "主库记录的主要来源分布", "ru": "Основные записи по первичному источнику"},
"主要来源计数说明":{"en": "These counts group records by their primary recorded source.", "zh": "以下按记录的主要来源分组。", "ru": "Записи сгруппированы по указанному первичному источнику."},
"来源快照":{"en": "Source snapshots", "zh": "来源快照", "ru": "Снимки источников"},
"观察数量":{"en": "Observed count", "zh": "观察数量", "ru": "Зафиксировано"},
"快照覆盖":{"en": "Lady Nana: {imported} / {total} Zeno records; {images} associated images.", "zh": "Lady Nana：{imported} / {total} 条 Zeno 记录；{images} 张关联图片。", "ru": "Lady Nana: {imported} / {total} записей Zeno; связанных изображений: {images}."},
"来源系统":{"en": "Source systems", "zh": "来源系统", "ru": "Системы источников"},
"相关资料记录":{"en": "Related records", "zh": "相关资料记录", "ru": "Сопутствующие записи"},
"目录组说明":{"en": "Catalogue group notes", "zh": "目录组说明", "ru": "Примечания к группе каталога"},
"Coin role":{"en": "Coin role", "zh": "钱币角色", "ru": "Роль монеты"},
"Find context":{"en": "Find context", "zh": "发现背景", "ru": "Контекст находки"},
"Source path":{"en": "Source classification", "zh": "来源分类路径", "ru": "Классификация источника"},
"Source records":{"en": "Source records", "zh": "来源记录", "ru": "Записи источников"},
"Inscription / tamgha / features":{"en": "Inscription / tamgha / features", "zh": "铭文／徽记／特征", "ru": "Надпись / тамга / признаки"},
"材质":{"en": "Material", "zh": "材质", "ru": "Материал"},
"材质未记录":{"en": "Material not recorded", "zh": "材质未记录", "ru": "Материал не указан"},
"范围出处待补":{"en": "A range source has not yet been added.", "zh": "范围资料出处待补。", "ru": "Источник территории ещё не добавлен."},
"范围时期未记录":{"en": "Period not recorded", "zh": "时期未记录", "ru": "Период не указан"},
"跨时期定义":{"en": "Cross-period regional definition", "zh": "跨时期地域定义", "ru": "Региональное определение вне отдельного периода"},
"时间下界":{"en": "Known lower bound; upper bound not recorded", "zh": "下界已知，上界未记录", "ru": "Нижняя граница известна; верхняя не указана"},
"时间上界":{"en": "Known upper bound; lower bound not recorded", "zh": "上界已知，下界未记录", "ru": "Верхняя граница известна; нижняя не указана"},
"时间区间":{"en": "Known interval", "zh": "起止已知", "ru": "Известный интервал"},
"时间未定":{"en": "Date interval unresolved", "zh": "年代区间未定", "ru": "Интервал дат не установлен"},
"时间异常":{"en": "Invalid date interval", "zh": "年代区间异常", "ru": "Некорректный интервал дат"},
"部分覆盖":{"en": "Local coverage", "zh": "局部范围", "ru": "Локальный охват"},
"完整资料版本":{"en": "Full coverage of this source version", "zh": "该资料版本完整范围", "ru": "Полный охват этой версии источника"},
"覆盖未知":{"en": "Coverage not recorded", "zh": "覆盖未记录", "ru": "Охват не указан"},
"角色未定":{"en": "Role unresolved", "zh": "角色未定", "ru": "Роль не установлена"}
,
"清除":{"en": "Clear", "zh": "清除", "ru": "Очистить"},
"年代":{"en": "Date", "zh": "年代", "ru": "Дата"},
"地点":{"en": "Place", "zh": "地点", "ru": "Место"},
"历史范围":{"en": "Historical ranges", "zh": "历史范围", "ru": "Исторические территории"},
"收录范围":{"en": "Scope", "zh": "收录范围", "ru": "Охват"},
"未核实":{"en": "Unverified", "zh": "未核实", "ru": "Не проверено"},
"记录分类":{"en": "Record categories", "zh": "记录分类", "ru": "Категории записей"},
"本部范围":{"en": "Core territory", "zh": "本部范围", "ru": "Основная территория"},
"附属范围":{"en": "Dependent territory", "zh": "附属范围", "ru": "Зависимая территория"},
"影响范围":{"en": "Sphere of influence", "zh": "影响范围", "ru": "Сфера влияния"},
"地方体系范围":{"en": "Local political system", "zh": "地方体系范围", "ru": "Местная политическая система"},
"空间含义未记录":{"en": "Spatial meaning not recorded", "zh": "空间含义未记录", "ru": "Пространственный смысл не указан"}
,
"Attributed city · 归属城市展示锚点":{"en": "Attributed city · display anchor", "zh": "归属城市展示锚点", "ru": "Предполагаемый город · опорная точка"},
"City display anchor · 城市展示锚点":{"en": "City display anchor", "zh": "城市展示锚点", "ru": "Городская опорная точка"},
"Regional orientation · 区域浏览锚点":{"en": "Regional display anchor", "zh": "区域浏览锚点", "ru": "Региональная опорная точка"},
"Regional/city orientation · 区域／城市浏览锚点":{"en": "Regional / city display anchor", "zh": "区域／城市浏览锚点", "ru": "Региональная / городская опорная точка"},
"返回目录":{"en": "Back to catalogue", "zh": "返回目录", "ru": "Вернуться в каталог"},
"关闭提示":{"en": "Dismiss", "zh": "关闭提示", "ru": "Закрыть сообщение"},
"已选对比":{"en": "Selected for comparison", "zh": "已选对比", "ru": "Выбрано для сравнения"},
"已恢复链接筛选并清除目录搜索。":{"en": "Link filters restored; catalogue search cleared.", "zh": "已恢复链接筛选并清除目录搜索。", "ru": "Фильтры ссылки восстановлены; поиск каталога очищен."},
"家族不存在":{"en": "Family not found", "zh": "家族不存在", "ru": "Семейство не найдено"},
"主库记录不存在":{"en": "Record not found", "zh": "主库记录不存在", "ru": "Запись не найдена"},
"相关资料记录不存在":{"en": "Related record not found", "zh": "相关资料记录不存在", "ru": "Сопутствующая запись не найдена"},
"目录节点不存在":{"en": "Catalogue node not found", "zh": "目录节点不存在", "ru": "Узел каталога не найден"},
"来源节点或路径不存在":{"en": "Source node or path not found", "zh": "来源节点或路径不存在", "ru": "Узел или путь источника не найден"},
"来源路径格式无效":{"en": "Invalid source path", "zh": "来源路径格式无效", "ru": "Некорректный путь источника"},
"链接无效":{"en": "Invalid link", "zh": "链接无效", "ru": "Некорректная ссылка"}
,
"地点角色":{"en":"Place role","zh":"地点角色","ru":"Роль места"}
,
"open_license":{"en": "Open licence", "zh": "开放许可", "ru": "Открытая лицензия"},
"permission":{"en": "Permission recorded", "zh": "已有许可记录", "ru": "Разрешение указано"},
"public_domain":{"en": "Public domain", "zh": "公有领域", "ru": "Общественное достояние"},
"家族年代":{"en": "Family date", "zh": "家族年代", "ru": "Даты семейства"}
} as const satisfies Record<string,Record<Locale,string>>;
export type CopyKey=keyof typeof dictionary;
let current:Locale='en';
export function setCopyLocale(locale:Locale){current=locale}
export function tr(key:CopyKey,locale:Locale=current):string{return dictionary[key][locale]}
export function countLabel(n:number,kind:'records'|'families'|'images'|'sources'|'associations'|'groups',locale:Locale=current){
 const ru={sources:{one:'запись источника',few:'записи источников',many:'записей источников',other:'записи источников'},associations:{one:'связь',few:'связи',many:'связей',other:'связи'},groups:{one:'группа',few:'группы',many:'групп',other:'группы'},records:{one:'запись',few:'записи',many:'записей',other:'записи'},families:{one:'семейство',few:'семейства',many:'семейств',other:'семейства'},images:{one:'изображение',few:'изображения',many:'изображений',other:'изображения'}};
 if(locale==='ru'){const plural=new Intl.PluralRules('ru').select(n) as keyof typeof ru.records;return `${n} ${ru[kind][plural]||ru[kind].other}`}
 const names={en:{sources:n===1?'source record':'source records',associations:n===1?'association':'associations',groups:n===1?'group':'groups',records:n===1?'record':'records',families:n===1?'family':'families',images:n===1?'image':'images'},zh:{sources:'条来源记录',associations:'条关联',groups:'个组',records:'条记录',families:'个家族',images:'张图片'}};return `${n} ${names[locale][kind]}`
}
export function displayName(names:{name:string;zh?:string;ru?:string},locale:Locale=current){return locale==='zh'?(names.zh&&names.zh!=='原始标签（中文未记录）'?names.zh:names.name):locale==='ru'?(names.ru||names.name):names.name}
export function menuIndex(index:number,key:string){return key==='Home'?0:key==='End'?2:key==='ArrowDown'?(index+1)%3:key==='ArrowUp'?(index+2)%3:index}

export function copyKnown(text:string,locale:Locale=current){return Object.hasOwn(dictionary,text)?tr(text as CopyKey,locale):text}

/** Interpolate complete sentences without changing IDs or original content. */
export function formatCopy(key:CopyKey,values:Record<string,string|number>,locale:Locale=current){return tr(key,locale).replace(/\{(\w+)\}/g,(token,name)=>values[name]===undefined?token:String(values[name]))}
export function geographyName(node:{id:string;name:string;zh?:string;ru?:string}|undefined,locale:Locale,id=''){return node?(node.id.includes(':state:')?copyKnown(node.name,locale):displayName(node,locale)):id}

export function copyMessage(text:string,locale:Locale=current){const split=text.indexOf("：");return split<0?copyKnown(text,locale):`${copyKnown(text.slice(0,split),locale)}: ${text.slice(split+1)}`}
