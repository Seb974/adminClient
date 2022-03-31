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
const Traceabilities = React.lazy(() => import('./views/components/traceabilities/traceabilities'));
const Losts = React.lazy(() => import('./views/components/losts/losts'));
const Lost = React.lazy(() => import('./views/components/losts/lost'));
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
const Returnables = React.lazy(() => import('./views/components/returnables/returnables'));
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
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'));

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
  { path: '/components/traceabilities', name: 'Traceabilities', component: Traceabilities },
  { path: '/components/losts/:id', name: 'Lost', component: Lost },
  { path: '/components/losts', name: 'Losts', component: Losts },
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
  { path: '/components/returnables', name: 'Returnables', component: Returnables },
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
  { path: '/apps/email/inbox', exact: true, name: 'Inbox' },
  { path: '/apps/email/compose', exact: true, name: 'Compose' },
  { path: '/apps/email/messages/:id', name: 'Message' }
]

export default routes;
