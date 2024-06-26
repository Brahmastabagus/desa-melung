import FlexboxGrid from 'rsuite/FlexboxGrid';
import Col from 'rsuite/Col';
import Placeholder from 'rsuite/Placeholder';
import Button from 'rsuite/Button';
import ButtonGroup from 'rsuite/ButtonGroup';
import { BiXCircle, BiCheckCircle } from "react-icons/bi";
import { Fragment, useEffect, useRef, useState } from 'react';
import { getPaymentTicket, getUserTicketBooking, rePaymentTicket, ticketBookingSelector } from '../../../../store/ticketBookingSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import formatDate from '../../../../utils/formatDate';
import rupiah from '../../../../utils/rupiah';
import { Transition } from '@headlessui/react';
import { toast } from 'react-toastify';
import TiketMasukPrint from '../../../Print/TiketMasukPrint';
import { useReactToPrint } from 'react-to-print';
import optionToast from '../../../../constants/optionToast';

const Index = () => {
  const componentRef = useRef();
  const [defaultData, setDefaultData] = useState([])
  const [detailOpen, setDetailOpen] = useState(false)
  const [load, setLoad] = useState(false)
  const [token, setToken] = useState("")
  const [detail, setDetail] = useState([])
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { status } = useSelector(state => state.ticketBookingSlice)
  const ticketPackage = useSelector(ticketBookingSelector.selectAll)

  useEffect(() => {
    dispatch(getUserTicketBooking())
  }, [dispatch])

  useEffect(() => {
    setDefaultData(ticketPackage != [] ? ticketPackage : [])
  }, [ticketPackage])

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoad(true)
    try {
      const res = await dispatch(rePaymentTicket({ order_id: detail?.midtrans_booking_code }));
      if (res.payload.data.status === "success") {
        setToken(res.payload.data.token)
        toast.success(res.payload.data.message, optionToast);
      } else {
        toast.error(res.payload.data.message, optionToast);
      }
    } catch (err) {
      toast.error(`Terjadi kesalahan`, optionToast);
    }
    setLoad(false)
  }

  useEffect(() => {
    const midtransScriptUrl = 'https://app.sandbox.midtrans.com/snap/snap.js';

    let scriptTag = document.createElement('script');
    scriptTag.src = midtransScriptUrl;

    const myMidtransClientKey = import.meta.env.VITE_CLIENTKEY;
    scriptTag.setAttribute('data-client-key', myMidtransClientKey);

    document.body.appendChild(scriptTag);

    return () => {
      document.body.removeChild(scriptTag);
    }
  }, []);

  useEffect(() => {
    if (token) {
      window.snap.pay(token, {
        onSuccess: function (result) {
          dispatch(getPaymentTicket(result)).then(({ payload }) => toast.success(payload.data.message, optionToast))
          navigate(`/invoice?order_id=${result.order_id}&&type=tiket`)
        },
        onPending: function (result) {
          dispatch(getPaymentTicket(result)).then(({ payload }) => toast.info(payload.data.message, optionToast))
        },
        onError: function (result) {
          dispatch(getPaymentTicket(result)).then(({ payload }) => toast.error(payload.data.message, optionToast))
        },
        onClose: function () {
          toast.error('Transaksi dibatalkan', optionToast)
        }
      })
    }
  }, [token])

  const handleDetail = (data) => {
    setDetailOpen(false)
    setDetail(data)
    setTimeout(() => {
      setDetailOpen(true)
    }, 200);
  }

  const handlePrint = useReactToPrint({
    content: () => componentRef.current
  });
  return (
    <>
      <div className="bg-primary text-white w-full h-44 flex justify-center items-center">
        <h1 className="text-3xl font-bold border-b-4 border-b-white">Riwayat Tiket Masuk</h1>
      </div>
      <section id="description" className="flex justify-center gap-5 py-5 bg-secondary-Light">
        <div className="container h-full md:h-auto">
          <FlexboxGrid justify='space-around' className="gap-y-10">
            <FlexboxGrid.Item as={Col} colspan={24} xs={24} sm={24} md={24} lg={12} xl={12} className="!flex !flex-col !px-5 !gap-y-3 !h-[490px] !overflow-auto sm:!h-[490px] sm:!overflow-auto lg:!h-full lg:!overflow-hidden">
              {
                defaultData?.length != 0
                  ?
                  status == "success"
                    ?
                    defaultData.map((item, index) => (
                      <div className={`p-3 rounded-lg bg-white border border-white hover:border hover:border-primary hover:cursor-pointer transition ${detailOpen && detail?.midtrans_booking_code == item?.midtrans_booking_code ? '!border-primary border-2 hover:border-2' : ''}`} key={index} onClick={() => handleDetail(item)}>
                        <div className="flex justify-between items-center">
                          <h6 className="text-xl font-bold">Pagubugan Melung</h6>
                          {
                            item?.payment_status == "success"
                              ?
                              <div className="flex items-center gap-1">
                                <p>Dibayar</p>
                                <BiCheckCircle className="text-primary-Green text-2xl" />
                              </div>
                              :
                              item?.payment_status == "waiting" || item?.payment_status == null
                                ?
                                <div className="flex items-center gap-1">
                                  <p>Menunggu Pemabayaran</p>
                                </div>
                                :
                                <div className="flex items-center gap-1">
                                  <p>Dibatalkan</p>
                                  <BiXCircle className="text-primary-Red text-2xl" />
                                </div>
                          }
                        </div>
                        <div className="pl-2 flex flex-col gap-2 mt-2">
                          <div className="flex flex-col gap-3 border-b-[1px] border-b-secondary w-full">
                            <div className="px-2 py-2 flex flex-col gap-2">
                              <h6 className="text-lg font-bold">Detail</h6>
                              <div className="flex justify-between items-center w-full">
                                <p className="text-base w-2/4">Tanggal Pemesanan</p>
                                <p className="text-base w-5/12 text-right">{formatDate(item?.createdAt)}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center w-full p-2">
                            <p className="text-xl font-bold">Total</p>
                            <p className="text-2xl font-bold">{rupiah(item?.total_price)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                    :
                    <Placeholder.Paragraph rows={5} graph="image" />
                  :
                  <h5 className={`w-full !h-96 flex justify-center items-center ${detailOpen ? "hidden" : "block"}`}>Belum ada pembelian tiket</h5>
              }
            </FlexboxGrid.Item>
            <FlexboxGrid.Item as={Col} colspan={24} xs={24} sm={24} md={24} lg={12} xl={12} className="!px-5 !sticky !top-28">
              <Transition
                as={Fragment}
                show={detailOpen}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <div className={`p-3 rounded-lg bg-white ${detailOpen ? "block" : "hidden"}}`}>
                  <div className="flex flex-col gap-3 border-b-[1px] border-b-secondary w-full">
                    <div className="px-2 py-2 flex flex-col gap-2">
                      <h6 className="text-lg font-bold">Detail</h6>
                      <div className="flex justify-between items-center w-full">
                        <p className="text-base w-2/4">Tanggal Pemesanan</p>
                        <p className="text-base w-5/12 text-right">{formatDate(detail?.createdAt)}</p>
                      </div>
                      <div className="flex justify-between items-center w-full">
                        <p className="text-base w-2/4">Order Id</p>
                        <p className="text-base w-5/12 text-right">{detail?.midtrans_booking_code}</p>
                      </div>
                    </div>
                    <div className="px-2 py-2 flex flex-col gap-2">
                      <h6 className="text-lg font-bold">Detail Pemesanan</h6>
                      <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-1">
                          <p className="text-base">Jumlah Orang</p>
                          <p className="text-sm text-secondary">x{detail?.amount}</p>
                        </div>
                        <p className="text-base">{rupiah(detail?.total_price - detail?.vehicle?.price || 0)}</p>
                      </div>
                      <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-1">
                          <p className="text-base">Kendaraan</p>
                          <p className="text-sm text-secondary">({detail?.vehicle?.type})</p>
                        </div>
                        <p className="text-base">{rupiah(detail?.vehicle?.price || 0)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center w-full p-2">
                    <p className="text-xl font-bold">Total</p>
                    <p className="text-2xl font-bold">{rupiah(detail?.total_price)}</p>
                  </div>
                  {
                    detail?.payment_status == "success"
                      ?
                      <ButtonGroup className="!flex justify-center w-full">
                        <Button appearance="primary" type="button" onClick={handlePrint} className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-primary text-white hover:bg-primary-Medium-Dark disabled:opacity-50">
                          <svg className="flex-shrink-0 w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect width="12" height="8" x="6" y="14" /></svg>
                          Print
                        </Button>
                      </ButtonGroup>
                      :
                      detail?.payment_status == "waiting" || detail?.payment_status == null
                        ?
                        <ButtonGroup className="!flex justify-center w-full">
                          <Button appearance="primary" type="button" onClick={handleSubmit} loading={load} className="py-2 px-3 inline-flex items-center gap-x-2 text-lg font-semibold rounded-lg border border-transparent bg-primary text-white hover:bg-primary-Medium-Dark disabled:opacity-50">Lanjut Bayar</Button>
                        </ButtonGroup>
                        :
                        ""
                  }
                </div>
              </Transition>
              <h5 className={`w-full !h-96 flex justify-center items-center ${detailOpen ? "hidden" : "block"}`}>Tidak ada</h5>
            </FlexboxGrid.Item>
          </FlexboxGrid>
        </div>
      </section>
      <div style={{ display: "none" }}>
        <TiketMasukPrint ref={componentRef} data={detail} />
      </div>
    </>
  )
}

export default Index