import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, Button, Form } from 'react-bootstrap';
import Menu from './menu';

function Supplier() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);  // State to control modal visibility
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    totalDebt: 0,   // Đảm bảo giá trị mặc định là 0
    paidAmount: 0,  // Đảm bảo giá trị mặc định là 0
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get('http://localhost:8083/api/v1/suppliers/');
      if (Array.isArray(response.data.suppliers)) {
        setSuppliers(response.data.suppliers);
      } else {
        throw new Error('Expected array but got different data format.');
      }
    } catch (error) {
      setError('Failed to fetch suppliers.');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Add Supplier
  const addSupplier = async () => {
    try {
      const response = await axios.post('http://localhost:8083/api/v1/suppliers/', formData);
      setSuppliers([...suppliers, response.data.data]); // Update suppliers with the newly added supplier
      closeModal();  // Close modal after adding
    } catch (error) {
      console.error('Error adding supplier:', error);
    }
  };

  // Edit Supplier
  const editSupplier = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
      totalDebt: supplier.totalDebt,
      paidAmount: supplier.paidAmount,
    });
    setShowModal(true);  // Show modal for editing
  };

  const updateSupplier = async () => {
    try {
      const response = await axios.put(`http://localhost:8083/api/v1/suppliers/${editingSupplier._id}`, formData);
      const updatedSupplier = response.data.data;
      const updatedSuppliers = suppliers.map((sup) =>
        sup._id === updatedSupplier._id ? updatedSupplier : sup
      );
      setSuppliers(updatedSuppliers); // Update the list with the edited supplier
      closeModal();  // Close modal after updating
    } catch (error) {
      console.error('Error updating supplier:', error);
    }
  };

  // Delete Supplier
  const deleteSupplier = async (supplierId) => {
    try {
      await axios.delete(`http://localhost:8083/api/v1/suppliers/${supplierId}`);
      setSuppliers(suppliers.filter((sup) => sup._id !== supplierId)); // Update suppliers after deletion
    } catch (error) {
      console.error('Error deleting supplier:', error);
    }
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingSupplier) {
      updateSupplier(); // Update supplier if we are editing
    } else {
      addSupplier(); // Add supplier if we are adding a new one
    }
  };

  // Close the modal
  const closeModal = () => {
    setShowModal(false);
    setEditingSupplier(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      totalDebt: 0,   // Reset to 0
      paidAmount: 0,  // Reset to 0
    });
  };

  return (
    <div>
      <Menu />
      <main className="app-content">
        <div>
          <div className="app-title">
            <ul className="app-breadcrumb breadcrumb side">
              <li className="breadcrumb-item active">
                <a href="#"><b>Quản lý nhà cung cấp</b></a>
              </li>
            </ul>
          </div>

          <div className="row">
            <div className="col-md-12">
              <div className="tile">
                <div className="tile-body">
                  <div className="col-sm-2">
                    <Button
                      variant="primary"
                      onClick={() => setShowModal(true)} // Hiển thị modal khi nhấn vào nút
                    >
                      <i className="fas fa-plus"></i> Thêm nhà cung cấp
                    </Button>
                  </div>

                  {/* Supplier Table */}
                  <table className="table table-hover table-bordered mt-4" id="sampleTable">
                    <thead>
                      <tr>
                        <th width={10}><input type="checkbox" id="all" /></th>
                        <th>Mã nhà cung cấp</th>
                        <th>Tên nhà cung cấp</th>
                        <th>Số điện thoại</th>
                        <th>Email</th>
                        <th>Địa chỉ</th>
                        <th>Dư nợ</th>
                        <th>Số tiền đã thanh toán</th>
                        <th>Chức năng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="9" className="text-center">Đang tải...</td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td colSpan="9" className="text-center text-danger">{error}</td>
                        </tr>
                      ) : (
                        suppliers.map((supplier) => (
                          <tr key={supplier._id}>
                            <td><input type="checkbox" /></td>
                            <td>{supplier._id}</td>
                            <td>{supplier.name}</td>
                            <td>{supplier.phone}</td>
                            <td>{supplier.email}</td>
                            <td>{supplier.address}</td>
                            <td>{supplier.totalDebt}</td>
                            <td>{supplier.paidAmount}</td>
                            <td>
                              <button
                                className="btn btn-primary btn-sm edit"
                                type="button"
                                title="Sửa"
                                onClick={() => editSupplier(supplier)}
                              >
                                <i className="fa fa-edit" /> Sửa
                              </button>
                              <button
                                className="btn btn-danger btn-sm trash"
                                type="button"
                                title="Xóa"
                                onClick={() => deleteSupplier(supplier._id)}
                              >
                                <i className="fas fa-trash-alt" /> Xóa
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  {/* Modal for Add/Edit Supplier */}
                  <Modal show={showModal} onHide={closeModal}>
                    <Modal.Header closeButton>
                      <Modal.Title>{editingSupplier ? 'Cập nhật nhà cung cấp' : 'Thêm nhà cung cấp'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="name">
                          <Form.Label>Tên nhà cung cấp</Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                          />
                        </Form.Group>
                        <Form.Group controlId="phone">
                          <Form.Label>Số điện thoại</Form.Label>
                          <Form.Control
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                          />
                        </Form.Group>
                        <Form.Group controlId="email">
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                          />
                        </Form.Group>
                        <Form.Group controlId="address">
                          <Form.Label>Địa chỉ</Form.Label>
                          <Form.Control
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                          />
                        </Form.Group>
                        {/* Only show totalDebt and paidAmount if we are editing */}
                        {editingSupplier && (
                          <>
                            <Form.Group controlId="totalDebt">
                              <Form.Label>Dư nợ</Form.Label>
                              <Form.Control
                                type="number"
                                name="totalDebt"
                                value={formData.totalDebt}
                                onChange={handleInputChange}
                                required
                              />
                            </Form.Group>
                            <Form.Group controlId="paidAmount">
                              <Form.Label>Số tiền đã thanh toán</Form.Label>
                              <Form.Control
                                type="number"
                                name="paidAmount"
                                value={formData.paidAmount}
                                onChange={handleInputChange}
                                required
                              />
                            </Form.Group>
                          </>
                        )}
                        <Button variant="primary" type="submit">
                          {editingSupplier ? 'Cập nhật' : 'Thêm'}
                        </Button>
                      </Form>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button variant="secondary" onClick={closeModal}>
                        Đóng
                      </Button>
                    </Modal.Footer>
                  </Modal>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Supplier;
