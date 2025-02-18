import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import 'datatables.net-bs4';
import Menu from './menu';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { UserApi } from '../api/userApi';
const CustomerModal = ({ user, roles, onClose, onSave }) => {
  // Local state for user data
  const [localUser, setLocalCustomer] = useState(user);

  useEffect(() => {
    setLocalCustomer(user); // Update local user state when user prop changes
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalCustomer((prevUser) => ({
      ...prevUser,
      [name]: value, // Update state with the correct name and value
    }));
  };


  const handleSave = () => {
    onSave(localUser); // Không cần kiểm tra, vì onSave đã được truyền đúng
  };

  return (
    <div className="modal fade show" style={{ display: 'block' }} >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-body">
            <div className="row">
              <div className="form-group col-md-12">
                <span className="thong-tin-thanh-toan">
                  <h5>Chỉnh sửa thông tin khách hàng</h5>
                </span>
              </div>
            </div>
            <div className="row">
              <div className="form-group col-md-6">
                <label className="control-label">Họ và tên</label>
                <input
                  className="form-control"
                  type="text"
                  name="name" // Add name attribute
                  value={localUser?.name || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group col-md-6">
                <label className="control-label">Số điện thoại</label>
                <input
                  className="form-control"
                  type="tel"
                  name="phone" // Add name attribute
                  value={localUser?.phone || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group col-md-6">
                <label className="control-label">Địa chỉ email</label>
                <input
                  className="form-control"
                  type="email"
                  name="email" // Add name attribute
                  value={localUser?.email || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group col-md-6">
                <label className="control-label">Địa chỉ</label>
                <input
                  className="form-control"
                  type="text"
                  name="address" // Add name attribute
                  value={localUser?.address || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group col-md-6">
                <label className="control-label">Giới tính</label>
                <div>
                  <label>
                    <input
                      type="radio"
                      name="gender"
                      value="Male"
                      checked={localUser?.gender === "Male"}
                      onChange={handleInputChange}
                    />{" "}
                    Nam
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="gender"
                      value="Female"
                      checked={localUser?.gender === "Female"}
                      onChange={handleInputChange}
                    />{" "}
                    Nữ
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="gender"
                      value="Other"
                      checked={localUser?.gender === "Other"}
                      onChange={handleInputChange}
                    />{" "}
                    Khác
                  </label>
                </div>
              </div>

              <div className="form-group col-md-6">
                <label className="control-label">Ngày sinh</label>
                <input
                  className="form-control"
                  type="date"
                  name="birthday"
                  value={localUser?.birthday ? localUser.birthday.split('T')[0] : ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group col-md-6">
                <label className="control-label">Chức vụ</label>
                <select
                  className="form-control"
                  name="roleId" // Add name attribute
                  value={localUser?.roleId || ''}
                  onChange={handleInputChange} // Update local user state
                >
                  <option value="">Chọn chức vụ</option>
                  {roles.map((role) => (
                    <option key={role._id} value={role._id}>{role.name}</option>
                  ))}
                </select>
              </div>

            </div>
            <div style={{ textAlign: 'end', margin: '10px' }}>

              <button className="btn btn-cancel" onClick={onClose} style={{ marginRight: '5px' }}>Hủy bỏ</button>
              <button className="btn btn-save" onClick={handleSave}>Lưu lại</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Customer() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]); // State for roles
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const confirmDelete = (message) => {
    return new Promise((resolve) => {
      toast(
        ({ closeToast }) => (
          <div>
            <p>{message}</p>
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
  };


  const handleDeleteUser = async (user) => {
    const confirmed = await confirmDelete(
      <span>
        Bạn có chắc chắn muốn xóa khách hàng <b>{user.name}</b>?
      </span>
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      const response = await UserApi.deleteUser(user._id);
      if (response.status === 200) {
        setUsers((prevUsers) => prevUsers.filter((u) => u._id !== user._id));
        toast.success('Xóa khách hàng thành công!');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Lỗi khi xóa khách hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };
  const filteredUsers = users.filter(
    (user) =>
      (user._id && user._id.toString().includes(searchQuery)) ||
      (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const handleToggleLock = async (user) => {
    const newStatus = !user.isLock;
    const confirmMessage = newStatus
      ? `Bạn có chắc chắn muốn khóa tài khoản ${user.name}?`
      : `Bạn có chắc chắn muốn mở khóa tài khoản ${user.name}?`;

    const confirmed = await confirmDelete(confirmMessage);
    if (!confirmed) return;

    try {
      const response = await UserApi.updateUser(user._id,{ isLock: newStatus,
      });
      if (response.status === 200) {
        setUsers((prevUsers) =>
          prevUsers.map((u) => (u._id === user._id ? { ...u, isLock: newStatus } : u))
        );
        toast.success(
          newStatus ? 'Khóa tài khoản thành công.' : 'Mở khóa tài khoản thành công.'
        );
      }
    } catch (error) {
      console.error('Error toggling lock status:', error);
      toast.error('Lỗi khi thay đổi trạng thái tài khoản. Vui lòng thử lại.');
    }
  };
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await UserApi.getUsers();;
        if (Array.isArray(response.data.data)) {
          setUsers(response.data.data);
        } else {
          console.error('Expected array, but got:', response.data.data);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Không thể tải danh sách khách hàng. Vui lòng thử lại sau.');
      }
    };
    const fetchRoles = async () => { // Fetch roles from API
      try {
        const response = await UserApi.getRoles();
        if (Array.isArray(response.data.data)) {
          setRoles(response.data.data);
        } else {
          console.error('Expected array, but got:', response.data.data);
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
        toast.error('Không thể tải danh sách chức vụ. Vui lòng thử lại sau.');
      }
    };

    fetchUsers();
    fetchRoles(); // Call fetchRoles when component mounts
    // updateTime();
  }, []);

  // const updateTime = () => {
  //   const today = new Date();
  //   const weekday = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  //   const day = weekday[today.getDay()];
  //   const formattedDate = `${day}, ${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
  //   const formattedTime = today.toLocaleTimeString('vi-VN');

  //   document.getElementById('clock').innerHTML = `<span class="date">${formattedDate} - ${formattedTime}</span>`;
  //   setTimeout(updateTime, 1000);
  // };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedUser(null);
  };
  const handleCreateUser = async (newUser) => {
    setLoading(true);
    setError(null);
    try {
      const response = await UserApi.createUser({
        name: newUser.name,
        phone: newUser.phone,
        email: newUser.email,
        address: newUser.address,
        gender: newUser.gender,
        birthday: new Date(newUser.birthday).toISOString(),
        roleId: newUser.roleId,
      });

      if (response.status === 201) {
        setUsers((prevUsers) => [...prevUsers, response.data]); // Cập nhật danh sách
        toast.success("Thêm khách hàng thành công!");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Lỗi khi thêm khách hàng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
      handleModalClose();
    }
  };

  const handleSaveChanges = async (updatedUser) => {
    setLoading(true);
    setError(null);
    try {
      const formattedBirthday = new Date(updatedUser.birthday).toISOString().split('T')[0];
      const response = await UserApi.updateUser(updatedUser._id, {
        name: updatedUser.name,
        phone: updatedUser.phone,
        email: updatedUser.email,
        address: updatedUser.address,
        gender: updatedUser.gender,
        birthday: formattedBirthday,
        roleId: updatedUser.roleId,

      });
      if (response.status === 200) {
        // Update local state with the new user data
        setUsers(users.map(user => (user._id === updatedUser._id ? response.data : user)));
        toast.success('Lưu thay đổi thành công!');
      }
    } catch (error) {
      console.error("Error saving changes:", error);
      setError("Failed to save changes. Please try again.");
      toast.error('Lỗi khi lưu thay đổi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      handleModalClose();
    }
  };
  const handleAddUser = () => {
    if (roles.length === 0) {
      toast.error("Chưa có danh sách vai trò, vui lòng thử lại!");
      return;
    }

    const newUser = {
      name: "",
      phone: "",
      email: "",
      address: "",
      gender: "Male",
      birthday: "",
      roleId: roles[0]._id, // Chắc chắn có roleId hợp lệ
    };
    setSelectedUser(newUser);
    setModalVisible(true);
  };


  return (
    <div>
      <main className="app-content">
        <div className="app-title">
          <ul className="app-breadcrumb breadcrumb side">
            <li className="breadcrumb-item active"><a href="#"><b>Danh sách Khách hàng</b></a></li>
          </ul>
          <div id="clock" />
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className="tile">
              <div className="tile-body">
                <div className="row element-button">
                  <div className="col-sm-2">
                  <button className="btn btn-add btn-sm" onClick={handleAddUser}>
  <i className="fas fa-plus" /> Tạo mới Khách hàng
</button>

                  </div>
                  <div className="col-sm-2">
                    <div className="search-bar">
                      <input
                        type="text"
                        placeholder="Tìm kiếm mã nhân viên hoặc tên nhân viên"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <table className="table table-hover table-bordered" id="sampleTable">
                  <thead>
                    <tr>
                      <th width={10}><input type="checkbox" id="all" /></th>
                      <th width={100}>ID nhân viên</th>
                      <th width={150}>Họ và tên</th>
                      <th width={100}>Ảnh thẻ</th>
                      <th width={150}>Địa chỉ</th>
                      <th>Ngày sinh</th>
                      <th>Giới tính</th>
                      <th>SĐT</th>
                      <th></th>
                      <th width={100}>Tính năng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers
                      .filter((user) => user.roleId?.name === 'user')
                      .map((user) => (

                        <tr key={user._id}>
                          <td width={10}><input type="checkbox" name="check1" value={user._id} /></td>
                          <td>{user._id}</td>
                          <td>{user.name}</td>
                          <td><img className="img-card-person" src={user.avatar} alt="Avatar" /></td>
                          <td>{user.address}</td>
                          <td>{new Date(user.birthday).toLocaleDateString('vi-VN')}</td>
                          <td>  {user.gender === "Male" ? "Nam" : user.gender === "Female" ? "Nữ" : "Khác"}</td>
                          <td>{user.phone}</td>
                          <td>{user.roleId?.name}</td> {/* Display role name */}
                          <td className="table-td-center">
                            <button
                              className="btn btn-primary btn-sm trash"
                              title="Xóa"
                              onClick={() => handleDeleteUser(user)}
                            >
                              <i className="fas fa-trash-alt" />
                            </button>
                            <button
                              className="btn btn-primary btn-sm edit"
                              title="Sửa"
                              onClick={() => handleEditUser(user)}
                            >
                              <i className="fas fa-edit" />
                            </button>
                            <button
                              className={`btn btn-${user.isLock ? 'success' : 'danger'} btn-sm`}
                              onClick={() => handleToggleLock(user)}
                            >
                              {user.isLock ? 'Mở khóa' : 'Khóa'}
                            </button>

                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal for editing user */}
      {modalVisible && (
        <CustomerModal
        user={selectedUser}
        roles={roles}
        onClose={handleModalClose}
        onSave={selectedUser._id ? handleSaveChanges : handleCreateUser} // Tạo mới hoặc cập nhật
      />

      )}
    </div>
  );
}
