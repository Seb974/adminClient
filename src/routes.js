import React from 'react';

const Products = React.lazy(() => import('./views/components/products/products'));
const Product = React.lazy(() => import('./views/components/products/product'));
const Agents = React.lazy(() => import('./views/components/agents/agents'));
const Agent = React.lazy(() => import('./views/components/agents/agent'));
const Categories = React.lazy(() => import('./views/components/categories/categories'));
const Category = React.lazy(() => import('./views/components/categories/category'));
const Departments = React.lazy(() => import('./views/components/departments/departments'));
const Department = React.lazy(() => import('./views/components/departments/department'));
const ParentDepartment = React.lazy(() => import('./views/components/departments/parentDepartment'));
const Groups = React.lazy(() => import('./views/components/groups/groups'));
const Group = React.lazy(() => import('./views/components/groups/group'));
const Containers = React.lazy(() => import('./views/components/containers/containers'));
const Container = React.lazy(() => import('./views/components/containers/container'));
const Catalogs = React.lazy(() => import('./views/components/catalogs/catalogs'));
const Catalog = React.lazy(() => import('./views/components/catalogs/catalog'));
const Promotions = React.lazy(() => import('./views/components/promotions/promotions'));
const Promotion = React.lazy(() => import('./views/components/promotions/promotion'));
const Sellers = React.lazy(() => import('./views/components/sellers/sellers'));
const Seller = React.lazy(() => import('./views/components/sellers/seller'));
const Profitability = React.lazy(() => import('./views/components/prices/profitability'));
const Prices = React.lazy(() => import('./views/components/prices/prices'));
const Costs = React.lazy(() => import('./views/components/costs/costs'));
const SellerAccount = React.lazy(() => import('./views/components/sellers/sellerAccount'));
const DelivererAccount = React.lazy(() => import('./views/components/deliverers/delivererAccount'));
const Deliverers = React.lazy(() => import('./views/components/deliverers/deliverers'));
const Deliverer = React.lazy(() => import('./views/components/deliverers/deliverer'));
const PriceGroups = React.lazy(() => import('./views/components/price_groups/priceGroups'));
const PriceGroup = React.lazy(() => import('./views/components/price_groups/priceGroup'));
const DaysOff = React.lazy(() => import('./views/components/days_off/daysOff'));
const DayOff = React.lazy(() => import('./views/components/days_off/dayOff'));
const Cities = React.lazy(() => import('./views/components/cities/cities'));
const City = React.lazy(() => import('./views/components/cities/city'));
const Zones = React.lazy(() => import('./views/components/zones/zones'));
const Zone = React.lazy(() => import('./views/components/zones/zone'));
const Homepages = React.lazy(() => import('./views/components/homepages/homepages'));
const Homepage = React.lazy(() => import('./views/components/homepages/homepage'));
const Heroes = React.lazy(() => import('./views/components/heroes/heroes'));
const Hero = React.lazy(() => import('./views/components/heroes/hero'));
const Banners = React.lazy(() => import('./views/components/banners/banners'));
const Banner = React.lazy(() => import('./views/components/banners/banner'));
const Relaypoints = React.lazy(() => import('./views/components/relaypoints/relaypoints'));
const Relaypoint = React.lazy(() => import('./views/components/relaypoints/relaypoint'));
const SalesPerStore = React.lazy(() => import('./views/components/stores/SalesPerStore'))
const Stores = React.lazy(() => import('./views/components/stores/stores'));
const Store = React.lazy(() => import('./views/components/stores/store'));
const Preparations = React.lazy(() => import('./views/components/preparations/preparations'));
const Recoveries = React.lazy(() => import('./views/components/recoveries/recoveries'));
const Deliveries = React.lazy(() => import('./views/components/deliveries/deliveries'));
const Tourings = React.lazy(() => import('./views/components/tourings/tourings'));
const Collects = React.lazy(() => import('./views/components/collects/collects'));
const Accounting = React.lazy(() => import('./views/components/accounting/accounting'));
const Bills = React.lazy(() => import('./views/components/accounting/bills'));
const MapVisualization = React.lazy(() => import('./views/components/tourings/mapVisualization'));
const Order = React.lazy(() => import('./views/components/orders/order'));
const Orders = React.lazy(() => import('./views/components/orders/orders'));
const Provisions = React.lazy(() => import('./views/components/provisions/provisions'));
const Provision = React.lazy(() => import('./views/components/provisions/provision'));
const Supplying = React.lazy(() => import('./views/components/supplies/supplying'));
const InProgress = React.lazy(() => import('./views/components/supplies/inProgress'));
const Users = React.lazy(() => import('./views/components/users/users'));
const User = React.lazy(() => import('./views/components/users/user'));
const Taxes = React.lazy(() => import('./views/components/taxes/taxes'));
const Tax = React.lazy(() => import('./views/components/taxes/tax'));
const Stocks = React.lazy(() => import('./views/components/stocks/stocks'));
const Supervisors = React.lazy(() => import('./views/components/supervisors/supervisors'));
const Supervisor = React.lazy(() => import('./views/components/supervisors/supervisor'));
const Suppliers = React.lazy(() => import('./views/components/suppliers/suppliers'));
const Supplier = React.lazy(() => import('./views/components/suppliers/supplier'));
const Articles = React.lazy(() => import('./views/components/articles/articles'));
const Article = React.lazy(() => import('./views/components/articles/article'));
const Platform = React.lazy(() => import('./views/components/platform/platform'));
const AboutUs = React.lazy(() => import('./views/components/aboutUs/aboutUs'));
const CodeEditors = React.lazy(() => import('./views/editors/code-editors/CodeEditors'));
const TextEditors = React.lazy(() => import('./views/editors/text-editors/TextEditors'));

