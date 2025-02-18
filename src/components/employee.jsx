import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Menu from './menu';
const UserModal = ({ show, user, roles, onClose, onSave, isEditing }) => {
  const [localUser, setLocalUser] = useState(
    user || { name: '', phone: '', email: '', address: '', gender: '', birthday: '', roleId: '', password: '' }
  );

  useEffect(() => {
    if (!isEditing) {
      setLocalUser({ name: '', phone: '', email: '', address: '', gender: '', birthday: '', roleId: '', password: '' });
    } else {
      setLocalUser(user);
    }
  }, [user, isEditing]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setLocalUser((prevUser) => ({
      ...prevUser,
      [name]: name === "roleId"
        ? roles.find((role) => role._id === value) || ""  // Lưu cả object roleId
        : value,
    }));
  };

  const handleSave = () => {
    const genderMap = {
      'Nam': 'Male',
      'Nữ': 'Female',
      'Khác': 'Other',
    };

    const updatedUser = {
      ...localUser,
      roleId: localUser.roleId, // Luôn cập nhật roleId mới nhất
      gender: genderMap[localUser.gender] || localUser.gender,
    };

    onSave(updatedUser);
  };


  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEditing ? 'Chỉnh sửa thông tin nhân viên' : 'Thêm nhân viên mới'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Họ và tên</Form.Label>
                <Form.Control type="text" name="name" value={localUser?.name || ''} onChange={handleInputChange} required />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Số điện thoại</Form.Label>
                <Form.Control type="tel" name="phone" value={localUser?.phone || ''} onChange={handleInputChange} required />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Địa chỉ email</Form.Label>
                <Form.Control type="email" name="email" value={localUser?.email || ''} onChange={handleInputChange} required />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Địa chỉ</Form.Label>
                <Form.Control type="text" name="address" value={localUser?.address || ''} onChange={handleInputChange} required />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Giới tính</Form.Label>
                <div>
                  <Form.Check
                    inline
                    type="radio"
                    label="Nam"
                    name="gender"
                    value="Nam"
                    checked={localUser?.gender === 'Nam' || localUser?.gender === 'Male'}
                    onChange={handleInputChange}
                  />
                  <Form.Check
                    inline
                    type="radio"
                    label="Nữ"
                    name="gender"
                    value="Nữ"
                    checked={localUser?.gender === 'Nữ' || localUser?.gender === 'Female'}
                    onChange={handleInputChange}
                  />
                  <Form.Check
                    inline
                    type="radio"
                    label="Khác"
                    name="gender"
                    value="Khác"
                    checked={localUser?.gender === 'Khác' || localUser?.gender === 'Other'}
                    onChange={handleInputChange}
                  />
                </div>
              </Form.Group>

            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Ngày sinh</Form.Label>
                <Form.Control type="date" name="birthday" value={localUser?.birthday ? localUser.birthday.split('T')[0] : ''} onChange={handleInputChange} required />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group>
            <Form.Label>Vai trò</Form.Label>
            <Form.Control
              as="select"
              name="roleId"
              value={localUser?.roleId?._id || ''}  // Lấy ID của vai trò
              onChange={handleInputChange}
              required
            >
              <option value="">Chọn vai trò</option>
              {roles.map((role) => (
                <option key={role._id} value={role._id}>
                  {role.name}  {/* Hiển thị tiếng Việt */}
                </option>
              ))}
            </Form.Control>
          </Form.Group>




          {/* Password Field */}
          {!isEditing && (
            <Form.Group>
              <Form.Label>Mật khẩu</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={localUser?.password || ''}
                onChange={handleInputChange}
                required={!isEditing}
                placeholder="Nhập mật khẩu"
              />
            </Form.Group>
          )}

        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Hủy bỏ</Button>
        <Button variant="primary" onClick={handleSave}>{isEditing ? 'Lưu lại' : 'Thêm nhân viên'}</Button>
      </Modal.Footer>
    </Modal>
  );
};


