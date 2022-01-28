import React, { useEffect, useState } from 'react'
import { CWidgetDropdown, CRow, CCol, CDropdown, CDropdownMenu, CDropdownItem, CDropdownToggle } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import ChartLineSimple from '../charts/ChartLineSimple'
import ChartBarSimple from '../charts/ChartBarSimple'
import { getDateFrom, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils'
import { isSameDate } from 'src/helpers/days'

const WidgetsDropdown = ({ sales, interval }) => {

  const now = new Date();
  const [period, setPeriod] = useState([]);
  const dates = { start: getDateFrom(now, -interval, 0), end: now };

  useEffect(() => getPeriod(), []);

  useEffect(() => console.log(sales), [sales]);

  const getTotalOrder = order => order.items.reduce((sum, i) => sum += i.price * (isDefined(i.deliveredQty) ? i.deliveredQty : i.orderedQty), 0);
  
  const getTurnovers = () => period.map(d => sales.reduce((sum, s) => sum += isSameDate(d, new Date(s.deliveryDate)) ? getTotalOrder(s) : 0, 0));

  const getOrdersNumber = () => period.map(d => sales.reduce((sum, s) => sum += isSameDate(d, new Date(s.deliveryDate)) ? 1 : 0, 0));

  const getTodayTurnover = () => {
    const turnovers = getTurnovers();
    return (isDefinedAndNotVoid(turnovers) ? turnovers.slice(-1)[0] : 0).toFixed(2);
  };

  const getTodayOrdersNumber = () => {
    const orderNumbers = getOrdersNumber();
    return (isDefinedAndNotVoid(orderNumbers) ? orderNumbers.slice(-1)[0] : 0).toFixed(2);
  };

  const getLastElement = (elements, precision) => {
      return (isDefinedAndNotVoid(elements) ? elements.slice(-1)[0] : 0).toFixed(precision);
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
              // backgroundColor="rgb(250, 152, 152)"
              backgroundColor="secondary"
              // backgroundColor="rgb(150, 130, 250)"
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
            {/* <CDropdownMenu className="pt-0" placement="bottom-end">
              <CDropdownItem>Action</CDropdownItem>
              <CDropdownItem>Another action</CDropdownItem>
              <CDropdownItem>Something else here...</CDropdownItem>
              <CDropdownItem disabled>Disabled action</CDropdownItem>
            </CDropdownMenu> */}
          </CDropdown>
        </CWidgetDropdown>
      </CCol>

      <CCol sm="6" lg="3">
        <CWidgetDropdown
          color="gradient-info"
          header="9.823"
          text="Members online"
          footerSlot={
            <ChartLineSimple
              pointed
              className="mt-3 mx-3"
              style={{height: '70px'}}
              dataPoints={[1, 18, 9, 17, 34, 22, 11]}
              pointHoverBackgroundColor="info"
              options={{ elements: { line: { tension: 0.00001 }}}}
              label="Members"
              labels="months"
            />
          }
        >
          <CDropdown>
            <CDropdownToggle caret={false} color="transparent">
              <CIcon name="cil-location-pin"/>
            </CDropdownToggle>
            <CDropdownMenu className="pt-0" placement="bottom-end">
              <CDropdownItem>Action</CDropdownItem>
              <CDropdownItem>Another action</CDropdownItem>
              <CDropdownItem>Something else here...</CDropdownItem>
              <CDropdownItem disabled>Disabled action</CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
        </CWidgetDropdown>
      </CCol>

      <CCol sm="6" lg="3">
        <CWidgetDropdown
          color="gradient-warning"
          header="9.823"
          text="Members online"
          footerSlot={
            <ChartLineSimple
              className="mt-3"
              style={{height: '70px'}}
              backgroundColor="rgba(255,255,255,.2)"
              dataPoints={[78, 81, 80, 45, 34, 12, 40]}
              options={{ elements: { line: { borderWidth: 2.5 }}}}
              pointHoverBackgroundColor="warning"
              label="Members"
              labels="months"
            />
          }
        >
          <CDropdown>
            <CDropdownToggle color="transparent">
              <CIcon name="cil-settings"/>
            </CDropdownToggle>
            <CDropdownMenu className="pt-0" placement="bottom-end">
              <CDropdownItem>Action</CDropdownItem>
              <CDropdownItem>Another action</CDropdownItem>
              <CDropdownItem>Something else here...</CDropdownItem>
              <CDropdownItem disabled>Disabled action</CDropdownItem>
            </CDropdownMenu>
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
              // pointHoverBackgroundColor="primary"
              pointHoverBackgroundColor="rgb(250, 152, 152)"
              label="Members"
              labels="months"
            />
          }
        >
          <CDropdown>
            <CDropdownToggle caret={ false } color="transparent">
              <CIcon name="cil-clipboard"/>
            </CDropdownToggle>
            {/* <CDropdownMenu className="pt-0" placement="bottom-end">
              <CDropdownItem>Action</CDropdownItem>
              <CDropdownItem>Another action</CDropdownItem>
              <CDropdownItem>Something else here...</CDropdownItem>
              <CDropdownItem disabled>Disabled action</CDropdownItem>
            </CDropdownMenu> */}
          </CDropdown>
        </CWidgetDropdown>
      </CCol>

    </CRow>
  )
}

export default WidgetsDropdown
