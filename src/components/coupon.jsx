import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../api/couponApi';

export default function CouponManagement() {
  const [coupons, setCoupons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [couponToEdit, setCouponToEdit] = useState(null);

  // Fetch coupon data
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await getCoupons();
        setCoupons(response.data.data);
      } catch (error) {
        toast.error('Lỗi khi tải dữ liệu coupon.');
      }
    };

    fetchCoupons();
  }, []);

  const handleEditClick = (coupon) => {
    setCouponToEdit(coupon);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCouponToEdit(null);
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData(e.target);
      const startDate = new Date(formData.get('start_date'));
      const endDate = new Date(formData.get('end_date'));

      // Kiểm tra nếu ngày bắt đầu lớn hơn ngày kết thúc
      if (startDate > endDate) {
        toast.error('Ngày bắt đầu không được sau ngày kết thúc.');
        return;
      }

      const couponData = {
        code: formData.get('code'),
        discountPct: parseFloat(formData.get('discountPct')) || 0,
        description: formData.get('description'),
        min_price: parseFloat(formData.get('min_price')) || 0,
        max_discount: parseFloat(formData.get('max_discount')) || 0,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: reverseStatusMapping[formData.get('status')],
      };

      if (couponToEdit) {
        await updateCoupon(couponToEdit._id, couponData);
        setCoupons((prev) =>
          prev.map((c) => (c._id === couponToEdit._id ? { ...c, ...couponData } : c))
        );
        toast.success('Cập nhật mã giảm giá thành công.');
      } else {
        const response = await createCoupon(couponData);
        setCoupons((prev) => [...prev, response.data]);
        toast.success('Thêm mã giảm giá mới thành công.');
      }

      handleCloseModal();
    } catch (error) {
      toast.error('Lỗi khi lưu coupon.');
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = (id) => {
      return new Promise((resolve, reject) => {
        toast(
          ({ closeToast }) => (
            <div>
              <p>Bạn có chắc chắn muốn xóa coupon này?</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    resolve(true);
                    closeToast();
                  }}
                >
                  Đồng ý
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    resolve(false);
                    closeToast();
                  }}
                >
                  Hủy
                </button>
              </div>
            </div>
          ),
          { autoClose: false, closeOnClick: false }
        );
      });
    };  const confirmed = await confirmDelete(id);
    if (!confirmed) return;

    try {
      await deleteCoupon(id);
      setCoupons((prev) => prev.filter((c) => c._id !== id));
      toast.success('Xóa coupon thành công.');
    } catch (error) {
      toast.error('Lỗi khi xóa coupon.');
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const coupon = coupons.find((c) => c._id === id);
      const currentDate = new Date();
      const endDate = new Date(coupon.end_date);

      // Kiểm tra nếu ngày kết thúc đã qua
      if (currentDate > endDate && currentStatus === 'Inactive') {
        toast.error(
          'Vui lòng cập nhật ngày bắt đầu và ngày kết thúc trước khi kích hoạt coupon.'
        );
        return;
      }

      const updatedStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
      await updateCoupon(id, { status: updatedStatus });

      setCoupons((prev) =>
        prev.map((coupon) =>
          coupon._id === id ? { ...coupon, status: updatedStatus } : coupon
        )
      );
      if(currentStatus === 'Active'){
        toast.success(`Kích hoạt mã giảm giá thành công.`);
      }
      else{
        toast.success(`Khóa mã giảm giá thành công.`);
      }

    } catch (error) {
      toast.error('Lỗi khi thay đổi trạng thái coupon.');
    }
  };

  const statusMapping = {
    Active: 'Hoạt động',
    Inactive: 'Không hoạt động',
  };

  const reverseStatusMapping = {
    'Hoạt động': 'Active',
    'Không hoạt động': 'Inactive',
  };

  return (
    <div>
      <main className="app-content">
        <div className="app-title">
          <h1>Quản lý Coupon</h1>
        </div>
        <div id='lock'></div>
        <div>
          <button className="btn btn-add btn-sm" onClick={() => setShowModal(true)}>
            <i className="fas fa-plus"></i> Thêm Coupon
          </button>
        </div>

        <table className="table table-hover table-bordered mt-3">
          <thead>
            <tr>
              <th>Mã</th>
              <th>Chiết khấu (%)</th>
              <th>Giá tối thiểu</th>
              <th>Giảm tối đa</th>
              <th>Ngày bắt đầu</th>
              <th>Ngày hết hạn</th>
              <th>Trạng thái</th>
              <th>Chức năng</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon._id}>
                <td>{coupon.code}</td>
                <td>{coupon.discountPct}%</td>
                <td>
                  {coupon.min_price != null
                    ? coupon.min_price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
                    : 'N/A'}
                </td>
                <td>
                  {coupon.max_discount != null
                    ? coupon.max_discount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
                    : 'N/A'}
                </td>
                <td>{new Date(coupon.start_date).toLocaleString('vi-VN')}</td>
                <td>{new Date(coupon.end_date).toLocaleString('vi-VN')}</td>
                <td>
                  <span
                    className={`badge ${
                      coupon.status === 'Active' ? 'bg-success' : 'bg-danger'
                    }`}
                  >
                    {statusMapping[coupon.status]}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => toggleStatus(coupon._id, coupon.status)}
                    style={{ width: '120px' }}
                  >
                    {coupon.status === 'Active' ? 'Ngừng hoạt động' : 'Kích hoạt'}
                  </button>

                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleEditClick(coupon)}
                    style={{ marginLeft: '5px' }}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(coupon._id)}
                    style={{ marginLeft: '5px' }}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      {/* Modal for Adding/Editing Coupons */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{couponToEdit ? 'Chỉnh sửa Coupon' : 'Thêm Coupon'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveCoupon}>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Mã</Form.Label>
              <Form.Control
                name="code"
                defaultValue={couponToEdit?.code || ''}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Chiết khấu (%)</Form.Label>
              <Form.Control
                name="discountPct"
                type="number"
                step="0.01"
                defaultValue={couponToEdit?.discountPct || ''}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Giá tối thiểu</Form.Label>
              <Form.Control
                name="min_price"
                type="number"
                step="0.01"
                defaultValue={couponToEdit?.min_price || ''}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Giảm tối đa</Form.Label>
              <Form.Control
                name="max_discount"
                type="number"
                step="0.01"
                defaultValue={couponToEdit?.max_discount || ''}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Ngày bắt đầu</Form.Label>
              <Form.Control
                name="start_date"
                type="date"
                defaultValue={
                  couponToEdit
                    ? new Date(couponToEdit.start_date).toISOString().split('T')[0]
                    : ''
                }
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Ngày hết hạn</Form.Label>
              <Form.Control
                name="end_date"
                type="date"
                defaultValue={
                  couponToEdit
                    ? new Date(couponToEdit.end_date).toISOString().split('T')[0]
                    : ''
                }
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Trạng thái</Form.Label>
              <Form.Control
                as="select"
                name="status"
                defaultValue={statusMapping[couponToEdit?.status || 'Active']}
              >
                <option value="Hoạt động">Hoạt động</option>
                <option value="Không hoạt động">Không hoạt động</option>
              </Form.Control>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Hủy
            </Button>
            <Button type="submit" variant="primary">
              Lưu
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
