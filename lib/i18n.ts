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
  "zh": "Filters",
  "ru": "Фильтры"
 },
 "Clear filters": {
  "en": "Clear filters",
  "zh": "Clear filters",
  "ru": "Сбросить фильтры"
 },
 "Close details": {
  "en": "Close details",
  "zh": "Close details",
  "ru": "Закрыть сведения"
 },
 "Basemap": {
  "en": "Basemap",
  "zh": "Basemap",
  "ru": "Подложка"
 },
 "Issue date filter": {
  "en": "Year",
  "zh": "Issue date filter",
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
  "zh": "Atlas",
  "ru": "Атлас"
 },
 "Catalogue": {
  "en": "Catalogue",
  "zh": "Catalogue",
  "ru": "Каталог"
 },
 "Research": {
  "en": "Research",
  "zh": "Research",
  "ru": "Исследования"
 },
 "CENTRAL ASIAN SQUARE-HOLE COINAGE ATLAS": {
  "en": "CENTRAL ASIAN COINAGE ATLAS",
  "zh": "CENTRAL ASIAN SQUARE-HOLE COINAGE ATLAS",
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
  "zh": "Interactive terrain map of Central Asia; drag to pan, scroll or pinch to zoom",
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
  "zh": "confirmed",
  "ru": "Подтверждено"
 },
 "probable": {
  "en": "Probable",
  "zh": "probable",
  "ru": "Вероятно"
 },
 "candidate": {
  "en": "Candidate",
  "zh": "candidate",
  "ru": "Кандидат"
 },
 "contextual": {
  "en": "Contextual",
  "zh": "contextual",
  "ru": "Контекст"
 },
 "unresolved": {
  "en": "Unresolved",
  "zh": "unresolved",
  "ru": "Не определено"
 },
 "not yet reviewed": {
  "en": "Not yet reviewed",
  "zh": "not yet reviewed",
  "ru": "Ещё не изучено"
 },
 "researching": {
  "en": "Under study",
  "zh": "researching",
  "ru": "Исследуется"
 },
 "source_label": {
  "en": "Source label",
  "zh": "source_label",
  "ru": "Метка источника"
 },
 "unassigned": {
  "en": "Unassigned",
  "zh": "unassigned",
  "ru": "Не определено"
 }
} as const satisfies Record<string,Record<Locale,string>>;
export type CopyKey=keyof typeof dictionary;
let current:Locale='en';
export function setCopyLocale(locale:Locale){current=locale}
export function tr(key:CopyKey,locale:Locale=current):string{return dictionary[key][locale]}
export function countLabel(n:number,kind:'records'|'families'|'images',locale:Locale=current){const names={en:{records:n===1?'record':'records',families:n===1?'family':'families',images:n===1?'image':'images'},zh:{records:'条记录',families:'个家族',images:'张图片'},ru:{records:'записей',families:'семейств',images:'изображений'}};return `${n} ${names[locale][kind]}`}
export function displayName(names:{name:string;zh?:string;ru?:string},locale:Locale=current){return locale==='zh'?(names.zh||names.name):locale==='ru'?(names.ru||names.name):names.name}
export function menuIndex(index:number,key:string){return key==='Home'?0:key==='End'?2:key==='ArrowDown'?(index+1)%3:key==='ArrowUp'?(index+2)%3:index}

export function copyKnown(text:string,locale:Locale=current){return text in dictionary?tr(text as CopyKey,locale):text}
