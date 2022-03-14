import React, { useContext, useEffect, useState } from 'react';
import { CChartLine } from '@coreui/react-chartjs';
import ProvisionActions from 'src/services/ProvisionActions';
import SellerActions from 'src/services/SellerActions';
import ZoneActions from 'src/services/ZoneActions';
import AuthContext from 'src/contexts/AuthContext';
import { getDateFrom, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import { getDayName, isSameDate } from 'src/helpers/days';
import { CCard, CCardBody, CCardFooter, CCol, CProgress, CRow, CWidgetIcon } from '@coreui/react';
import { brandDanger, brandInfo, brandSuccess, getFormattedDatas, getOptions, getProgressColor } from 'src/helpers/stats';
import MercureContext from 'src/contexts/MercureContext';
import CIcon from '@coreui/icons-react';
import Roles from 'src/config/Roles';
import { updateBetween } from 'src/data/dataProvider/eventHandlers/provisionEvents';

const StatChart = ({ sales, storeSales, interval, ...attributes }) => {

  const target = 60;
  const now = new Date();
  const { currentUser, supervisor, seller } = useContext(AuthContext);
  const dates = { start: getDateFrom(now, -interval, 0), end: now };
  const { updatedProvisions, setUpdatedProvisions } = useContext(MercureContext);

  const [period, setPeriod] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [provisions, setProvisions] = useState([]);
  const [zones, setZones] = useState([]);
  const [viewedZones, setViewedZones] = useState([]);
  const [dataset, setDataset] = useState([]);
  const [mercureOpering, setMercureOpering] = useState(false);
  const [orders, setOrders] = useState([]);

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

  useEffect(() => {
      getPeriod();
      fetchZones();
      fetchSellers();
  }, []);

  useEffect(() => {
    if (isDefinedAndNotVoid(sellers) && !isDefinedAndNotVoid(provisions) && !isDefined(supervisor))
          fetchProvisions();
  }, [sellers]);

  useEffect(() => {
        const datas = !isDefined(supervisor) ? 
            getFormattedDatas([
                {label: 'Ventes', color: brandSuccess, backgroundColor: brandSuccess, borderWidth: 2, data: getFormattedSales()},
                {label: 'Achats', color: brandInfo, borderWidth: 2, data: getFormattedProvisions()},
                {label: 'Objectif de vente', color: brandDanger, borderWidth: 1, dash: [8, 5], data: getFormattedTarget()}
            ])
            :
            getFormattedDatas([
                {label: 'Achats', color: brandSuccess, backgroundColor: brandSuccess, borderWidth: 2, data: getFormattedSales()}
            ]);
        setDataset(datas);
    }, [period, orders, provisions]);

  useEffect(() => {
      if (isDefinedAndNotVoid(zones))
          setViewedZones(getSalesPerZone());
    }, [orders, zones]);

  useEffect(() => {
    if (isDefinedAndNotVoid(updatedProvisions) && !mercureOpering) {
        setMercureOpering(true);
        updateBetween(getUTCDates(), provisions, setProvisions, updatedProvisions, setUpdatedProvisions, currentUser, seller, sellers)
            .then(response => setMercureOpering(response));
    }
}, [updatedProvisions]);

  const fetchSellers = () => {
      SellerActions
        .findAll()
        .then(response => setSellers(response));
  };

  const fetchProvisions = () => {
      ProvisionActions
          .findBetween(getUTCDates(), sellers)
          .then(response => {
                let storesProvisions = response;
                if ( Roles.isPicker(currentUser))
                    storesProvisions = response.filter(p => isDefined(p.store) && isDefined(p.store.platform));
                setProvisions(storesProvisions);
            });
  };

  const fetchZones = () => {
      ZoneActions
          .findAll()
          .then(response => setZones(response));
  };

  const getUTCDates = () => {
      const UTCStart = new Date(dates.start.getFullYear(), dates.start.getMonth(), dates.start.getDate(), 4, 0, 0);
      const UTCEnd = new Date(dates.end.getFullYear(), dates.end.getMonth(), dates.end.getDate() + 1, 3, 59, 0);
      return {start: UTCStart, end: UTCEnd};
  };

  const getFormattedSales = () => period.map(d => orders.reduce((sum, s) => sum += isSameDate(d, new Date(s.deliveryDate)) ? getTotalOrder(s) : 0, 0));

  const getFormattedProvisions = () => period.map(d => provisions.reduce((sum, p) => sum += isSameDate(d, new Date(p.provisionDate)) ? getTotalProvision(p.goods) : 0, 0));
  
  const getFormattedTarget = () => period.map(date => target);
  
  const getTotalProvision = goods => goods.reduce((sum, g) => sum += isDefined(g.received) && isDefined(g.price) ? g.received * g.price : 0, 0);
  
  const getDataMax = data => data.reduce((max, d) => max = d > max ? d : max, 0);

  const getSalesPerZone = () => zones.map(z => ({ name: z.name, total: orders.reduce((sum, s) => sum += z.cities.findIndex(c => c.zipCode === s.metas.zipcode) !== -1 ? getTotalOrder(s) : 0, 0) }));

  const getTotalOrder = order => order.items.reduce((sum, i) => sum += i.price * getQuantity(i, order.status), 0);

  const getVolumeOrder = order => order.items.reduce((sum, i) => sum += i.product.weight * getQuantity(i, order.status), 0);

  const getVolumes = () => orders.reduce((sum, s) => sum += getVolumeOrder(s), 0).toFixed(2);

  const getClients = () => {
      const onlineClients = [...new Set(orders.filter(s => isDefined(s.email)).map(s => s.email))].length;
      const storeClients = orders.reduce((sum, curr) => sum += isDefined(curr.numberOfSales) ? curr.numberOfSales : 0, 0);
      return onlineClients + storeClients;
  };

    const getQuantity = (item, status) => {
        const { deliveredQty, preparedQty, orderedQty } = item;
        return (
            ["WAITING", "PRE-PREPARED"].includes(status) && isDefined(orderedQty) ? 
                orderedQty : 
            ["PREPARED", "READY", "ON_TRUCK"].includes(status) ? 
                isDefined(preparedQty) ? preparedQty : 
                isDefined(orderedQty) ? orderedQty : 0 :
            ["COLLECTABLE", "DELIVERED", "SHIPPED"].includes(status) ? 
                isDefined(deliveredQty) ? deliveredQty : 
                isDefined(preparedQty) ? preparedQty : 
                isDefined(orderedQty) ? orderedQty : 0 : 
            0
        );
    };

  const getTurnover = () => {
    return orders.reduce((tSum, s) => {
        return tSum += s.items.reduce((sum, i) => {
            const quantity = isDefined(i.deliveredQty) ? i.deliveredQty : i.orderedQty;
            return sum += (quantity * i.price);
        }, 0);
    }, 0).toFixed(2);
  };

  const getPlatformPart = () => {
    return orders.reduce((tSum, s) => {
        return tSum += isDefined(s.numberOfSales) ? 0 : s.items.reduce((sum, i) => {
            const platformPart = i.product.seller.ownerRate / 100;
            const quantity = isDefined(i.deliveredQty) ? i.deliveredQty : i.orderedQty;
            return sum += (quantity * i.price * platformPart);
        }, 0);
    }, 0).toFixed(2);
  };

  const getGain = () => {
    return Roles.hasAdminPrivileges(currentUser) || Roles.isPicker(currentUser) ? 
        getPlatformPart() : (getTurnover() - getPlatformPart()).toFixed(2);
  };

  const getMax = () => {
    const formattedSales = getFormattedSales();
    const salesMax = getDataMax(formattedSales);
    const provisionMax = getDataMax(getFormattedProvisions());
    return salesMax < provisionMax ? provisionMax : salesMax;
  };

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

  const hasAccessToTurnover = user => Roles.hasAdminPrivileges(user) || Roles.isSeller(user) || Roles.isStoreManager(user);

  return (
    <>
        <CCard>
            <CCardBody>
              <CRow>
                <CCol sm="5">
                  <h4 id="traffic" className="card-title mb-0">Activité</h4>
                  <div className="small text-muted">{ (new Date()).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', timeZone: 'UTC'}) }</div>
                </CCol>
              </CRow>
              <CChartLine
                  { ...attributes }
                  datasets={ dataset }
                  options={ getOptions(getMax()) }
                  labels={ period.map(d => getDayName(d)) }
              />
            </CCardBody>
            { !isDefined(supervisor) && isDefinedAndNotVoid(viewedZones) && 
                <CCardFooter>
                  <CRow className="text-center">
                    { viewedZones.map((zone, index) => {
                        const totalZones = viewedZones.reduce((sum, z) => sum += z.total, 0);
                        const percent = totalZones > 0 ? (zone.total / totalZones * 100).toFixed(2) : 0;
                        return (
                            <CCol md sm="12" className="mb-sm-2 mb-0" key={ index }>
                                <div className="text-muted">{ zone.name }</div>
                                <strong>{ percent + "%" }</strong>
                                <CProgress
                                    className="progress-xs mt-2"
                                    precision={ 1 }
                                    color={ getProgressColor(index) }
                                    value={ percent }
                                />
                            </CCol>
                        );
                    })}
                  </CRow>
                </CCardFooter>
            }
          </CCard>
          <CRow>
            <CCol xs="12" sm={ hasAccessToTurnover(currentUser) ? "6" : "4"} lg={ hasAccessToTurnover(currentUser) ? "3" : "4"}>
                <CWidgetIcon text="Commandes" header={ "" + orders.length } color="primary" iconPadding={ false }>
                    <CIcon width={ 24 } name="cil-clipboard"/>
                </CWidgetIcon>
            </CCol>
            { hasAccessToTurnover(currentUser) ?
                <>
                    <CCol xs="12" sm="6" lg="3">
                        <CWidgetIcon 
                            text="Clients" 
                            header={ !isDefined(supervisor) ? "" + getClients() : "0" } 
                            color="info" 
                            iconPadding={ false }
                        >
                            <CIcon width={ 24 } name="cil-people"/>
                        </CWidgetIcon>
                    </CCol>
                    <CCol xs="12" sm="6" lg="3">
                        <CWidgetIcon 
                            text={ "Chiffre d'affaires" }
                            header={ getTurnover() }
                            color="warning"
                            iconPadding={ false }
                        >
                            <CIcon width={ 24 } name="cil-chart"/>
                        </CWidgetIcon>
                    </CCol>
                    <CCol xs="12" sm="6" lg="3">
                        <CWidgetIcon 
                            text={ "Gain" }
                            header={ getGain() }
                            color="danger" 
                            iconPadding={ false }
                        >
                            <CIcon width={ 24 } name="cil-money"/>
                        </CWidgetIcon>
                    </CCol>
                </>
                :
                <>
                    <CCol xs="12" sm={ hasAccessToTurnover(currentUser) ? "6" : "4"} lg={ hasAccessToTurnover(currentUser) ? "3" : "4"}>
                        <CWidgetIcon 
                            text={ !isDefined(supervisor) ? "Clients" : "Moyenne" }
                            header={ !isDefined(supervisor) ? "" + getClients() : (isDefinedAndNotVoid(orders) ? (getTurnover() / orders.length).toFixed(2) : 0) + " €" }
                            color="warning"
                            iconPadding={ false }
                        >
                            <CIcon width={ 24 } name={!isDefined(supervisor) ? "cil-people" : "cil-chart"}/>
                        </CWidgetIcon>
                    </CCol>
                    <CCol xs="12" sm={ hasAccessToTurnover(currentUser) ? "6" : "4"} lg={ hasAccessToTurnover(currentUser) ? "3" : "4"}>
                        <CWidgetIcon 
                            text={ !isDefined(supervisor) ? "Volume" : "Total" }
                            header={ !isDefined(supervisor) ? (getVolumes() + " Kg" ) : (getTurnover() + " €") }
                            color="danger" 
                            iconPadding={ false }
                        >
                            <CIcon width={ 24 } name={!isDefined(supervisor) ? "cil-speedometer" : "cil-money"}/>
                        </CWidgetIcon>
                    </CCol>
                </>
            }
        </CRow>
      </>
  )
}

export default StatChart;