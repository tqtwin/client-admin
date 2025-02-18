import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loginMessage, setLoginMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Lấy thông báo từ localStorage nếu có và hiển thị, sau đó xóa
        const message = sessionStorage.getItem('loginMessage');
        if (message) {
            setLoginMessage(message);
            sessionStorage.removeItem('loginMessage');
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(''); // Reset error trước khi thử đăng nhập
        try {
            const response = await axios.post('http://localhost:8083/api/v1/users/login', { email, password });
            if (response.data.success) {
                if (response.data.role === "admin" || response.data.role === "personnel" || response.data.role === "warehouse" || response.data.role === "employee") {
                    setError('');
                    setLoginMessage('');
                    // Lưu token và thông tin người dùng vào localStorage
                    sessionStorage.setItem('adtoken', response.data.token);
                    sessionStorage.setItem('admin', JSON.stringify(response.data.user));
                    toast.success('Đăng nhập thành công!')
                    // Điều hướng tới trang admin
                    navigate('/admin/dashboard');
                }
                else {
                    setError(response.data.message || 'Vui lòng Đăng nhập với vai trò admin');
                    toast.error('Vui lòng Đăng nhập với vai trò admin!')
                }
            } else {
                // Đăng nhập không thành công, hiển thị thông báo lỗi từ server
                setError(response.data.message);
                toast.error(response.data.message)
            }
        } catch (err) {
            if (err.response) {
                setError(err.response.data.message || 'Login failed');
                toast.error(err.response.data.message)

            } else {
                setError('Login failed'); // Xử lý lỗi khác

            }
        }
    };

    return (
        <div>
            <link rel="stylesheet" type="text/css" href="/vendor/bootstrap/css/bootstrap.min.css" />
            <link rel="stylesheet" type="text/css" href="/fonts/font-awesome-4.7.0/css/font-awesome.min.css" />
            <link rel="stylesheet" type="text/css" href="/vendor/animate/animate.css" />
            <link rel="stylesheet" type="text/css" href="/vendor/css-hamburgers/hamburgers.min.css" />
            <link rel="stylesheet" type="text/css" href="/vendor/select2/select2.min.css" />
            {/* <link rel="stylesheet" type="text/css" href="/css/util.css" /> */}
            <link rel="stylesheet" type="text/css" href="/css/main.css" />
            <link href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" />
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-sweetalert/1.0.1/sweetalert.min.css" />
            <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.2/css/all.css" />
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jquery-confirm/3.3.2/jquery-confirm.min.css" />
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/boxicons@latest/css/boxicons.min.css" />
            <link rel="stylesheet" href="https://unpkg.com/boxicons@latest/css/boxicons.min.css" />
            <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />

            <div className="limiter">
                <div className="container-login100">
                    <div className="wrap-login100">
                        <div className="login100-pic js-tilt" data-tilt>
                            <img src="/images/team.jpg" alt="IMG" />
                        </div>
                        <form className="login100-form validate-form" onSubmit={handleLogin}>
                            <span className="login100-form-title">
                                <b>ĐĂNG NHẬP HỆ THỐNG</b>
                            </span>

                            {/* Hiển thị thông báo lỗi hoặc tin nhắn đăng nhập */}
                            <div className="wrap-input100 validate-input">
                                <input
                                    className="input100"
                                    type="text"
                                    placeholder="Tài khoản quản trị"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <span className="focus-input100"></span>
                                <span className="symbol-input100">
                                    <i className='bx bx-user'></i>
                                </span>
                            </div>
                            <div className="wrap-input100 validate-input">
                                <input
                                    className="input100"
                                    type="password"
                                    placeholder="Mật khẩu"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="off"
                                />
                                <span className="focus-input100"></span>
                                <span className="symbol-input100">
                                    <i className='bx bx-key'></i>
                                </span>
                            </div>
                            <div className="container-login100-form-btn">
                                <button type="submit" className="login100-form-btn">Đăng nhập</button>
                            </div>
                            <div className="text-right p-t-12">
                                <a className="txt2" href=""></a>
                            </div>
                            <div className="text-center p-t-70 txt2">
                                Phần mềm quản lý bán hàng <i className="far fa-copyright" aria-hidden="true"></i>

                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
