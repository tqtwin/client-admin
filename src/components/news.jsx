import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Menu from './menu';
import { toast } from 'react-toastify';

function News() {
  const [news, setNews] = useState([]);
  const [activeSection, setActiveSection] = useState('news'); // Xác định phần đang hiển thị
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingNews, setEditingNews] = useState(null);
  const [websiteInfo, setWebsiteInfo] = useState({
    name: '',
    email: '',
    facebook:'',
    tiktok: '',
    twitter: '',
    instagram: '',
    about: '',
    privacyPolicy: '',
    address: '',
    phone: '',
    status: '',
    avatar: '',
  });
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: '',  // Khởi tạo trống cho ảnh mới
    status: 'Hiển thị',
    role:'news'
  });
  const fetchWebsiteInfo = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8083/api/v1/website');
      if (Array.isArray(response.data) && response.data.length > 0) {
        setWebsiteInfo(response.data[0]); // Gán dữ liệu từ phần tử đầu tiên
      } else {
        throw new Error('No data received or data format is incorrect.');
      }
    } catch (error) {
      console.error(error);
      setError('Failed to fetch website information.');
    } finally {
      setLoading(false);
    }
  };

  const updateWebsiteInfo = async () => {
    setLoading(true);
    try {
      const response = await axios.put(`http://localhost:8083/api/v1/website/${websiteInfo._id}`, websiteInfo);
      toast.success('Thông tin trang đã được cập nhật thành công!');

    } catch (error) {
      console.error('Error updating website info:', error);
      toast.error('Đã xảy ra lỗi khi cập nhật thông tin trang.');

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'info') {
      fetchWebsiteInfo();
    }
  }, [activeSection]);
  // Get user ID from local storage
  const user = JSON.parse(sessionStorage.getItem('admin') || '{}');
  const userId = user.id || '';

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8083/api/v1/news/');
      if (Array.isArray(response.data)) {
        setNews(response.data);
      } else {
        throw new Error('Expected array but got different data format.');
      }
    } catch (error) {
      setError('Failed to fetch news.');
    } finally {
      setLoading(false);
    }
  };
  const handleBannerUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBannerImage(reader.result);
      reader.readAsDataURL(file);
    }
  };
  const [bannerImage, setBannerImage] = useState('');


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addNews = async () => {
    try {
      const newNewsData = { ...formData, userId };
      await axios.post('http://localhost:8083/api/v1/news/', newNewsData);
      fetchNews();  // Reload data after adding
      setFormData({ title: '', content: '', image: '', status: 'Hiển thị',role: 'news'});
    } catch (error) {
      console.error('Error adding news:', error);
    }
  };

  const editNews = (newsItem) => {
    setEditingNews(newsItem);
    setFormData({
      title: newsItem.title,
      content: newsItem.content,
      image: newsItem.image,  // Lưu ảnh cũ khi chỉnh sửa
      status: newsItem.status,
      role:newsItem.status
    });
  };

  const updateNews = async () => {
    try {
      const updatedNewsData = { ...formData, userId };
      await axios.put(`http://localhost:8083/api/v1/news/${editingNews._id}`, updatedNewsData);
      // Reload data after updating
      setEditingNews(null);
      setFormData({ title: '', content: '', image: '', status: 'Hiển thị' });
      fetchNews();
    } catch (error) {
      console.error('Error updating news:', error);
    }
  };

  const deleteNews = async (newsId) => {
    try {
      await axios.delete(`http://localhost:8083/api/v1/news/${newsId}`);
      fetchNews();  // Reload data after deleting
    } catch (error) {
      console.error('Error deleting news:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingNews) {
      updateNews();
      toast.success('Cập nhật tin tức thành công')
    } else {
      addNews();
      toast.success('Thêm tin tức thành công')
    }
  };
  const handleWebsiteInfoChange = (e) => {
    const { name, value } = e.target;
    setWebsiteInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setWebsiteInfo((prev) => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <div>
      <Menu />
      <main className="app-content">
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <ul className="navbar-nav">
            <li className={`nav-item ${activeSection === 'news' ? 'active' : ''}`}>
              <button className="nav-link btn btn-link" onClick={() => setActiveSection('news')}>
                Quản lý Tin tức
              </button>
            </li>
            <li className={`nav-item ${activeSection === 'banner' ? 'active' : ''}`}>
              <button className="nav-link btn btn-link" onClick={() => setActiveSection('banner')}>
                Thêm Hình cho Banner
              </button>
            </li>
            <li className={`nav-item ${activeSection === 'info' ? 'active' : ''}`}>
              <button className="nav-link btn btn-link" onClick={() => setActiveSection('info')}>
                Quản lý Thông tin Trang
              </button>
            </li>
          </ul>

        </div>
      </nav>
      {activeSection === 'news' && (

        <div>
          <div className="app-title">
            <ul className="app-breadcrumb breadcrumb side">
              <li className="breadcrumb-item active">
                <a href="#"><b>Quản lý Tin tức</b></a>
              </li>
            </ul>
            <div id="clock" />
          </div>

          <div className="row">
            <div className="col-md-12">
              <div className="tile">
                <div className="tile-body">
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label htmlFor="title">Tiêu đề</label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        placeholder={websiteInfo.name}
                        className="form-control"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="content">Nội dung</label>
                      <textarea
                        id="content"
                        name="content"
                        className="form-control"
                        value={formData.content}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="image">Hình ảnh</label>
                      <input
                        type="file"
                        id="image"
                        name="image"
                        className="form-control"
                        onChange={handleImageChange}
                        required={!editingNews}  // Bắt buộc chỉ khi thêm mới
                      />
                      {formData.image && (
                        <div className="mt-2">
                          <img src={formData.image} alt="Uploaded" width="100" />
                        </div>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="status">Trạng thái</label>
                      <select
                        id="status"
                        name="status"
                        className="form-control"
                        value={formData.status}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="Hiển thị">Hiển thị</option>
                        <option value="Ẩn">Ẩn</option>
                      </select>
                    </div>
                    <button type="submit" className="btn btn-primary">
                      {editingNews ? 'Cập nhật bài viết' : 'Thêm bài viết'}
                    </button>
                    {editingNews && (
                      <button
                        type="button"
                        className="btn btn-secondary ml-2"
                        onClick={() => {
                          setEditingNews(null);
                          setFormData({ title: '', content: '', image: '', status: 'Hiển thị' });
                        }}
                      >
                        Hủy sửa
                      </button>
                    )}
                  </form>

                  <table className="table table-hover table-bordered mt-4" id="sampleTable">
                    <thead>
                      <tr>
                        <th>Mã bài viết</th>
                        <th>Tiêu đề</th>
                        <th>Nội dung</th>
                        <th>Hình ảnh</th>
                        <th>Trạng thái</th>
                        <th>Chức năng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="6" className="text-center">Đang tải...</td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td colSpan="6" className="text-center text-danger">{error}</td>
                        </tr>
                      ) : (
                        news.map((newsItem) => (
                          <tr key={newsItem._id}>
                            <td>{newsItem._id}</td>
                            <td>{newsItem.title}</td>
                            <td>{newsItem.content}</td>
                            <td><img src={newsItem.image} alt={newsItem.title} width="50" /></td>
                            <td>{newsItem.status}</td>
                            <td>
                              <button
                                className="btn btn-primary btn-sm edit"
                                type="button"
                                title="Sửa"
                                onClick={() => editNews(newsItem)}
                              >
                                <i className="fa fa-edit" /> Sửa
                              </button>
                              <button
                                className="btn btn-danger btn-sm trash"
                                type="button"
                                title="Xóa"
                                onClick={() => deleteNews(newsItem._id)}
                              >
                                <i className="fas fa-trash-alt" /> Xóa
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        )}
         {activeSection === 'banner' && (
          <div>
            <h2>Thêm Hình cho Banner</h2>
            <input type="file" className="form-control" onChange={handleBannerUpload} />
            {bannerImage && (
              <div className="mt-2">
                <img src={bannerImage} alt="Banner" className="img-fluid" />
              </div>
            )}
            <button className="btn btn-primary mt-3">Lưu Banner</button>
          </div>
        )}

{activeSection === 'info' && (
          <div>
            <h2>Quản lý Thông tin Trang</h2>
            {loading ? (
              <p>Đang tải...</p>
            ) : error ? (
              <p className="text-danger">{error}</p>
            ) : (
              <div>
                <div className="form-group">
                  <label>Tên Trang</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"

                    value={websiteInfo.name}
                    onChange={handleWebsiteInfoChange}
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={websiteInfo.email}
                    onChange={handleWebsiteInfoChange}
                  />
                </div>
                <div className="form-group">
                  <label>Link Facebook</label>
                  <input
                    type="text"
                    className="form-control"
                    name="facebook"
                    value={websiteInfo.facebook}
                    onChange={handleWebsiteInfoChange}
                  />
                </div>
                <div className="form-group">
                  <label>Link TikTok</label>
                  <input
                    type="text"
                    className="form-control"
                    name="tiktok"
                    value={websiteInfo.tiktok}
                    onChange={handleWebsiteInfoChange}
                  />
                </div>

                <div className="form-group">
                  <label>Link Twitter</label>
                  <input
                    type="text"
                    className="form-control"
                    name="twitter"
                    value={websiteInfo.twitter}
                    onChange={handleWebsiteInfoChange}
                  />
                </div>

                <div className="form-group">
                  <label>Link Instagram</label>
                  <input
                    type="text"
                    className="form-control"
                    name="instagram"
                    value={websiteInfo.instagram}
                    onChange={handleWebsiteInfoChange}
                  />
                </div>

                <div className="form-group">
                  <label>Giới thiệu</label>
                  <textarea
                    className="form-control"
                    name="about"
                    value={websiteInfo.about}
                    onChange={handleWebsiteInfoChange}
                  />
                </div>

                <div className="form-group">
                  <label>Chính sách bảo mật</label>
                  <textarea
                    className="form-control"
                    name="privacyPolicy"
                    value={websiteInfo.privacyPolicy}
                    onChange={handleWebsiteInfoChange}
                  />
                </div>

                <div className="form-group">
                  <label>Địa chỉ</label>
                  <input
                    type="text"
                    className="form-control"
                    name="address"
                    value={websiteInfo.address}
                    onChange={handleWebsiteInfoChange}
                  />
                </div>

                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="text"
                    className="form-control"
                    name="phone"
                    value={websiteInfo.phone}
                    onChange={handleWebsiteInfoChange}
                  />
                </div>

                <div className="form-group">
                  <label>Avatar</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={handleAvatarChange}
                  />
                  {websiteInfo.avatar && (
                    <div className="mt-2">
                      <img src={websiteInfo.avatar} alt="Avatar" width="100" />
                    </div>
                  )}
                </div>

                <button className="btn btn-primary" onClick={updateWebsiteInfo}>
                  Cập nhật Thông tin
                </button>
              </div>
            )}
          </div>
        )}
              </main>
    </div>
  );
}

export default News;
