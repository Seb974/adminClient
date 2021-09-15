import React from 'react';
import CIcon from '@coreui/icons-react';
import Roles from 'src/config/Roles';

function getNav(translation, currentUser)
{
  const defineUserRole = () => {
    const mainRole = Roles.hasAdminPrivileges(currentUser) ? "ADMIN" : 
           (Roles.isSeller(currentUser) && Roles.isDeliverer(currentUser) || Roles.isPicker(currentUser)) ? "PICKER" : 
           Roles.isSeller(currentUser) ? "SELLER" :
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
      badge: {
        color: 'info',
        text: 'NEW',
      }
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
    // !["ADMIN"].includes(mainRole) ? voidValue : 
    //   {
    //     _tag: 'CSidebarNavItem',
    //     name: translation("colors.label"),
    //     to: '/theme/colors',
    //     icon: 'cil-drop',
    //   },
    // !["ADMIN"].includes(mainRole) ? voidValue : 
    //   {
    //     _tag: 'CSidebarNavItem',
    //     name: translation("typography.label"),
    //     to: '/theme/typography',
    //     icon: 'cil-pencil',
    //   },

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
    !["ADMIN", "PICKER", "SELLER"].includes(mainRole) ? voidValue : 
    {
      _tag: 'CSidebarNavTitle',
      _children: [translation("activity.label")],
    },
    !["ADMIN", "PICKER", "SELLER"].includes(mainRole) ? voidValue :  
      {
        _tag: 'CSidebarNavItem',
        name: translation("supply.label"),
        to: '/components/supplies/shop',
        icon: <CIcon name="cil-clipboard" customClasses="c-sidebar-nav-icon"/>,
      },
    !["ADMIN", "PICKER", "SELLER"].includes(mainRole) ? voidValue :  
      {
        _tag: 'CSidebarNavItem',
        name: translation("provisions.label"),
        to: '/components/provisions',
        icon: <CIcon name="cib-azure-artifacts" customClasses="c-sidebar-nav-icon"/>,
      },
    !["ADMIN", "PICKER", "SELLER"].includes(mainRole) ? voidValue :  
        {
          _tag: 'CSidebarNavItem',
          name: translation("stocks.label"),
          to: '/components/stocks',
          icon: <CIcon name="cil-storage" customClasses="c-sidebar-nav-icon"/>,
        },
    !["ADMIN"].includes(mainRole) ? voidValue :  
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
    !["ADMIN"].includes(mainRole) ? voidValue :
      {
        _tag: 'CSidebarNavTitle',
        _children: [translation("accounting.label")]
      },
      !["ADMIN"].includes(mainRole) ? voidValue :  
        {
          _tag: 'CSidebarNavItem',
          name: translation("billing.label"),
          to: '/components/accounting',
          icon: <CIcon name="cil-description" customClasses="c-sidebar-nav-icon"/>,
        },
      !["ADMIN", "SUPERVISOR"].includes(mainRole) ? voidValue :  
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
    !["ADMIN"].includes(mainRole) ? voidValue :  
        {
          _tag: 'CSidebarNavItem',
          name: translation("categories.label"),
          to: '/components/categories',
          icon: <CIcon name="cil-columns" customClasses="c-sidebar-nav-icon"/>,
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
        // icon: <CIcon name="cib-zingat" customClasses="c-sidebar-nav-icon"/>,
      },
    !["ADMIN", "SELLER"].includes(mainRole) ? voidValue :  
        {
          _tag: 'CSidebarNavItem',
          name: translation("sellers.label"),
          to: '/components/sellers',
          icon: <CIcon name="cib-itch-io" customClasses="c-sidebar-nav-icon"/>,
          // icon: <CIcon name="cib-emlakjet" customClasses="c-sidebar-nav-icon"/>,
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
    // !["ADMIN"].includes(mainRole) ? voidValue :  
    //     {
    //       _tag: 'CSidebarNavDropdown',
    //       name: translation("ui.components.label"),
    //       icon: 'cil-puzzle',
    //       _children: [
    //         {
    //           _tag: 'CSidebarNavDropdown',
    //           name: 'Base',
    //           route: '/base',
    //           icon: 'cil-institution',
    //           _children: [
    //             {
    //               _tag: 'CSidebarNavItem',
    //               name: 'Breadcrumb',
    //               to: '/base/breadcrumbs',
    //             },
    //             {
    //               _tag: 'CSidebarNavItem',
    //               name: 'Cards',
    //               to: '/base/cards',
    //             },
    //             {
    //               _tag: 'CSidebarNavItem',
    //               name: 'Carousel',
    //               to: '/base/carousels',
    //             },
    //             {
    //               _tag: 'CSidebarNavItem',
    //               name: 'Collapse',
    //               to: '/base/collapses',
    //             },
    //             {
    //               _tag: 'CSidebarNavItem',
    //               name: 'Jumbotron',
    //               to: '/base/jumbotrons',
    //             },
    //             {
    //               _tag: 'CSidebarNavItem',
    //               name: 'List group',
    //               to: '/base/list-groups',
    //             },
    //             {
    //               _tag: 'CSidebarNavItem',
    //               name: 'Navs',
    //               to: '/base/navs',
    //             },
    //             {
    //               _tag: 'CSidebarNavItem',
    //               name: 'Navbars',
    //               to: '/base/navbars',
    //             },
    //             {
    //               _tag: 'CSidebarNavItem',
    //               name: 'Pagination',
    //               to: '/base/paginations',
    //             },
    //             {
    //               _tag: 'CSidebarNavItem',
    //               name: 'Popovers',
    //               to: '/base/popovers',
    //             },
    //             {
    //               _tag: 'CSidebarNavItem',
    //               name: 'Progress',
    //               to: '/base/progress-bar',
    //             },
    //             {
    //               _tag: 'CSidebarNavItem',
    //               name: 'Switches',
    //               to: '/base/switches',
    //             },
    //             {
    //               _tag: 'CSidebarNavItem',
    //               name: 'Tabs',
    //               to: '/base/tabs',
    //             },
    //             {
    //               _tag: 'CSidebarNavItem',
    //               name: 'Tooltips',
    //               to: '/base/tooltips',
    //             },
    //           ],
    //         },
    //         {
    //           _tag: 'CSidebarNavDropdown',
    //           name: 'Buttons',
    //           route: '/buttons',
    //           icon: 'cil-cursor',
    //           _children: [
    //             {
    //               _tag: 'CSidebarNavItem',
    //               name: 'Buttons',
    //               to: '/buttons/buttons',
    //             },
    //             {
    //               _tag: 'CSidebarNavItem',
    //               name: 'Brand buttons',
    //               to: '/buttons/brand-buttons',
    //             },
    //             {
    //               _tag: 'CSidebarNavItem',
    //               name: 'Buttons groups',
    //               to: '/buttons/button-groups',
    //             },
    //             {
    //               _tag: 'CSidebarNavItem',
    //               name: 'Dropdowns',
    //               to: '/buttons/button-dropdowns',
    //             }
    //           ],
    //         },
    //         {
    //           _tag: 'CSidebarNavItem',
    //           name: 'Charts',
    //           to: '/charts',
    //           icon: 'cil-chart-pie'
    //         },
    //         {
    //           _tag: 'CSidebarNavDropdown',
    //           name: 'Editors',
    //           route: '/editors',
    //           icon: 'cil-code',
    //           _children: [
    //             {
    //               _tag: 'CSidebarNavItem',
    //               name: 'Code Editors',
    //               to: '/editors/code-editors',
    //               badge: {
    //                 color: 'danger',
    //                 text: 'PRO',
    //               },
    //             },
    //             {
    //               _tag: 'CSidebarNavItem',
    //               name: 'Rich Text Editor',
    //               to: '/editors/text-editors',
    //               badge: {
    //                 color: 'danger',
    //                 text: 'PRO',
    //               },
    //             }
    //           ]
    //         },
    //         {
    //           _tag: 'CSidebarNavDropdown',
    //           name: 'Forms',
    //           route: '/forms',
    //           icon: 'cil-notes',
    //           _children: [
    //             {
    //               _tag: 'CSidebarNavItem',
    //               name: 'Basic Forms',
    //               to: '/forms/basic-forms',
    //             },
    //             {
    //               _tag: 'CSidebarNavItem',
    //               name: 'Advanced Forms',
    //               to: '/forms/advanced-forms',
    //               badge: {
    //                 color: 'danger',
    //                 text: 'PRO'
    //               }
    //             },
    //             {
    //               _tag: 'CSidebarNavItem',
    //               name: 'Validation',
    //               to: '/forms/validation-forms',
    //               badge: {
    //                 color: 'danger',
    //                 text: 'PRO'
    //               }
    //             }
    //           ]
    //         },
    //         {
    //           _tag: 'CSidebarNavItem',
    //           name: 'Google Maps',
    //           to: '/google-maps',
    //           icon: 'cil-map',
    //           badge: {
    //             color: 'danger',
    //             text: 'PRO'
    //           }
    //         },
    //         {
    //           _tag: 'CSidebarNavDropdown',
    //           name: 'Icons',
    //           route: '/icons',
    //           icon: 'cil-star',
    //           _children: [
    //             {
    //               _tag: 'CSidebarNavItem',
    //               name: 'CoreUI Free',
    //               to: '/icons/coreui-icons',
    //               badge: {
    //                 color: 'success',
    //                 text: 'NEW',
    //               },
    //             },
    //             {
    //               _tag: 'CSidebarNavItem',
    //               name: 'CoreUI Flags',
    //               to: '/icons/flags',
    //             },
    //             {
    //               _tag: 'CSidebarNavItem',
    //               name: 'CoreUI Brands',
    //               to: '/icons/brands',
    //             },
    //           ],
    //         },
    //         {
    //           _tag: 'CSidebarNavDropdown',
    //           name: 'Notifications',
    //           route: '/notifications',
    //           icon: 'cil-bell',
    //           _children: [
    //             {
    //               _tag: 'CSidebarNavItem',
    //               name: 'Alerts',
    //               to: '/notifications/alerts',
    //             },
    //             {
    //               _tag: 'CSidebarNavItem',
    //               name: 'Badges',
    //               to: '/notifications/badges',
    //             },
    //             {
    //               _tag: 'CSidebarNavItem',
    //               name: 'Modal',
    //               to: '/notifications/modals',
    //             },
    //             {
    //               _tag: 'CSidebarNavItem',
    //               name: 'Toaster',
    //               to: '/notifications/toaster'
    //             }
    //           ]
    //         },
    //         {
    //           _tag: 'CSidebarNavDropdown',
    //           name: 'Plugins',
    //           route: '/plugins',
    //           icon: 'cil-input-power',
    //           _children: [
    //             {
    //               _tag: 'CSidebarNavItem',
    //               name: 'Calendar',
    //               to: '/plugins/calendar',
    //               badge: {
    //                 color: 'danger',
    //                 text: 'PRO'
    //               }
    //             },
    //             {
    //               _tag: 'CSidebarNavItem',
    //               name: 'Draggable',
    //               to: '/plugins/draggable',
    //               badge: {
    //                 color: 'danger',
    //                 text: 'PRO'
    //               }
    //             },
    //             {
    //               _tag: 'CSidebarNavItem',
    //               name: 'Spinners',
    //               to: '/plugins/spinners',
    //               badge: {
    //                 color: 'danger',
    //                 text: 'PRO'
    //               }
    //             }
    //           ]
    //         },
    //         {
    //           _tag: 'CSidebarNavDropdown',
    //           name: 'Tables',
    //           route: '/tables',
    //           icon: 'cil-list',
    //           _children: [
    //             {
    //               _tag: 'CSidebarNavItem',
    //               name: 'Basic Tables',
    //               to: '/tables/tables',
    //             },
    //             {
    //               _tag: 'CSidebarNavItem',
    //               name: 'Advanced Tables',
    //               to: '/tables/advanced-tables'
    //             }
    //           ]
    //         },
    //         {
    //           _tag: 'CSidebarNavItem',
    //           name: 'Widgets',
    //           to: '/widgets',
    //           icon: 'cil-calculator',
    //           badge: {
    //             color: 'info',
    //             text: 'NEW',
    //           },
    //         },
    //         {
    //           _tag: 'CSidebarNavDivider'
    //         },
    //       ]
    //     },
    // !["ADMIN"].includes(mainRole) ? voidValue : 
    //     {
    //       _tag: 'CSidebarNavTitle',
    //       _children: ['Extras'],
    //     },
    // !["ADMIN"].includes(mainRole) ? voidValue : 
    //     {
    //       _tag: 'CSidebarNavDropdown',
    //       name: 'Pages',
    //       route: '/pages',
    //       icon: 'cil-star',
    //       _children: [
    //         {
    //           _tag: 'CSidebarNavItem',
    //           name: 'Login',
    //           to: '/login',
    //         },
    //         {
    //           _tag: 'CSidebarNavItem',
    //           name: 'Register',
    //           to: '/register',
    //         },
    //         {
    //           _tag: 'CSidebarNavItem',
    //           name: 'Error 404',
    //           to: '/404',
    //         },
    //         {
    //           _tag: 'CSidebarNavItem',
    //           name: 'Error 500',
    //           to: '/500',
    //         },
    //       ],
    //     },
    // !["ADMIN"].includes(mainRole) ? voidValue : 
    //     {
    //       _tag: 'CSidebarNavItem',
    //       name: 'Disabled',
    //       icon: 'cil-ban',
    //       badge: {
    //         color: 'secondary',
    //         text: 'NEW',
    //       },
    //       addLinkClass: 'c-disabled',
    //       'disabled': true
    //     },


    // !["ADMIN"].includes(mainRole) ? voidValue : 
    //     {
    //       _tag: 'CSidebarNavDropdown',
    //       name: 'Apps',
    //       route: '/apps',
    //       icon: 'cil-layers',
    //       _children: [
    //         {
    //           _tag: 'CSidebarNavDropdown',
    //           name: 'Invoicing',
    //           route: '/apps/invoicing',
    //           icon: 'cil-spreadsheet',
    //           _children: [
    //             {
    //               _tag: 'CSidebarNavItem',
    //               name: 'Invoice',
    //               to: '/apps/invoicing/invoice',
    //               badge: {
    //                 color: 'danger',
    //                 text: 'PRO'
    //               }
    //             }
    //           ]
    //         },
    //         {
    //           _tag: 'CSidebarNavDropdown',
    //           name: 'Email',
    //           route: '/apps/email',
    //           icon: 'cil-envelope-open',
    //           _children: [
    //             {
    //               _tag: 'CSidebarNavItem',
    //               name: 'Inbox',
    //               to: '/apps/email/inbox',
    //               badge: {
    //                 color: 'danger',
    //                 text: 'PRO',
    //               },
    //             },
    //             {
    //               _tag: 'CSidebarNavItem',
    //               name: 'Message',
    //               to: '/apps/email/message',
    //               badge: {
    //                 color: 'danger',
    //                 text: 'PRO',
    //               },
    //             },
    //             {
    //               _tag: 'CSidebarNavItem',
    //               name: 'Compose',
    //               to: '/apps/email/compose',
    //               badge: {
    //                 color: 'danger',
    //                 text: 'PRO',
    //               },
    //             },
    //           ],
    //         },
    //       ]
    //     },


    !["ADMIN"].includes(mainRole) ? voidValue : 
        {
          _tag: 'CSidebarNavDivider',
          className: 'm-2'
        },
    // !["ADMIN"].includes(mainRole) ? voidValue : 
    //     {
    //       _tag: 'CSidebarNavTitle',
    //       _children: ['Labels']
    //     },
    // !["ADMIN"].includes(mainRole) ? voidValue : 
    //     {
    //       _tag: 'CSidebarNavItem',
    //       name: 'Label danger',
    //       to: '',
    //       icon: {
    //         name: 'cil-star',
    //         className: 'text-danger'
    //       },
    //       label: true
    //     },
    // !["ADMIN"].includes(mainRole) ? voidValue : 
    //     {
    //       _tag: 'CSidebarNavItem',
    //       name: 'Label info',
    //       to: '',
    //       icon: {
    //         name: 'cil-star',
    //         className: 'text-info'
    //       },
    //       label: true
    //     },
    // !["ADMIN"].includes(mainRole) ? voidValue : 
    //     {
    //       _tag: 'CSidebarNavItem',
    //       name: 'Label warning',
    //       to: '',
    //       icon: {
    //         name: 'cil-star',
    //         className: 'text-warning'
    //       },
    //       label: true
    //     },
    // !["ADMIN"].includes(mainRole) ? voidValue : 
    //     {
    //       _tag: 'CSidebarNavDivider',
    //       className: 'm-2'
    //     }
  ].filter(item => item !== voidValue);
}

export default {
   getNav
}
