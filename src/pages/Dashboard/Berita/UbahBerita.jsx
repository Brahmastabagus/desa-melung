import { ToastContainer, toast } from "react-toastify"
import Breadcrumb from "rsuite/Breadcrumb"
import Button from "rsuite/Button";
import ButtonToolbar from "rsuite/ButtonToolbar";
import Form from "rsuite/Form";
import Input from "rsuite/Input";
import Panel from "rsuite/Panel";
import Schema from "rsuite/Schema";
import Uploader from "rsuite/Uploader";
import optionToast from "../../../constants/optionToast";
import { forwardRef, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { articleSelector, getArticle, updateArticle } from "../../../store/articleSlice";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';

const { StringType } = Schema.Types;
const model = Schema.Model({
  title: StringType().isRequired("Judul harus diisi"),
  description: StringType().isRequired("Deskripsi harus diisi"),
});

const Textarea = forwardRef(function Textarea(props, ref) {
  return <Input {...props} ref={ref} as="textarea" />;
});

Textarea.displayName = 'Textarea';

const UbahBerita = () => {
  const formRef = useRef();
  const [formValue, setFormValue] = useState({
    title: "",
    description: "",
  });
  const [load, setLoad] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { id } = useParams()

  const articles = useSelector((state) => articleSelector.selectById(state, id))

  useEffect(() => {
    dispatch(getArticle())
  }, [dispatch])


  useEffect(() => {
    setFormValue(articles)
  }, [articles])

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formRef.current.check()) {
      toast.error(`Pastikan semua data yang Anda masukkan sudah benar`, optionToast);
      return;
    }

    const { title, description, images } = formValue;
    setLoad(true);

    const arr = images ? images.filter((item) => item !== undefined) : [];

    const res = await dispatch(updateArticle({
      title,
      description,
      images: arr,
      id
    }));

    try {
      if (res.payload.data.status === "success") {
        toast.success(res.payload.data.message, optionToast);
        navigate('/admin/berita');
      } else {
        setLoad(false);
        toast.error(res.payload.data.message, optionToast);
      }
    } catch (err) {
      setLoad(false);
      toast.error(`Terjadi kesalahan`, optionToast);
    }
  }

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [
        { list: 'ordered' },
        { list: 'bullet' },
        { indent: '-1' },
        { indent: '+1' },
      ],
      ['link', 'image'],
      ['clean'],
    ],
  };

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'indent',
    'link',
    'image',
  ];
  return (
    <>
      <Panel
        header={
          <>
            <Breadcrumb>
              <Breadcrumb.Item href="/admin/berita" className="text-secondary">Daftar Berita</Breadcrumb.Item>
              <Breadcrumb.Item active>Ubah Berita</Breadcrumb.Item>
            </Breadcrumb>
          </>
        }
      >
        <ToastContainer />

        <Form
          ref={formRef}
          onChange={setFormValue}
          formValue={formValue}
          model={model}
          encType="multipart/form-data"
          fluid
        >
          <Form.Group controlId="judul">
            <Form.ControlLabel>Judul</Form.ControlLabel>
            <Form.Control
              name="title"
              errorPlacement='bottomEnd'
              placeholder="Judul"
              disabled={load}
              value={formValue?.title}
              onChange={(data) => setFormValue({ ...formValue, title: data })}
            />
          </Form.Group>

          <Form.Group controlId="deskripsi">
            <Form.ControlLabel>Deskripsi</Form.ControlLabel>
            <ReactQuill
              theme="snow"
              value={formValue?.description}
              onChange={(e) => {
                setFormValue({
                  ...formValue,
                  description: e
                })
              }}
              modules={modules}
              formats={formats}
            />
          </Form.Group>

          <Form.Group controlId="image">
            <Form.ControlLabel>Gambar</Form.ControlLabel>
            <Form.Control
              accepter={Uploader}
              listType="picture-text"
              // defaultFileList={formValue?.images}
              fileList={formValue?.article_images}
              accept="image/*"
              action="#"
              multiple
              removable={!formValue?.article_images?.id ? true : false}
              disabled={load}
              name="image"
              errorPlacement='bottomEnd'
              placeholder="Image"
              onChange={(e) => {
                let arr = []
                for (let i = 0; i < e.length; i++) {
                  arr.push(e[i].blobFile)
                }
                setFormValue({
                  ...formValue,
                  images: arr
                })
              }}
            />
          </Form.Group>

          <ButtonToolbar>
            <Button className='bg-sky-500' appearance="primary" loading={load} type="submit" onClick={handleSubmit}>
              Ubah
            </Button>
          </ButtonToolbar>
        </Form>
      </Panel>
    </>
  )
}

export default UbahBerita