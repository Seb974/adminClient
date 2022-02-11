import React, { useContext, useEffect, useState } from 'react'
import { CWidgetDropdown, CRow, CCol, CDropdown, CDropdownMenu, CDropdownItem, CDropdownToggle } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import ChartLineSimple from '../charts/ChartLineSimple'
import ChartBarSimple from '../charts/ChartBarSimple'
import { getDateFrom, getInt, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils'
import { isSameDate } from 'src/helpers/days'
import Roles from 'src/config/Roles'
import AuthContext from 'src/contexts/AuthContext'

const WidgetsDropdown = ({ sales, storeSales, interval }) => {

  const now = new Date();
  const [orders, setOrders] = useState([]);
  const [period, setPeriod] = useState([]);
  const { currentUser, supervisor } = useContext(AuthContext);
  const dates = { start: getDateFrom(now, -interval, 0), end: now };

  useEffect(() => getPeriod(), []);

  useEffect(() => {
    let viewedSales = [];
    if (Roles.isStoreManager(currentUser))
        viewedSales = isDefined(storeSales) ? storeSales : [];
    else if (Roles.isSeller(currentUser) || Roles.hasAdminPrivileges(currentUser))
        viewedSales = isDefined(storeSales) && isDefined(sales) ? [...sales, ...storeSales] : [];
    else
        viewedSales = isDefined(sales) ? sales : [];

    setOrders(viewedSales);
}, [sales, storeSales]);

  const getTotalOrder = order => order.items.reduce((sum, i) => sum += i.price * (isDefined(i.deliveredQty) ? i.deliveredQty : i.orderedQty), 0);
  
  const getVolumeOrder = order => order.items.reduce((sum, i) => sum += i.product.weight * (isDefined(i.deliveredQty) ? i.deliveredQty : i.orderedQty), 0);
  
  const getTurnovers = () => period.map(d => orders.reduce((sum, s) => sum += isSameDate(d, new Date(s.deliveryDate)) ? getTotalOrder(s) : 0, 0));

  const getOrdersNumber = () => {
    return period.map(d => {
      const dailySales = orders.filter(s => isSameDate(d, new Date(s.deliveryDate)));
      const storeSales = dailySales.filter(s => isDefined(s.numberOfSales)).reduce((sum, curr) => sum += curr.numberOfSales, 0);
      const onlineSales = dailySales.filter(s => !isDefined(s.numberOfSales)).length;
      return getInt(storeSales) + getInt(onlineSales);
    });
  };

  const getClientsNumber = () => {
    return period.map(d => {
      const dailySales = orders.filter(s => isSameDate(d, new Date(s.deliveryDate)));
      const storeClients = dailySales.filter(s => isDefined(s.numberOfSales)).reduce((sum, curr) => sum += curr.numberOfSales, 0);
      const onlineClients = dailySales.filter(s => !isDefined(s.numberOfSales)).reduce((unique, s) => !unique.includes(s.email) ? [...unique, s.email] : unique, []).length;
      return getInt(storeClients) + getInt(onlineClients);
    });
  };
  
  const getAverageOrders = () => period.map(d => orders.reduce((sum, s) => sum += isSameDate(d, new Date(s.deliveryDate)) && getDayTotalOrder(d) > 0 ? (getTotalOrder(s) / getDayTotalOrder(d)) : 0, 0));
  
  const getDayTotalOrder = day => orders.reduce((sum, s) => sum += isSameDate(day, new Date(s.deliveryDate)) ? 1 : 0, 0);

  const getVolumes = () => period.map(d => orders.reduce((sum, s) => sum += isSameDate(d, new Date(s.deliveryDate)) ? getVolumeOrder(s) : 0, 0));


  const getLastElement = (elements, precision) => {
      return (isDefinedAndNotVoid(elements) && Array.isArray(elements) ? elements.slice(-1)[0] : 0).toFixed(precision);
  }

  const getPeriod = () => {
    let datesArray = [];
    for (let i = 1; i <= interval; i++) {
        const hour = i === interval ? 23 : 0;
        const nextDate = getDateFrom(dates.start, i, hour);
        if (nextDate.getDay() !== 0)
            datesArray = [...datesArray, nextDate];
    }
    setPeriod(datesArray);
};

  return (
    <CRow>
      <CCol sm="6" lg="3">
        <CWidgetDropdown
          color="gradient-primary"
          header={ getLastElement(getOrdersNumber(), 0) }
          text="Commandes"
          footerSlot={
              <ChartBarSimple
                  className="mt-3 mx-3"
                  style={{height: '70px'}}
                  backgroundColor="secondary"
                  dataPoints={ getOrdersNumber() }
                  label="Members"
                  labels="months"
              />
          }
        >
          <CDropdown>
            <CDropdownToggle caret={ false } className="text-white" color="transparent">
              <CIcon name="cil-clipboard"/>
            </CDropdownToggle>
          </CDropdown>
        </CWidgetDropdown>
      </CCol>

      <CCol sm="6" lg="3">
        <CWidgetDropdown
          color="gradient-info"
          header={ getLastElement(getClientsNumber(), 0) }
          text="Clients"
          footerSlot={
              <ChartLineSimple
                  pointed
                  className="mt-3 mx-3"
                  style={{height: '70px'}}
                  dataPoints={ getClientsNumber() }
                  pointHoverBackgroundColor="info"
                  options={{ elements: { line: { tension: 0.00001 }}}}
                  label="Members"
                  labels="months"
              />
          }
        >
          <CDropdown>
            <CDropdownToggle caret={ false } color="transparent">
              <CIcon name="cil-people"/>
            </CDropdownToggle>
          </CDropdown>
        </CWidgetDropdown>
      </CCol>

      <CCol sm="6" lg="3">
        <CWidgetDropdown
          color="gradient-warning"
          header={ getLastElement(getAverageOrders(), 2) + " €" }
          text="Commande moyenne"
          footerSlot={
            <ChartLineSimple
              className="mt-3"
              style={{height: '70px'}}
              backgroundColor="rgba(255,255,255,.2)"
              dataPoints={ getAverageOrders() }
              options={{ elements: { line: { borderWidth: 2.5 }}}}
              pointHoverBackgroundColor="warning"
              label="Members"
              labels="months"
            />
          }
        >
          <CDropdown>
            <CDropdownToggle caret={ false } color="transparent">
              <CIcon name="cil-chart"/>
            </CDropdownToggle>
          </CDropdown>
        </CWidgetDropdown>
      </CCol>

      <CCol sm="6" lg="3">
        <CWidgetDropdown
          color="gradient-danger"
          header={ getLastElement(getTurnovers(), 2) + " €" }
          text="Chiffre d'affaires"
          footerSlot={
            <ChartLineSimple
              pointed
              className="c-chart-wrapper mt-3 mx-3"
              style={{height: '70px'}}
              dataPoints={ getTurnovers() }
              pointHoverBackgroundColor="rgb(250, 152, 152)"
              label="Members"
              labels="months"
            />
          }
        >
          <CDropdown>
            <CDropdownToggle caret={ false } color="transparent">
              <CIcon name="cil-money"/>
            </CDropdownToggle>
          </CDropdown>
        </CWidgetDropdown>
      </CCol>

    </CRow>
  )
}

export default WidgetsDropdown;