export default function Employee() {
  const [users, setUsers] = useState([]);  // Default to an empty array
  const [searchQuery, setSearchQuery] = useState('');  // Default to an empty string

  const [roles, setRoles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [addModalVisible, setAddModalVisible] = useState(false);
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
  useEffect(() => {
    // Fetching users
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8083/api/v1/users?role=admin');
        if (Array.isArray(response.data.data)) {
          setUsers(response.data.data);
        } else {
          console.error('Expected array, but got:', response.data.data);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to fetch users, please try again later.');
      }
    };

    // Fetching roles
    const fetchRoles = async () => {
      try {
        const response = await axios.get('http://localhost:8083/api/v1/role');
        if (Array.isArray(response.data.data)) {
          setRoles(response.data.data);
        } else {
          console.error('Expected array, but got:', response.data.data);
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
        toast.error('Failed to fetch roles, please try again later.');
      }
    };

    // Calling the functions to fetch users and roles
    fetchUsers();
    fetchRoles();

    // Update tim
  }, []);

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedUser(null);
  };

  const handleSaveChanges = async (updatedUser) => {
    setLoading(true);
    setError(null);
    try {
      const formattedBirthday = new Date(updatedUser.birthday).toISOString().split('T')[0];

      let response;
      if (updatedUser._id) {
        // Cập nhật user
        response = await axios.put(`http://localhost:8083/api/v1/users/${updatedUser._id}`, {
          ...updatedUser,
          roleId: updatedUser.roleId,  // Đảm bảo gửi roleId thay vì role name
          birthday: formattedBirthday,
        });
        console.log(updatedUser)
      } else {
        // Thêm user mới
        response = await axios.post('http://localhost:8083/api/v1/users', {
          ...updatedUser,
          roleId: updatedUser.roleId,  // Đảm bảo gửi roleId
          birthday: formattedBirthday,
        });
      }

      if (response.status === 200 || response.status === 201) {
        toast.success(updatedUser._id ? 'Cập nhật thành công!' : 'Thêm nhân viên thành công!');
        setUsers((prevUsers) =>
          updatedUser._id
            ? prevUsers.map((user) => (user._id === updatedUser._id ? response.data : user))
            : [...prevUsers, response.data]
        );
      }
    } catch (error) {
      console.error('Lỗi khi lưu dữ liệu:', error);
      toast.error('Có lỗi xảy ra khi lưu dữ liệu!');
    } finally {
      setLoading(false);
      handleModalClose();
    }
  };
  const handleDeleteUser = async (user) => {
    const confirmed = await confirmDelete(
      <span>
        Bạn có chắc chắn muốn xóa Nhân viên <b>{user.name}</b>?
      </span>
    );

    if (!confirmed) return;
    const token = sessionStorage.getItem("adtoken");
    try {
      setLoading(true);
      const response = await axios.delete(`http://localhost:8083/api/v1/users/${user._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.status === 200) {
        setUsers((prevUsers) => prevUsers.filter((u) => u._id !== user._id));
        toast.success('Xóa nhân viên thành công!');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Lỗi khi xóa nhân viên. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };
  const handleToggleLock = async (user) => {
    const newStatus = !user.isLock;
    const confirmMessage = newStatus
      ? `Bạn có chắc chắn muốn khóa tài khoản ${user.name}?`
      : `Bạn có chắc chắn muốn mở khóa tài khoản ${user.name}?`;
      const token = sessionStorage.getItem("adtoken");
    const confirmed = await confirmDelete(confirmMessage);
    if (!confirmed) return;

    try {
      const response = await axios.put(`http://localhost:8083/api/v1/users/${user._id}`, {
        isLock: newStatus,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
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

  const filteredUsers = users.filter(
    (user) =>
      (user._id && user._id.toString().includes(searchQuery)) ||
      (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddUser = async (newUser) => {
    try {
      const response = await axios.post('http://localhost:8083/api/v1/users', newUser);
      if (response.status === 201) {
        setUsers([...users, response.data]);

        toast.success('Thêm nhân viên thành công!');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error('Thêm nhân viên thất bại. Vui lòng thử lại.');

    } finally {
      setAddModalVisible(false);
    }
  };
  return (
    <div>
      <main className="app-content">
        <div className="app-title">
          <ul className="app-breadcrumb breadcrumb side">
            <li className="breadcrumb-item active">
              <a href="#">
                <b>Danh sách nhân viên</b>
              </a>
            </li>
          </ul>
          <div id="clock" />
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className="tile">
              <div className="tile-body">
                <div className="row element-button">
                  <div className="col-sm-2">
                    <button
                      className="btn btn-add btn-sm"
                      onClick={() => setAddModalVisible(true)}
                    >
                      <i className="fas fa-plus" /> Tạo mới nhân viên
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
                      <th width={10}>
                        <input type="checkbox" id="all" />
                      </th>
                      <th>ID nhân viên</th>
                      <th width={150}>Họ và tên</th>
                      <th width={20}>Ảnh thẻ</th>
                      <th width={300}>Email</th>
                      <th>Ngày sinh</th>
                      <th>Giới tính</th>
                      <th>SĐT</th>
                      <th>Chức vụ</th>
                      <th width={100}>Tính năng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user._id}>
                        <td width={10}>
                          <input type="checkbox" name="check1" value={user._id} />
                        </td>
                        <td>{user._id}</td>
                        <td>{user.name}</td>
                        <td>
                          <img className="img-card-person" src={user.avatar} alt="Avatar" />
                        </td>
                        <td>{user.email}</td>
                        <td>{new Date(user.birthday).toLocaleDateString('vi-VN')}</td>
                        <td>
                          {user.gender === "Male" ? "Nam" : user.gender === "Female" ? "Nữ" : "Khác"}
                        </td>

                        <td>{user.phone}</td>

                        <td>
                          {user.roleId?.name === "admin" ? "Admin" : user.roleId?.name === "employee" ? "nhân viên" : user.roleId?.name === "warehouse" ? "Nhân viên kho" : ""}
                        </td>

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
                            {user.isLock ? <i className="fas fa-unlock" /> : <i className="fas fa-lock" />}
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
      {modalVisible && (
        <UserModal
          show={modalVisible}
          user={selectedUser}
          roles={roles}
          onClose={handleModalClose}
          onSave={handleSaveChanges}
          isEditing={!!selectedUser}  // This will be true if there's a selected user (editing)
        />
      )}

      {addModalVisible && (
        <UserModal
          show={addModalVisible}
          user={{}}  // Empty user object for creating a new user
          roles={roles}
          onClose={() => setAddModalVisible(false)}
          onSave={handleAddUser}  // Use handleAddUser for adding a new employee
          isEditing={false}  // Set to false for creating a new user
        />
      )}


    </div>
  );
}
