import React from 'react';
import CIcon from '@coreui/icons-react';
import Roles from 'src/config/Roles';
import { isDefined } from 'src/helpers/utils';

function getNav(translation, currentUser, platform)
{
  const defineUserRole = () => {
    const mainRole = Roles.hasAdminPrivileges(currentUser) ? "ADMIN" : 
           (Roles.isSeller(currentUser) && Roles.isDeliverer(currentUser) || Roles.isPicker(currentUser)) ? "PICKER" : 
           Roles.isSeller(currentUser) ? "SELLER" :
           Roles.isStoreManager(currentUser) ? "STORE_MANAGER" :
           Roles.isDeliverer(currentUser) ? "DELIVERER" : 
           Roles.isSupervisor(currentUser) ? "SUPERVISOR" : 
           Roles.isRelaypoint(currentUser.roles) ? "RELAYPOINT" : "USER";
    return mainRole;
  };

  const mainRole = defineUserRole(currentUser);
  const voidValue = {_tag: 'CSidebarNavTitle', _children: []};

  return mainRole === "USER" ? [] : [
    {
      _tag: 'CSidebarNavItem',
      name: 'Dashboard',
      to: '/dashboard',
      icon: <CIcon name="cil-speedometer" customClasses="c-sidebar-nav-icon"/>,
    },
    !["ADMIN"].includes(mainRole) ? voidValue : 
      {
        _tag: 'CSidebarNavTitle',
        _children: ['Theme']
      },
    !["ADMIN"].includes(mainRole) ? voidValue : 
      {
        _tag: 'CSidebarNavItem',
        name: translation("homepages.label"),
        to: '/components/homepages',
        icon: 'cil-view-quilt',
      },
    !["ADMIN"].includes(mainRole) ? voidValue : 
      {
        _tag: 'CSidebarNavItem',
        name: translation("heroes.label"),
        to: '/components/heroes',
        icon: 'cil-wallpaper',
      },
    !["ADMIN"].includes(mainRole) ? voidValue : 
      {
        _tag: 'CSidebarNavItem',
        name: translation("banners.label"),
        to: '/components/banners',
        icon: 'cil-star',
      },
    !["ADMIN"].includes(mainRole) ? voidValue : 
      {
        _tag: 'CSidebarNavItem',
        name: translation("aboutUs.label"),
        to: '/components/about-us',
        icon: <CIcon name="cil-book" customClasses="c-sidebar-nav-icon"/>,
      },
      !["ADMIN"].includes(mainRole) ? voidValue : 
      {
        _tag: 'CSidebarNavTitle',
        _children: ['Blog']
      },
    !["ADMIN"].includes(mainRole) ? voidValue : 
      {
        _tag: 'CSidebarNavItem',
        name: translation("articles.label"),
        to: '/components/articles',
        icon: <CIcon name="cil-newspaper" customClasses="c-sidebar-nav-icon"/>,
      },


    !["ADMIN", "PICKER", "SELLER", "DELIVERER", "RELAYPOINT"].includes(mainRole) ? voidValue : 
    {
      _tag: 'CSidebarNavTitle',
      _children: [translation("orders.label")]
    },
    !["ADMIN", "PICKER", "SELLER"].includes(mainRole) ? voidValue : 
        {
          _tag: 'CSidebarNavItem',
          name: translation("preparations.label"),
          to: '/components/preparations',
          icon: <CIcon name="cil-dinner" customClasses="c-sidebar-nav-icon"/>,
        },
    !["SUPERVISOR"].includes(mainRole) ? voidValue : 
      {
        _tag: 'CSidebarNavItem',
        name: translation("ordering.label"),
        to: '/components/orders/new',
        icon: <CIcon name="cil-dinner" customClasses="c-sidebar-nav-icon"/>,
      },
    !["ADMIN", "PICKER"].includes(mainRole) ? voidValue :  
        {
          _tag: 'CSidebarNavItem',
          name: translation("recoveries.label"),
          to: '/components/recoveries',
          icon: <CIcon name="cil-tags" customClasses="c-sidebar-nav-icon"/>,
        },
    !["ADMIN", "PICKER", "DELIVERER"].includes(mainRole) ? voidValue :  
        {
          _tag: 'CSidebarNavItem',
          name: translation("deliveries.label"),
          to: '/components/deliveries',
          icon: <CIcon name="cil-location-pin" customClasses="c-sidebar-nav-icon"/>,
        },
    !["ADMIN", "PICKER", "DELIVERER"].includes(mainRole) ? voidValue :  
        {
          _tag: 'CSidebarNavItem',
          name: translation("tourings.label"),
          to: '/components/tourings',
          icon: <CIcon name="cil-map" customClasses="c-sidebar-nav-icon"/>,
        },
    !(["ADMIN", "RELAYPOINT"].includes(mainRole) || currentUser.isRelaypoint) ? voidValue :  
        {
          _tag: 'CSidebarNavItem',
          name: translation("checkouts.label"),
          to: '/components/collects',
          icon: <CIcon name="cil-task" customClasses="c-sidebar-nav-icon"/>,
        },
    !["ADMIN", "PICKER", "SELLER", "STORE_MANAGER"].includes(mainRole) ? voidValue : 
    {
      _tag: 'CSidebarNavTitle',
      _children: [translation("activity.label")],
    },
    !["ADMIN", "PICKER", "SELLER", "STORE_MANAGER"].includes(mainRole) ? voidValue :  
      {
        _tag: 'CSidebarNavItem',
        name: translation("supply.label"),
        to: '/components/supplies/shop',
        icon: <CIcon name="cil-clipboard" customClasses="c-sidebar-nav-icon"/>,
      },
    !["ADMIN", "PICKER", "SELLER", "STORE_MANAGER"].includes(mainRole) ? voidValue :  
      {
        _tag: 'CSidebarNavItem',
        name: translation("in-progress.label"),
        to: '/components/supplies/in-progress',
        icon: <CIcon name="cil-find-in-page" customClasses="c-sidebar-nav-icon"/>,
      },
    !["ADMIN", "PICKER", "SELLER", "STORE_MANAGER"].includes(mainRole) ? voidValue :  
      {
        _tag: 'CSidebarNavItem',
        name: translation("provisions.label"),
        to: '/components/provisions',
        icon: <CIcon name="cib-azure-artifacts" customClasses="c-sidebar-nav-icon"/>,
      },
    !["ADMIN", "PICKER", "SELLER", "STORE_MANAGER"].includes(mainRole) ? voidValue :  
        {
          _tag: 'CSidebarNavItem',
          name: translation("stocks.label"),
          to: '/components/stocks',
          icon: <CIcon name="cil-storage" customClasses="c-sidebar-nav-icon"/>,
        },
    !["ADMIN", "PICKER", "SELLER", "STORE_MANAGER"].includes(mainRole) ? voidValue :  
      {
        _tag: 'CSidebarNavItem',
        name: translation("losts.label"),
        to: '/components/losts',
        icon: <CIcon name="cil-trash" customClasses="c-sidebar-nav-icon"/>,
      },
    !["ADMIN", "PICKER", "SELLER", "STORE_MANAGER"].includes(mainRole) ? voidValue :  
      {
        _tag: 'CSidebarNavItem',
        name: translation("traceability.label"),
        to: '/components/traceabilities',
        icon: <CIcon name="cil-zoom" customClasses="c-sidebar-nav-icon"/>,
      },
    !["ADMIN", "SELLER"].includes(mainRole) ? voidValue :
      {
        _tag: 'CSidebarNavItem',
        name: translation("costs.label"),
        to: '/components/costs',
        icon: <CIcon name="cil-chart" customClasses="c-sidebar-nav-icon"/>,
      },
    !["ADMIN", "SELLER", "STORE_MANAGER"].includes(mainRole) ? voidValue :  
      {
        _tag: 'CSidebarNavItem',
        name: translation("profitability.label"),
        to: '/components/profitability',
        icon: <CIcon name="cil-chart-line" customClasses="c-sidebar-nav-icon"/>,
      },
    !["ADMIN", "SUPERVISOR"].includes(mainRole) ? voidValue :
      {
        _tag: 'CSidebarNavItem',
        name: translation("prices.label"),
        to: '/components/prices',
        icon: <CIcon name="cil-money" customClasses="c-sidebar-nav-icon"/>,
      },
    !["ADMIN", "SUPERVISOR"].includes(mainRole) ? voidValue :  
      {
        _tag: 'CSidebarNavItem',
        name: translation("summary.label"),
        to: '/components/orders',
        icon: <CIcon name="cil-history" customClasses="c-sidebar-nav-icon"/>,
      },
    !["ADMIN", "SELLER", "STORE_MANAGER"].includes(mainRole) ? voidValue :  
      {
        _tag: 'CSidebarNavItem',
        name: translation("physical_sales.label"),
        to: '/components/stores/sales',
        icon: <CIcon name="cil-calculator" customClasses="c-sidebar-nav-icon"/>,
      },
    !["ADMIN"].includes(mainRole) ? voidValue :
      {
        _tag: 'CSidebarNavTitle',
        _children: [translation("partners.label")]
      },
    !["ADMIN"].includes(mainRole) ? voidValue :  
      {
        _tag: 'CSidebarNavItem',
        name: translation("sales.label"),
        to: '/components/account/sellers',
        icon: <CIcon name="cib-itch-io" customClasses="c-sidebar-nav-icon"/>,
      },
    !["ADMIN"].includes(mainRole) ? voidValue :  
      {
        _tag: 'CSidebarNavItem',
        name: translation("deliveries.label"),
        to: '/components/account/deliverers',
        icon: <CIcon name="cil-car-alt" customClasses="c-sidebar-nav-icon"/>,
      },
    !["ADMIN"].includes(mainRole) || !isDefined(platform) || !platform.hasAxonautLink ? voidValue :
      {
        _tag: 'CSidebarNavTitle',
        _children: [translation("accounting.label")]
      },
      !["ADMIN"].includes(mainRole) || !isDefined(platform) || !platform.hasAxonautLink ? voidValue :  
        {
          _tag: 'CSidebarNavItem',
          name: translation("billing.label"),
          to: '/components/accounting',
          icon: <CIcon name="cil-description" customClasses="c-sidebar-nav-icon"/>,
        },
      !["ADMIN", "SUPERVISOR"].includes(mainRole) || !isDefined(platform) || !platform.hasAxonautLink ? voidValue :  
        {
          _tag: 'CSidebarNavItem',
          name: translation("bills.label"),
          to: '/components/bills',
          icon: <CIcon name="cil-featured-playlist" customClasses="c-sidebar-nav-icon"/>,
        },
    !["ADMIN", "PICKER", "DELIVERER", "SELLER", "RELAYPOINT"].includes(mainRole) ? voidValue :
      {
        _tag: 'CSidebarNavTitle',
        _children: [translation("component.label")]
      },
    !["ADMIN", "SELLER"].includes(mainRole) ? voidValue :  
      {
        _tag: 'CSidebarNavItem',
        name: translation("products.label"),
        to: '/components/products',
        icon: <CIcon name="cil-fastfood" customClasses="c-sidebar-nav-icon"/>,
      },
    !["ADMIN"].includes(mainRole) ? voidValue :  
        {
          _tag: 'CSidebarNavItem',
          name: translation("categories.label"),
          to: '/components/categories',
          icon: <CIcon name="cil-columns" customClasses="c-sidebar-nav-icon"/>,
        },
    !["ADMIN"].includes(mainRole) ? voidValue :  
        {
          _tag: 'CSidebarNavItem',
          name: translation("departments.label"),
          to: '/components/departments',
          icon: <CIcon name="cil-folder-open" customClasses="c-sidebar-nav-icon"/>,
        },
    !["ADMIN"].includes(mainRole) ? voidValue :  
        {
          _tag: 'CSidebarNavItem',
          name: translation("promotions.label"),
          to: '/components/promotions',
          icon: <CIcon name="cib-allocine" customClasses="c-sidebar-nav-icon"/>,
        },
    !(["ADMIN", "RELAYPOINT"].includes(mainRole) || currentUser.isRelaypoint) ? voidValue :  
      {
        _tag: 'CSidebarNavItem',
        name: translation("relaypoints.label"),
        to: '/components/relaypoints',
        icon: <CIcon name="cib-everplaces" customClasses="c-sidebar-nav-icon"/>,
      },
    !["ADMIN", "SELLER"].includes(mainRole) ? voidValue :  
        {
          _tag: 'CSidebarNavItem',
          name: translation("sellers.label"),
          to: '/components/sellers',
          icon: <CIcon name="cib-itch-io" customClasses="c-sidebar-nav-icon"/>,
        },
    !["ADMIN","SELLER"].includes(mainRole) ? voidValue :
        {
          _tag: 'CSidebarNavItem',
          name: translation("stores.label"),
          to: '/components/stores',
          icon: <CIcon name="cil-home" customClasses="c-sidebar-nav-icon"/>,
        },
    !["ADMIN", "DELIVERER"].includes(mainRole) ? voidValue :  
        {
          _tag: 'CSidebarNavItem',
          name: translation("deliverers.label"),
          to: '/components/deliverers',
          icon: <CIcon name="cil-car-alt" customClasses="c-sidebar-nav-icon"/>,
        },
    !["ADMIN", "SELLER"].includes(mainRole) ? voidValue :  
        {
          _tag: 'CSidebarNavItem',
          name: translation("suppliers.label"),
          to: '/components/suppliers',
          icon: <CIcon name="cil-industry" customClasses="c-sidebar-nav-icon"/>,
        },
    !["ADMIN"].includes(mainRole) ? voidValue : 
        {
          _tag: 'CSidebarNavItem',
          name: translation("supervisors.label"),
          to: '/components/supervisors',
          icon: <CIcon name="cil-shield-alt" customClasses="c-sidebar-nav-icon"/>,
        },
    !["ADMIN"].includes(mainRole) ? voidValue : 
        {
          _tag: 'CSidebarNavItem',
          name: translation("agents.label"),
          to: '/components/agents',
          icon: <CIcon name="cil-badge" customClasses="c-sidebar-nav-icon"/>,
        },
    !["ADMIN", "SUPERVISOR"].includes(mainRole) ? voidValue :
        {
          _tag: 'CSidebarNavItem',
          name: translation("users.label"),
          to: '/components/users',
          icon: <CIcon name="cil-people" customClasses="c-sidebar-nav-icon"/>,
        },
    !["ADMIN"].includes(mainRole) ? voidValue :
        {
          _tag: 'CSidebarNavDropdown',
          name: translation("parameters.label"),
          icon: 'cil-equalizer',
          _children: [
            {
              _tag: 'CSidebarNavItem',
              name: translation("groups.label"),
              to: '/components/groups',
              icon: <CIcon name="cil-people" customClasses="c-sidebar-nav-icon"/>,
            },
            {
              _tag: 'CSidebarNavItem',
              name: translation("price.groups.label"),
              to: '/components/price_groups',
              icon: <CIcon name="cil-euro" customClasses="c-sidebar-nav-icon"/>,
            },
            {
              _tag: 'CSidebarNavItem',
              name: translation("taxes.label"),
              to: '/components/taxes',
              icon: <CIcon name="cil-institution" customClasses="c-sidebar-nav-icon"/>,
            },
            {
              _tag: 'CSidebarNavItem',
              name: translation("containers.label"),
              to: '/components/containers',
              icon: <CIcon name="cil-basket" customClasses="c-sidebar-nav-icon"/>,
            },
            {
              _tag: 'CSidebarNavItem',
              name: translation("days.off.label"),
              to: '/components/days_off',
              icon: <CIcon name="cil-calendar" customClasses="c-sidebar-nav-icon"/>,
            },
            {
              _tag: 'CSidebarNavItem',
              name: translation("zones.label"),
              to: '/components/zones',
              icon: <CIcon name="cil-compass" customClasses="c-sidebar-nav-icon"/>,
            },
            {
              _tag: 'CSidebarNavItem',
              name: translation("cities.label"),
              to: '/components/cities',
              icon: <CIcon name="cil-location-pin" customClasses="c-sidebar-nav-icon"/>,
            },
            {
              _tag: 'CSidebarNavItem',
              name: translation("catalogs.label"),
              to: '/components/catalogs',
              icon: <CIcon name="cil-globe-alt" customClasses="c-sidebar-nav-icon"/>,
            },
            {
              _tag: 'CSidebarNavItem',
              name: translation("platform.label"),
              to: '/components/platform',
              icon: <CIcon name="cil-building" customClasses="c-sidebar-nav-icon"/>,
            }
          ]
        },
    !["ADMIN"].includes(mainRole) ? voidValue : 
        {
          _tag: 'CSidebarNavDivider',
          className: 'm-2'
        },
  ].filter(item => item !== voidValue);
}

export default {
   getNav
}