const Invoice = React.lazy(() => import('./views/apps/invoicing/Invoice'));

const AdvancedForms = React.lazy(() => import('./views/forms/advanced-forms/AdvancedForms'));
const BasicForms = React.lazy(() => import('./views/forms/basic-forms/BasicForms'));
const ValidationForms = React.lazy(() => import('./views/forms/validation-forms/ValidationForms'));
const GoogleMaps = React.lazy(() => import('./views/google-maps/GoogleMaps'));
const Toaster = React.lazy(() => import('./views/notifications/toaster/Toaster'));
const Calendar = React.lazy(() => import('./views/plugins/calendar/Calendar'));
const Draggable = React.lazy(() => import('./views/plugins/draggable/Draggable'));
const Spinners = React.lazy(() => import('./views/plugins/spinners/Spinners'));
const AdvancedTables = React.lazy(() => import('./views/tables/advanced-tables/AdvancedTables'));
const Tables = React.lazy(() => import('./views/tables/tables/Tables'));
//const LoadingButtons = React.lazy(() => import('./views/buttons/loading-buttons'));

const Breadcrumbs = React.lazy(() => import('./views/base/breadcrumbs/Breadcrumbs'));
const Cards = React.lazy(() => import('./views/base/cards/Cards'));
const Carousels = React.lazy(() => import('./views/base/carousels/Carousels'));
const Collapses = React.lazy(() => import('./views/base/collapses/Collapses'));

const Jumbotrons = React.lazy(() => import('./views/base/jumbotrons/Jumbotrons'));
const ListGroups = React.lazy(() => import('./views/base/list-groups/ListGroups'));
const Navbars = React.lazy(() => import('./views/base/navbars/Navbars'));
const Navs = React.lazy(() => import('./views/base/navs/Navs'));
const Paginations = React.lazy(() => import('./views/base/paginations/Pagnations'));
const Popovers = React.lazy(() => import('./views/base/popovers/Popovers'));
const ProgressBar = React.lazy(() => import('./views/base/progress-bar/ProgressBar'));
const Switches = React.lazy(() => import('./views/base/switches/Switches'));

