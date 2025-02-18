import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../pages/reviews.css'; // CSS dùng chung với Category
import Menu from './menu';
import { toast } from 'react-toastify';

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);
  const admin = JSON.parse(sessionStorage.getItem('admin'));
  const fetchReviews = async () => {
    try {
      const response = await axios.get('http://localhost:8083/api/v1/reviews/');
      setReviews(response.data.data);
    } catch (error) {
      setError('Failed to fetch reviews.');
    } finally {
      setLoading(false);
    }
  };
  const toggleLockReview = async (reviewId, currentState) => {
    try {
      const newLockState = !currentState; // Đảo ngược trạng thái hiện tại
      await axios.patch(`http://localhost:8083/api/v1/reviews/${reviewId}/lock`, { isLocked: newLockState });
      setReviews(reviews.map((review) =>
        review._id === reviewId ? { ...review, isLocked: newLockState } : review
      ));
    } catch (error) {
      console.error('Error toggling review lock state:', error);
    }
  };

  // const lockReview = async (reviewId) => {
  //   try {
  //     await axios.patch(`http://localhost:8083/api/v1/reviews/${reviewId}/lock`, { isLocked: true });
  //     setReviews(reviews.map((review) => (review._id === reviewId ? { ...review, isLocked: true } : review)));
  //   } catch (error) {
  //     console.error('Error locking review:', error);
  //   }
  // };

  const openReplyModal = (review) => {
    setSelectedReview(review);
    setReplyText('');
    setModalVisible(true);
  };

  const handleReplySubmit = async () => {
    if (replyText.trim()) {
      try {
        await axios.post(`http://localhost:8083/api/v1/reviews/${selectedReview._id}/reply`, {
          userId: admin.id,  // Thay YOUR_ADMIN_USER_ID bằng ID người dùng đang đăng nhập
          text: replyText
        });
        toast.success('Phản hồi thành công!');
        setModalVisible(false);
        fetchReviews(); // Cập nhật lại danh sách bình luận
      } catch (error) {
        console.error('Error replying to review:', error);
      }
    }
  };


  return (
    <div>
      <Menu />
      <main className="app-content">
        <div className="app-title">
          <ul className="app-breadcrumb breadcrumb side">
            <li className="breadcrumb-item active">
              <a href="#"><b>Quản lý Bình luận</b></a>
            </li>
          </ul>
          <div id="clock" />
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="tile">
              <div className="tile-body">
                <h3 className="tile-title">Danh sách Bình luận</h3>
                {loading ? (
                  <p>Đang tải bình luận...</p>
                ) : error ? (
                  <p className="text-danger">{error}</p>
                ) : (
                  <table className="table table-hover table-bordered" id="sampleTable">
                    <thead>
                      <tr>
                        <th>Mã sản phẩm</th>
                        <th>Người dùng</th>
                        <th>Nội dung</th>
                        <th>Thời gian</th>
                        <th>Trạng thái</th>
                        <th>Chức năng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.length > 0 ? (
                        reviews.map((review) => (
                          <tr key={review._id}>
                            <td>{review.productId?._id}</td>
                            <td>{review.userId?.name || 'Người dùng ẩn danh'}</td>
                            <td>
                              {review.content}
                              <br />
                              {review.imageUrls[0].map((img, index) => (
                                <img key={index} src={img} alt="Review" style={{ width: '100px' }} />
                              ))}

                              <div style={{ marginTop: '10px', paddingLeft: '10px', borderLeft: '2px solid #ddd' }}>
                                <strong>Phản hồi:</strong>
                                {review.repCmt.length > 0 ? (
                                  review.repCmt.map((reply) => (
                                    <div key={reply._id}>
                                      <span>{reply.userId?.name || 'Quản trị viên'}: </span>
                                      <span>{reply.text}</span>
                                      <br />
                                      <small>{new Date(reply.created_at).toLocaleString('vi-VN')}</small>
                                    </div>
                                  ))
                                ) : (
                                  <p>Chưa có phản hồi.</p>
                                )}
                              </div>
                            </td>
                            <td>{new Date(review.created_at).toLocaleString()}</td>
                            <td>
                              {review.isLocked ? (
                                <span className="badge badge-danger">Đã khóa</span>
                              ) : (
                                <span className="badge badge-success">Hiển thị</span>
                              )}
                            </td>
                            <td>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => openReplyModal(review)}
                              >
                                <i className="fas fa-reply" /> {review.repCmt.length > 0 ? 'Cập nhật' : 'Phản hồi'}
                              </button>
                              <button
                                className={`btn btn-sm ${review.isLocked ? 'btn-success' : 'btn-danger'}`}
                                style={{ marginLeft: '5px' }}
                                onClick={() => toggleLockReview(review._id, review.isLocked)}
                              >
                                <i className={`fas ${review.isLocked ? 'fa-unlock' : 'fa-lock'}`} />{' '}
                                {review.isLocked ? 'Mở khóa' : 'Khóa'}
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center">Không có bình luận nào.</td>
                        </tr>
                      )}
                    </tbody>

                  </table>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reply Modal */}
        {modalVisible && (
          <div className="modal" style={{ display: 'block' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Phản hồi Bình luận</h5>
                  <button type="button" className="close" onClick={() => setModalVisible(false)}>
                    <span>&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <textarea
                    className="form-control"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Nhập nội dung phản hồi..."
                    rows={5}
                  />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setModalVisible(false)}>
                    Hủy
                  </button>
                  <button type="button" className="btn btn-primary" onClick={handleReplySubmit}>
                    Gửi Phản hồi
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Reviews;
