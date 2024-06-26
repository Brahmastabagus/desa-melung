import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import optionToast from "../../../constants/optionToast";
import Breadcrumb from "rsuite/Breadcrumb"
import Button from "rsuite/Button";
import DOMHelper from "rsuite/DOMHelper";
import Input from "rsuite/Input";
import InputGroup from "rsuite/InputGroup";
import Modal from "rsuite/Modal";
import Pagination from "rsuite/Pagination";
import Panel from "rsuite/Panel";
import List from "rsuite/List";
import Stack from "rsuite/Stack";
import Table from "rsuite/Table";
import { BiSearch, BiEditAlt, BiTrash, BiXCircle } from "react-icons/bi";
import { TfiAlert } from "react-icons/tfi";
import 'react-toastify/dist/ReactToastify.css';
import { deleteTourPackage, getTourPackage, tourPackageSelector } from "../../../store/tourPackageSlice";
import { deleteTourImage } from "../../../store/tourImageSlice";
import rupiah from "../../../utils/rupiah";

const { Column, HeaderCell, Cell } = Table;
const { getHeight } = DOMHelper;
const Index = () => {
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [defaultData, setDefaultData] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortColumn, setSortColumn] = useState();
  const [sortType, setSortType] = useState();
  const [load, setLoad] = useState(false);
  const navigate = useNavigate();

  const [headerDeleteImage, setHeaderDeleteImage] = useState();
  const [openDeleteImage, setOpenDeleteImage] = useState(false);
  const [idDeleteImage, setIdDeleteImage] = useState();
  const handleCloseDeleteImage = () => setOpenDeleteImage(false);

  const [headerDelete, setHeaderDelete] = useState();
  const [openDelete, setOpenDelete] = useState(false);
  const [idDelete, setIdDelete] = useState();
  const handleCloseDelete = () => setOpenDelete(false);

  const [headerImage, setHeaderImage] = useState();
  const [openImage, setOpenImage] = useState(false);
  const [dataImage, setDataImage] = useState([]);
  const handleCloseImage = () => setOpenImage(false);

  const [headerFacilities, setHeaderFacilities] = useState();
  const [openFacilities, setOpenFacilities] = useState(false);
  const [dataFacilities, setDataFacilities] = useState([]);
  const handleCloseFacilities = () => setOpenFacilities(false);

  const dispatch = useDispatch()
  const { status } = useSelector(state => state.tourPackageSlice)
  const tourPackage = useSelector(tourPackageSelector.selectAll)

  useEffect(() => {
    dispatch(getTourPackage())
  }, [dispatch])

  useEffect(() => {
    setDefaultData(tourPackage != "Tidak ada data" ? tourPackage : [])
  }, [tourPackage])

  const handleChangeLimit = dataKey => {
    setPage(1);
    setLimit(dataKey);
  };

  const data = defaultData.filter((v, i) => {
    const start = limit * (page - 1);
    const end = start + limit;
    return i >= start && i < end;
  });

  const handleSortColumn = (sortColumn, sortType) => {
    setSortColumn(sortColumn);
    setSortType(sortType);
  };

  const filteredData = () => {
    const filtered = data.filter(item => {
      if (item?.title?.toLowerCase() != undefined && !item?.title?.toLowerCase().includes(searchKeyword.toLowerCase())) {
        return false;
      }

      return true;
    });

    if (sortColumn && sortType) {
      return filtered.sort((a, b) => {
        let x = a[sortColumn];
        let y = b[sortColumn];

        if (typeof x === 'string') {
          x = x.charCodeAt(0);
        }
        if (typeof y === 'string') {
          y = y.charCodeAt(0);
        }

        if (sortType === 'asc') {
          return x - y;
        } else {
          return y - x;
        }
      });
    }
    return filtered;
  };

  const handleOpenImage = (data, header) => {
    setDataImage(data)
    setHeaderImage(header)
    setOpenImage(true)
  };

  const handleOpenFacilities = (data, header) => {
    setDataFacilities(data)
    setHeaderFacilities(header)
    setOpenFacilities(true)
  };

  const handleOpenDelete = (id, header) => {
    setIdDelete(id)
    setHeaderDelete(header)
    setOpenDelete(true)
  };

  const handleDelete = async () => {
    setLoad(true)
    const res = await dispatch(deleteTourPackage(idDelete))
    setOpenDelete(false)
    await dispatch(getTourPackage())
    setLoad(false)
    toast.success(res.payload.message, optionToast);
  }

  const handleOpenDeleteImage = (id, header) => {
    setIdDeleteImage(id)
    setHeaderDeleteImage(header)
    setOpenDeleteImage(true)
  };

  const handleDeleteImage = async () => {
    setLoad(true)
    const res = await dispatch(deleteTourImage(idDeleteImage))
    setOpenDeleteImage(false)
    setOpenImage(false)
    await dispatch(getTourPackage())
    setLoad(false)
    toast.success(res.payload.message, optionToast);
  }

  return (
    <>
      <Panel
        header={
          <>
            <Breadcrumb>
              <Breadcrumb.Item>Daftar Paket Wisata</Breadcrumb.Item>
            </Breadcrumb>
          </>
        }
      >
        <ToastContainer />
        <Stack className='flex justify-between mb-5' spacing={6}>
          <Button appearance="primary" className='bg-blue-400'
            onClick={() => navigate(`/admin/paket-wisata/tambah`)}
          >
            Tambah Paket Wisata
          </Button>

          <InputGroup inside>
            <Input placeholder="Search" value={searchKeyword} onChange={setSearchKeyword} />
            <InputGroup.Addon>
              <BiSearch />
            </InputGroup.Addon>
          </InputGroup>
        </Stack>
        <Table
          height={Math.max(getHeight(window) - 200, 400)}
          data={filteredData()}
          sortColumn={sortColumn}
          sortType={sortType}
          onSortColumn={handleSortColumn}
          wordWrap="break-words"
          loading={status == "pending"}
        >
          <Column width={50} align="center">
            <HeaderCell>No</HeaderCell>
            <Cell>{(rowData, index) => index + 1}</Cell>
          </Column>

          <Column width={100} fixed >
            <HeaderCell>Judul</HeaderCell>
            <Cell dataKey="title">{rowData => `${rowData?.title}`}</Cell>
          </Column>

          <Column width={150}>
            <HeaderCell>Sub Judul</HeaderCell>
            <Cell dataKey="title">{rowData => `${rowData?.sub_title}`}</Cell>
          </Column>

          <Column width={500} fullText>
            <HeaderCell>Deskripsi</HeaderCell>
            <Cell>{rowData => `${rowData?.description}`}</Cell>
          </Column>

          <Column width={100}>
            <HeaderCell>Harga</HeaderCell>
            <Cell>{rowData => `${rupiah(rowData?.price)}`}</Cell>
          </Column>

          <Column width={100} align="center">
            <HeaderCell>Fasilitas</HeaderCell>
            <Cell style={{ padding: '6px' }}>
              {rowData => (
                <Button className='hover:!bg-primary-Medium-Dark !bg-primary !text-white hover:!text-white group' onClick={() => handleOpenFacilities(rowData?.facilities, rowData?.title)}>
                  Lihat
                </Button>
              )}
            </Cell>
          </Column>

          <Column width={100} align="center">
            <HeaderCell>Gambar</HeaderCell>
            <Cell style={{ padding: '6px' }}>
              {rowData => (
                <Button className='hover:!bg-primary-Medium-Dark !bg-primary !text-white hover:!text-white group' onClick={() => handleOpenImage(rowData?.tour_images, rowData?.title)}>
                  Lihat
                </Button>
              )}
            </Cell>
          </Column>

          <Column width={100} align="center">
            <HeaderCell>Action</HeaderCell>
            <Cell style={{ padding: '6px' }}>
              {rowData => (
                <div className='flex place-content-center gap-1'>
                  <Button className='hover:!bg-green-500 group' onClick={() => navigate(`/admin/paket-wisata/ubah/${rowData.id}`)}>
                    <BiEditAlt className='group-hover:text-white' />
                  </Button>
                  <Button className='hover:!bg-red-500 group' onClick={() => handleOpenDelete(rowData.id, rowData.title)}>
                    <BiTrash className='group-hover:text-white' />
                  </Button>
                </div>
              )}
            </Cell>
          </Column>

        </Table>
        <div style={{ padding: 20 }}>
          <Pagination
            prev
            next
            first
            last
            ellipsis
            boundaryLinks
            maxButtons={5}
            size="xs"
            layout={['total', '-', 'limit', '|', 'pager', 'skip']}
            total={defaultData.length}
            limitOptions={[10, 30, 50]}
            limit={limit}
            activePage={page}
            onChangePage={setPage}
            onChangeLimit={handleChangeLimit}
          />
        </div>

        <Modal backdrop="static" role="alertdialog" open={openImage} onClose={handleCloseImage} size="lg">
          <Modal.Header>
            <Modal.Title>{headerImage}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px", padding: "20px" }}>
              {dataImage?.map(({ url, id, name }, index) => (
                <div key={index} style={{ position: "relative" }}>
                  <img src={url} style={{ objectFit: "cover", width: "100%", height: "100%" }} loading="lazy" />
                  <button
                    style={{
                      position: "absolute",
                      top: "-10px",
                      right: "-10px",
                      borderRadius: "50%",
                      border: "none",
                      cursor: "pointer",
                    }}
                    className="bg-primary text-white"
                    onClick={() => handleOpenDeleteImage(id, name)}
                  >
                    <BiXCircle size={28} />
                  </button>
                </div>
              ))}
            </div>
          </Modal.Body>
        </Modal>

        <Modal backdrop="static" role="alertdialog" open={openDeleteImage} onClose={handleCloseDeleteImage} size="xs">
          <Modal.Body>
            <TfiAlert style={{ color: '#ffb300', fontSize: 24 }} />
            Apakah kamu yakin untuk menghapus data dengan foto <span className="font-bold">{headerDeleteImage}</span> ini?
          </Modal.Body>
          <Modal.Footer>
            <Button className='bg-red-500' color="red" onClick={handleDeleteImage} loading={load} appearance="primary">
              Hapus
            </Button>
            <Button className='bg-slate-100' onClick={handleCloseDeleteImage} appearance="subtle">
              Batal
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal role="alertdialog" open={openFacilities} onClose={handleCloseFacilities} size="sm">
          <Modal.Header>
            <Modal.Title>Facilitas {headerFacilities}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <List bordered>
              {
                dataFacilities?.map((item, index) => (
                  <List.Item key={index}>{item}</List.Item>
                ))
              }
            </List>
          </Modal.Body>
        </Modal>

        <Modal role="alertdialog" open={openDelete} onClose={handleCloseDelete} size="xs">
          <Modal.Body>
            <TfiAlert style={{ color: '#ffb300', fontSize: 24 }} />
            Apakah kamu yakin untuk menghapus data dengan judul <span className="font-bold">{headerDelete}</span> ini?
          </Modal.Body>
          <Modal.Footer>
            <Button className='bg-red-500' color="red" onClick={handleDelete} loading={load} appearance="primary">
              Hapus
            </Button>
            <Button className='bg-slate-100' onClick={handleCloseDelete} appearance="subtle">
              Batal
            </Button>
          </Modal.Footer>
        </Modal>
      </Panel>
    </>
  )
}

export default Index