const Tabs = React.lazy(() => import('./views/base/tabs/Tabs'));
const Tooltips = React.lazy(() => import('./views/base/tooltips/Tooltips'));
const BrandButtons = React.lazy(() => import('./views/buttons/brand-buttons/BrandButtons'));
const ButtonDropdowns = React.lazy(() => import('./views/buttons/button-dropdowns/ButtonDropdowns'));
const ButtonGroups = React.lazy(() => import('./views/buttons/button-groups/ButtonGroups'));
const Buttons = React.lazy(() => import('./views/buttons/buttons/Buttons'));
const Charts = React.lazy(() => import('./views/charts/Charts'));
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'));
const CoreUIIcons = React.lazy(() => import('./views/icons/coreui-icons/CoreUIIcons'));
const Flags = React.lazy(() => import('./views/icons/flags/Flags'));
const Brands = React.lazy(() => import('./views/icons/brands/Brands'));
const Alerts = React.lazy(() => import('./views/notifications/alerts/Alerts'));
const Badges = React.lazy(() => import('./views/notifications/badges/Badges'));
const Modals = React.lazy(() => import('./views/notifications/modals/Modals'));
const Colors = React.lazy(() => import('./views/theme/colors/Colors'));
const Typography = React.lazy(() => import('./views/theme/typography/Typography'));
const Widgets = React.lazy(() => import('./views/widgets/Widgets'));
const UsersEx = React.lazy(() => import('./views/users/Users'));
const UserEx = React.lazy(() => import('./views/users/User'));

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/components/products/:id', name: 'Product', component: Product },
  { path: '/components/products', name: 'Products', component: Products },
  { path: '/components/agents/:id', name: 'Agent', component: Agent },
  { path: '/components/agents', name: 'Agents', component: Agents },
  { path: '/components/categories/:id', name: 'Category', component: Category },
  { path: '/components/categories', name: 'Categories', component: Categories },
  { path: '/components/departments/parent/:id', name: 'Department', component: ParentDepartment },
  { path: '/components/departments/:id', name: 'Department', component: Department },
  { path: '/components/departments', name: 'Departments', component: Departments },
  { path: '/components/groups/:id', name: 'Group', component: Group },
  { path: '/components/groups', name: 'Groups', component: Groups },
  { path: '/components/containers/:id', name: 'Container', component: Container },
  { path: '/components/containers', name: 'Containers', component: Containers },
  { path: '/components/catalogs/:id', name: 'Catalog', component: Catalog },
  { path: '/components/catalogs', name: 'Catalogs', component: Catalogs },
  { path: '/components/promotions/:id', name: 'Promotion', component: Promotion },
  { path: '/components/promotions', name: 'Promotions', component: Promotions },
  { path: '/components/sellers/:id', name: 'Seller', component: Seller },
  { path: '/components/sellers', name: 'Sellers', component: Sellers },
  { path: '/components/profitability', name: 'Profitability', component: Profitability },
  { path: '/components/prices', name: 'Prices', component: Prices },
  { path: '/components/costs', name: 'Costs', component: Costs },
  { path: '/components/account/sellers', name: 'Sellers', component: SellerAccount },
  { path: '/components/account/deliverers', name: 'Sellers', component: DelivererAccount },
  { path: '/components/deliverers/:id', name: 'Deliverer', component: Deliverer },
  { path: '/components/deliverers', name: 'Deliverers', component: Deliverers },
  { path: '/components/price_groups/:id', name: 'PriceGroup', component: PriceGroup },
  { path: '/components/price_groups', name: 'PriceGroups', component: PriceGroups },
  { path: '/components/days_off/:id', name: 'DayOff', component: DayOff },
  { path: '/components/days_off', name: 'DaysOff', component: DaysOff },
  { path: '/components/cities/:id', name: 'City', component: City },
  { path: '/components/cities', name: 'Cities', component: Cities },
  { path: '/components/zones/:id', name: 'Zone', component: Zone },
  { path: '/components/zones', name: 'Zones', component: Zones },
  { path: '/components/homepages/:id', name: 'Homepage', component: Homepage },
  { path: '/components/homepages', name: 'Homepages', component: Homepages },
  { path: '/components/heroes/:id', name: 'Hero', component: Hero },
  { path: '/components/heroes', name: 'Heroes', component: Heroes },
  { path: '/components/banners/:id', name: 'Banner', component: Banner },
  { path: '/components/banners', name: 'Banners', component: Banners },
  { path: '/components/relaypoints/:id', name: 'Relaypoint', component: Relaypoint },
  { path: '/components/relaypoints', name: 'Relaypoints', component: Relaypoints },
  { path: '/components/stores/sales', name: 'SalesPerStore', component: SalesPerStore },
  { path: '/components/stores/:id', name: 'Store', component: Store },
  { path: '/components/stores', name: 'Stores', component: Stores },
  { path: '/components/orders/:id', name: 'Order', component: Order },
  { path: '/components/orders', name: 'Orders', component: Orders },
  { path: '/components/provisions/:id', name: 'Provision', component: Provision },
  { path: '/components/provisions', name: 'Provisions', component: Provisions },
  { path: '/components/supplies/shop', name: 'Supplying', component: Supplying },
  { path: '/components/supplies/in-progress', name: 'InProgress', component: InProgress },
  { path: '/components/preparations', name: 'Preparations', component: Preparations },
  { path: '/components/deliveries', name: 'Deliveries', component: Deliveries },
  { path: '/components/recoveries', name: 'Recoveries', component: Recoveries },
  { path: '/components/tourings/visualization', name: 'MapVisualization', component: MapVisualization },
  { path: '/components/tourings', name: 'Tourings', component: Tourings },
  { path: '/components/collects', name: 'Collects', component: Collects },
  { path: '/components/accounting', name: 'Accounting', component: Accounting },
  { path: '/components/bills', name: 'Bills', component: Bills },
  { path: '/components/users/:id', exact: true, name: 'User Details', component: User },
  { path: '/components/users', name: 'Users', component: Users },
  { path: '/components/taxes/:id', name: 'Tax', component: Tax },
  { path: '/components/taxes', name: 'Taxes', component: Taxes },
  { path: '/components/stocks', name: 'Stocks', component: Stocks },
  { path: '/components/supervisors/:id', name: 'Supervisor', component: Supervisor },
  { path: '/components/supervisors', name: 'Supervisors', component: Supervisors },
  { path: '/components/suppliers/:id', name: 'Supplier', component: Supplier },
  { path: '/components/suppliers', name: 'Suppliers', component: Suppliers },
  { path: '/components/articles/:id', name: 'Article', component: Article },
  { path: '/components/articles', name: 'Articles', component: Articles },
  { path: '/components/about-us', name: 'AboutUs', component: AboutUs },
  { path: '/components/platform', name: 'Platform', component: Platform },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/theme', name: 'Theme', component: Colors, exact: true },
  { path: '/theme/colors', name: 'Colors', component: Colors },
  { path: '/theme/typography', name: 'Typography', component: Typography },
  { path: '/base', name: 'Base', component: Cards, exact: true },
  { path: '/base/breadcrumbs', name: 'Breadcrumbs', component: Breadcrumbs },
  { path: '/base/cards', name: 'Cards', component: Cards },
  { path: '/base/carousels', name: 'Carousel', component: Carousels },
  { path: '/base/collapses', name: 'Collapse', component: Collapses },
  { path: '/base/jumbotrons', name: 'Jumbotrons', component: Jumbotrons },
  { path: '/base/list-groups', name: 'List Groups', component: ListGroups },
  { path: '/base/navbars', name: 'Navbars', component: Navbars },
  { path: '/base/navs', name: 'Navs', component: Navs },
  { path: '/base/paginations', name: 'Paginations', component: Paginations },
  { path: '/base/popovers', name: 'Popovers', component: Popovers },
  { path: '/base/progress-bar', name: 'Progress Bar', component: ProgressBar },
  { path: '/base/switches', name: 'Switches', component: Switches },
  { path: '/base/tabs', name: 'Tabs', component: Tabs },
  { path: '/base/tooltips', name: 'Tooltips', component: Tooltips },
  { path: '/buttons', name: 'Buttons', component: Buttons, exact: true },
  { path: '/buttons/buttons', name: 'Buttons', component: Buttons },
  { path: '/buttons/button-dropdowns', name: 'Dropdowns', component: ButtonDropdowns },
  { path: '/buttons/button-groups', name: 'Button Groups', component: ButtonGroups },
  { path: '/buttons/brand-buttons', name: 'Brand Buttons', component: BrandButtons },
  { path: '/charts', name: 'Charts', component: Charts },
  { path: '/editors', name: 'Editors', component: CodeEditors, exact: true },
  { path: '/editors/code-editors', name: 'Code Editors', component: CodeEditors },
  { path: '/editors/text-editors', name: 'Text Editors', component: TextEditors },
  { path: '/forms', name: 'Forms', component: BasicForms, exact: true },
  { path: '/forms/advanced-forms', name: 'Advanced Forms', component: AdvancedForms },
  { path: '/forms/basic-forms', name: 'Basic Forms', component: BasicForms },
  { path: '/forms/validation-forms', name: 'Form Validation', component: ValidationForms },
  { path: '/google-maps', name: 'Google Maps', component: GoogleMaps },
  { path: '/icons', exact: true, name: 'Icons', component: CoreUIIcons },
  { path: '/icons/coreui-icons', name: 'CoreUI Icons', component: CoreUIIcons },
  { path: '/icons/flags', name: 'Flags', component: Flags },
  { path: '/icons/brands', name: 'Brands', component: Brands },
  { path: '/notifications', name: 'Notifications', component: Alerts, exact: true },
  { path: '/notifications/alerts', name: 'Alerts', component: Alerts },
  { path: '/notifications/badges', name: 'Badges', component: Badges },
  { path: '/notifications/modals', name: 'Modals', component: Modals },
  { path: '/notifications/toaster', name: 'Toaster', component: Toaster },
  { path: '/plugins', name: 'Plugins', component: Calendar, exact: true },
  { path: '/plugins/calendar', name: 'Calendar', component: Calendar },
  { path: '/plugins/draggable', name: 'Draggable Cards', component: Draggable },
  { path: '/plugins/spinners', name: 'Spinners', component: Spinners },
  { path: '/tables', name: 'Tables', component: Tables, exact: true },
  { path: '/tables/advanced-tables', name: 'Advanced Tables', component: AdvancedTables },
  { path: '/tables/tables', name: 'Tables', component: Tables },
  { path: '/widgets', name: 'Widgets', component: Widgets },
  { path: '/apps', name: 'Apps', component: Invoice, exact: true },
  { path: '/apps/invoicing', name: 'Invoice', component: Invoice, exact: true },
  { path: '/apps/invoicing/invoice', name: 'Invoice', component: Invoice },
  { path: '/users', exact: true,  name: 'Users', component: UsersEx },
  { path: '/users/:id', exact: true, name: 'User Details', component: UserEx },
  { path: '/apps/email/inbox', exact: true, name: 'Inbox' },
  { path: '/apps/email/compose', exact: true, name: 'Compose' },
  { path: '/apps/email/messages/:id', name: 'Message' },    // exact: true
]

export default routes;
