import React, { useEffect, useState } from 'react';
import Menu from './menu';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../api/categoryApi';

function Category() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);
  const filteredCategories = categories.filter(
    (category) =>
      (category._id && category._id.toString().includes(searchQuery)) ||
      (category.name && category.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      if (Array.isArray(response.data.data)) {
        setCategories(response.data.data);
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      setError('Failed to fetch categories.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const addCategory = async () => {
    try {
      const response = await createCategory(formData);
      setCategories([...categories, response.data.data]);
      setFormData({ name: '', description: '', image: '' });
      toast.success('Thêm danh mục thành công!');
    } catch (error) {
      console.error(error);
      toast.error('Thêm danh mục thất bại!');
    }
  };

  const editCategory = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      image: category.image,
    });
  };

  const updateCategoryHandler = async () => {
    try {
      const response = await updateCategory(editingCategory._id, formData);
      const updatedCategory = response.data.data;
      const updatedCategories = categories.map((cat) =>
        cat._id === updatedCategory._id ? updatedCategory : cat
      );
      setCategories(updatedCategories);
      setEditingCategory(null);
      setFormData({ name: '', description: '', image: '' });
      toast.success('Cập nhật danh mục thành công!');
    } catch (error) {
      console.error(error);
      toast.error('Cập nhật danh mục thất bại!');
    }
  };

  const deleteCategoryHandler = async (categoryId) => {
    try {
      await deleteCategory(categoryId);
      setCategories(categories.filter((cat) => cat._id !== categoryId));
      toast.success('Xóa danh mục thành công!');
    } catch (error) {
      console.error(error);
      toast.error('Xóa danh mục thất bại!');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCategory) {
      updateCategoryHandler();
    } else {
      addCategory();
    }
  };

  return (
    <div>
      <Menu />
      <main className="app-content">
        <div className="app-title">
          <ul className="app-breadcrumb breadcrumb side">
            <li className="breadcrumb-item active">
              <a href="#"><b>Quản lý danh mục</b></a>
              <div className="search-bar">
                      <input
                        type="text"
                        placeholder="Tìm kiếm mã nhân viên hoặc tên nhân viên"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
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
                    <label htmlFor="name">Tên danh mục</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="form-control"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="description">Mô tả</label>
                    <textarea
                      id="description"
                      name="description"
                      className="form-control"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="image">Hình ảnh URL</label>
                    <input
                      type="text"
                      id="image"
                      name="image"
                      className="form-control"
                      value={formData.image}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    {editingCategory ? 'Cập nhật danh mục' : 'Thêm danh mục'}
                  </button>
                  {editingCategory && (
                    <button
                      type="button"
                      className="btn btn-secondary ml-2"
                      onClick={() => {
                        setEditingCategory(null);
                        setFormData({ name: '', description: '', image: '' });
                      }}
                    >
                      Hủy sửa
                    </button>
                  )}
                </form>

                <table className="table table-hover table-bordered mt-4">
                  <thead>
                    <tr>
                      <th width={10}><input type="checkbox" id="all" /></th>
                      <th>Mã danh mục</th>
                      <th>Tên danh mục</th>
                      <th>Mô tả</th>
                      <th>Hình ảnh</th>
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
                      filteredCategories.map((category) => (
                        <tr key={category._id}>
                          <td><input type="checkbox" /></td>
                          <td>{category._id}</td>
                          <td>{category.name}</td>
                          <td>{category.description}</td>
                          <td><img src={category.image} alt={category.name} width="50" /></td>
                          <td>
                            <button
                              className="btn btn-primary btn-sm edit"
                              type="button"
                              onClick={() => editCategory(category)}
                            >
                              <i className="fa fa-edit" /> Sửa
                            </button>
                            <button
                              className="btn btn-danger btn-sm trash"
                              type="button"
                              onClick={() => deleteCategoryHandler(category._id)}
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
      </main>
    </div>
  );
}

export default Category;
