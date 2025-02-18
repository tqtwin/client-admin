import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Col } from 'react-bootstrap';
import { Select } from 'antd';
import '../pages/product.css'// For multiple category selection
import { useRef } from 'react';
import { useLocation } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { Option } = Select;

export default function Product() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // Categories for selection
  const [suppliers, setSuppliers] = useState([]); // Suppliers for selection
  const [showEditModal, setShowEditModal] = useState(false); // Edit Modal visibility
  const [showAddModal, setShowAddModal] = useState(false); // Add Modal visibility
  const [warehouses, setWarehouses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeletedModal, setShowDeletedModal] = useState(false); // Hiển thị modal sản phẩm đã xóa
  const [deletedProducts, setDeletedProducts] = useState([]); // Lưu danh sách sản phẩm đã xóa
  const [searchKeyword, setSearchKeyword] = useState(""); // Từ khóa tìm kiếm
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showStockEntryModal, setShowStockEntryModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]); // Sản phẩm đã chọn
  const [showSaleModal, setShowSaleModal] = useState(false); // Hiển thị modal giảm giá
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    id: '',
    name: '',
    category: [],
    supplier: '',
    minPrice: '',
    maxPrice: '',
    created: '',
    inStock: null, // true: còn hàng, false: hết hàng, null: không lọc
  });
  const [appliedFilters, setAppliedFilters] = useState({});
  const location = useLocation();
  const applySaleToSelectedProducts = async () => {
    try {
      const payload = {
        productIds: selectedProducts,  // Danh sách các sản phẩm đã chọn
        sale: salePercentage,          // Gửi đúng giá trị `salePercentage`
      };

      const response = await axios.put('http://localhost:8083/api/v1/products/update-products-sale', payload);

      if (response.data.success) {
        toast.success('Cập nhật giảm giá thành công!');
        fetchData();  // Làm mới danh sách sản phẩm
        setShowSaleModal(false);
      } else {
        toast.error('Có lỗi xảy ra khi cập nhật giảm giá.');
      }
    } catch (error) {
      console.error('Error applying sale to products:', error);
      toast.error('Không thể áp dụng giảm giá.');
    }
  };

  const limit = 10;
  // Stock entry modal visibility
  const admin = JSON.parse(sessionStorage.getItem('admin'));
  const [stockEntryData, setStockEntryData] = useState({
    warehouseId: '', // Shared warehouse ID
    products: [],
    supplierId: '', // Array of products with their quantity and supplier
    userId: admin.id,
  });
  const filteredProducts = products.filter(

    (product) =>
      product && // Kiểm tra product tồn tại
      product._id &&
      product.name
  );
  const handleDelete = async (id) => {
    try {
      const token = sessionStorage.getItem("adtoken");
      // Gọi API để lấy thông tin chi tiết sản phẩm
      const response = await axios.get(`http://localhost:8083/api/v1/products/${id}`);
      const product = response.data.data;

      // Kiểm tra số lượng trong kho
      if (product.inventory && product.inventory.quantity > 0) {
        toast.error('Không thể xóa sản phẩm vì vẫn còn trong kho!');
        return; // Ngừng thao tác xóa nếu còn hàng
      }

      // Thực hiện xóa nếu số lượng bằng 0
      const deleteResponse = await axios.delete(`http://localhost:8083/api/v1/products/${id}/soft-delete`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (deleteResponse.status === 200 || deleteResponse.status === 201) {
        setProducts((prevProducts) => prevProducts.filter((product) => product._id !== id));
        toast.success('Xóa sản phẩm thành công!');
        fetchData(); // Cập nhật lại danh sách sản phẩm
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Lỗi khi xóa sản phẩm!');
    }
  };


  const searchProducts = async (query) => {
    try {
      const response = await axios.get('http://localhost:8083/api/v1/products', {
        params: { search: query, limit, page: 1 },
      });
      if (Array.isArray(response.data.data)) {
        setProducts(response.data.data);
        setTotal(response.data.total);
        setTotalPages(response.data.totalPages);
        // toast.success('Tìm kiếm sản phẩm thành công!');
      } else {
        setProducts([]);
        // toast.info('Không tìm thấy sản phẩm nào.');
      }
    } catch (error) {
      console.error('Error searching products:', error);
      // toast.error('Lỗi khi tìm kiếm sản phẩm.');
      setProducts([]);
    }
  };
  const [salePercentage, setSalePercentage] = useState(0); // Quản lý phần trăm giảm giá riêng biệt

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [productName, setProductName] = useState("");
  const [productToEdit, setProductToEdit] = useState(null); // Product to edit
  const [newProduct, setNewProduct] = useState({
    name: '',
    image: '',
    images: [],
    quantity: 0,
    price: 0,
    categoryId: [],
    supplierId: '',
    description: '',
  });

  const fetchWarehouses = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8083/api/v1/warehouse');
      if (Array.isArray(response.data.data)) {
        setWarehouses(response.data.data); // Store warehouse data
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    }
  }, []);
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8083/api/v1/categories');
      if (response.data.success && Array.isArray(response.data.data)) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  const fetchSuppliers = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8083/api/v1/suppliers');
      // Log dữ liệu trả về để kiểm tra
      if (Array.isArray(response.data.suppliers)) {
        setSuppliers(response.data.suppliers);

      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  }, []);

  const fetchDeletedProducts = async () => {
    try {
      const response = await axios.get('http://localhost:8083/api/v1/products/isdelete');
      if (Array.isArray(response.data.data)) {
        setDeletedProducts(response.data.data); // Lưu danh sách sản phẩm đã xóa vào state
      } else {
        setDeletedProducts([]); // Nếu không có sản phẩm nào bị xóa
        toast.success('Không có sản phẩm nào bị xóa.');
      }

    } catch (error) {
      console.error('Error fetching deleted products:', error);
      toast.error('Không thể tải danh sách sản phẩm đã xóa.');
    }
  };

  // Gọi hàm khi mở modal sản phẩm đã xóa
  useEffect(() => {
    if (showDeletedModal) {
      fetchDeletedProducts();
    }
  }, [showDeletedModal]);
  const handleSearchById = async (query) => {
    try {
      const response = await axios.get('http://localhost:8083/api/v1/products', {
        params: { id: query },
      });

      const productsData = response.data.data || [];

      if (productsData.length === 0) {
        toast.warn('Không tìm thấy sản phẩm hoặc sản phẩm đã bị xóa.');
      } else {
        setProducts(productsData);
        setTotalPages(response.data.totalPages);
        toast.success('Tìm kiếm theo mã thành công!');
      }
    } catch (error) {
      console.error('Error searching by ID:', error);
      toast.error('Không tìm thấy sản phẩm với mã này.');
    }
  };


  const handleSearchByName = async (query) => {
    try {
      const response = await axios.get('http://localhost:8083/api/v1/products', {
        params: { name: query },
      });

      const productsData = response.data.data || [];

      if (productsData.length === 0) {
        toast.warn('Không tìm thấy sản phẩm hoặc sản phẩm đã bị xóa.');
      } else {
        setProducts(productsData);
        setTotalPages(response.data.totalPages);
        toast.success('Tìm kiếm theo tên thành công!');
      }
    } catch (error) {
      console.error('Error searching by name:', error);
      toast.error('Không tìm thấy sản phẩm với tên này.');
    }
  };


  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };
  // const debouncedSearch = useCallback(debounce(searchProducts, 1000), [
  //   filters,
  // ]);
  // useEffect(() => {
  //   debouncedSearch();
  // }, [filters, debouncedSearch]);
  // const handleSearchChange = (e) => {
  //   const query = e.target.value;
  //   setSearchQuery(query);

  //   if (query.trim()) {
  //     debouncedSearch.current(query); // Gọi hàm debounce
  //   } else {
  //     fetchData(); // Hiển thị dữ liệu toàn bộ nếu không có query
  //   }
  // };

  const fetchFilteredProducts = async (updatedFilters = filters) => {
    try {
      const response = await axios.get("http://localhost:8083/api/v1/products", {
        params: {
          ...updatedFilters,
          page: currentPage,
          limit,
        },
      });

      if (Array.isArray(response.data.data)) {
        setProducts(response.data.data);
        setTotal(response.data.total);
        setTotalPages(response.data.totalPages);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching filtered products:", error);
    }
  };

  // Xử lý URL và tự động áp dụng bộ lọc
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filterKey = params.get("filter");
    const filterValue = params.get("value");

    if (filterKey && filterValue) {
      const parsedValue =
        filterValue === "false" ? false : filterValue === "true" ? true : filterValue;

      const updatedFilters = { ...filters, [filterKey]: parsedValue };
      setFilters(updatedFilters);

      // Gọi API ngay lập tức với bộ lọc mới
      fetchFilteredProducts(updatedFilters);
    }
  }, [location.search]);

  useEffect(() => {
    // Chỉ gọi API nếu không có tham số filter trong URL
    const params = new URLSearchParams(location.search);
    if (!params.get("filter")) {
      fetchFilteredProducts();
    }
  }, [filters, currentPage]); // Theo dõi filters và currentPage


  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:8083/api/v1/products', {
        params: {
          page: currentPage,
          limit,
          total,
          totalPages
        },
      });

      if (Array.isArray(response.data.data)) {
        const total = response.data.total;
        setProducts(response.data.data);
        setTotal(total);
        setTotalPages(response.data.totalPages)
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };
  useEffect(() => {
    fetchCategories();
    fetchSuppliers();
    fetchWarehouses();
    // Fetch products from API

    // fetchData();
  }, [fetchCategories, fetchSuppliers]);

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("adtoken");

    // Tính giá sau khi giảm
    const finalPrice =
      newProduct.originalPrice && newProduct.salePercentage
        ? newProduct.originalPrice * ((100 - newProduct.salePercentage) / 100)
        : newProduct.originalPrice;

    const productPayload = {
      ...newProduct,
      price: finalPrice, // Giá sau khi giảm
      categoryId: newProduct.category,
    };

    try {
      const response = await axios.post("http://localhost:8083/api/v1/products", productPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setProducts([...products, response.data]);
      setShowAddModal(false);
      toast.success('Thêm sản phẩm mới thành công!');
      setNewProduct({
        name: "",
        image: "",
        images: [],
        quantity: 0,
        originalPrice: 0,
        price: 0,
        sale: salePercentage,
        categoryId: [],
        supplierId: "",
        description: "",
      });
    } catch (error) {
      console.error("Error adding product:", error.response?.data || error.message);
      toast.error('Lỗi khi thêm sản phẩm.', error.response?.data || error.message);
    }
  };



  const getCategoryNamesByIds = (categoryIds) => {
    if (!Array.isArray(categoryIds)) return 'Chưa xác định';

    return categoryIds
      .map((categoryId) => {
        const category = categories.find((cat) => cat._id === categoryId);
        return category ? category.name : 'Chưa xác định';
      })
      .join(', ');
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();

    // Tạo payload với dữ liệu mới, giữ lại dữ liệu cũ nếu không thay đổi
    const updatedProduct = {
      ...productToEdit, // Giữ dữ liệu cũ
      name: newProduct.name || productToEdit.name,
      image: newProduct.image || productToEdit.image,
      images: newProduct.images.length ? newProduct.images : productToEdit.images,
      quantity: newProduct.quantity || productToEdit.quantity,
      price: newProduct.price || productToEdit.price,
      categoryId: newProduct.categoryId.length ? newProduct.categoryId : productToEdit.categoryId,
      supplierId: newProduct.supplierId || productToEdit.supplierId,
      description: newProduct.description || productToEdit.description,
    };

    try {
      const token = sessionStorage.getItem("adtoken");
      const response = await axios.put(
        `http://localhost:8083/api/v1/products/${productToEdit._id}`,
        updatedProduct, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });


      // Cập nhật danh sách sản phẩm trong state
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === productToEdit._id ? response.data : product
        )
      );
      setShowEditModal(false); // Đóng modal
    } catch (error) {
      console.error('Error updating product:', error.response?.data || error.message);
    }
  };


  const handleCloseAddModal = () => {
    // resetNewProduct(); // Reset khi đóng modal tạo sản phẩm
    setShowAddModal(false);
  };
  const deleteProduct = () => {
    resetNewProduct();
  }


  const handleCloseEditModal = () => {
    resetNewProduct(); // Reset khi đóng modal chỉnh sửa sản phẩm
    setShowEditModal(false);
  };


  const handleChange = (e) => {
    const { name, value } = e.target;

    setNewProduct((prev) => ({
      ...prev,
      [name]: value.trim(), // Loại bỏ khoảng trắng thừa khi nhập
    }));
  };

  const handlePriceChange = (e, field) => {
    let { value } = e.target;

    if (field === "salePercentage") {
      // Cho phép giá trị rỗng (người dùng đang xóa)
      if (value === "") {
        setNewProduct((prev) => ({
          ...prev,
          [field]: null, // Hoặc giá trị mặc định nếu cần
        }));
        return;
      }

      // Kiểm tra giá trị hợp lệ
      value = Math.min(100, Math.max(0, value));
    }

    setNewProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const restoreProduct = async (id) => {
    try {
      const token = sessionStorage.getItem("adtoken");
      const response = await axios.put(`http://localhost:8083/api/v1/products/${id}/restore`, {
        isDelete: false,
        delete_at: null,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        // Cập nhật danh sách sản phẩm
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product._id === id ? { ...product, isDelete: false, delete_at: null } : product
          )
        );
        toast.success('Khôi phục sản phẩm thành công!');
        fetchData();
      }
    } catch (error) {
      console.error('Error restoring product:', error);
      toast.error('Lỗi khi khôi phục sản phẩm!');
    }
  };


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };
  const handleStockEntryOpen = () => {
    if (selectedProducts.length === 0) {
      setShowStockEntryModal(true);
      return;
    }

    const supplierIds = selectedProducts.map(
      (id) => products.find((p) => p._id === id)?.supplierId
    );

    const uniqueSuppliers = [...new Set(supplierIds)];

    if (uniqueSuppliers.length > 1) {
      toast.warn("Tất cả sản phẩm phải từ cùng một nhà cung cấp!");
      return;
    }

    // Lấy danh sách sản phẩm hợp lệ chưa có trong stockEntryData
    const selectedStockProducts = selectedProducts
      .filter((productId) => {
        return !stockEntryData.products.some((entry) => entry.productId === productId);
      })
      .map((productId) => {
        const product = products.find((p) => p._id === productId);
        return {
          productId: productId,
          productName: product?.name || "Không xác định",
          quantity: 1,
          capitalPrice: 0,
        };
      });

    setStockEntryData((prev) => ({
      ...prev,
      warehouseId: "",
      supplierId: prev.products.length === 0 ? uniqueSuppliers[0] : prev.supplierId, // Giữ supplierId nếu có sản phẩm
      products: [...prev.products, ...selectedStockProducts],
    }));

    setShowStockEntryModal(true);
  };


  const resetNewProduct = () => {
    setNewProduct({
      name: '',
      image: '',
      images: [],
      quantity: 0,
      price: 0,
      categoryId: [],
      supplierId: '',
      description: '',
    });
  };


  const handleStockEntryClose = () => setShowStockEntryModal(false);

  // Handle form changes for stock entry
  const handleStockEntryChange = (e, index) => {
    const { name, value } = e.target;

    // Cập nhật dữ liệu tạm thời khi người dùng nhập
    setStockEntryData((prev) => {
      const updatedProducts = [...prev.products];
      updatedProducts[index] = {
        ...updatedProducts[index],
        [name]: value, // Cho phép giá trị tạm thời là rỗng hoặc không hợp lệ
      };

      return {
        ...prev,
        products: updatedProducts,
      };
    });
  };

  const handleStockEntryBlur = (index, name) => {
    // Khi người dùng rời khỏi trường nhập liệu, kiểm tra giá trị
    setStockEntryData((prev) => {
      const updatedProducts = [...prev.products];
      const value = updatedProducts[index][name];

      updatedProducts[index] = {
        ...updatedProducts[index],
        [name]: value === "" || value <= 0 ? 1 : parseInt(value, 10), // Đặt về 1 nếu rỗng hoặc nhỏ hơn 1
      };

      return {
        ...prev,
        products: updatedProducts,
      };
    });
  };

  // if(selectedProducts){

  // }
  // Submit stock entry (API call to save stock)
  const handleAddStockProduct = () => {
    if (!stockEntryData.warehouseId) {
      toast.warn("Vui lòng chọn kho trước khi thêm sản phẩm!");
      return;
    }

    if (!stockEntryData.supplierId) {
      toast.warn("Vui lòng chọn nhà cung cấp trước khi thêm sản phẩm!");
      return;
    }
    if (stockEntryData.products.length === 0) {
      setStockEntryData((prev) => ({
        ...prev,
        products: [...prev.products, { productId: '', quantity: 0 }],
      }));
      return;
    }
    const newProduct = products.find((p) => !stockEntryData.products.some((sp) => sp.productId === p._id));
    if (newProduct && newProduct.supplierId !== stockEntryData.supplierId) {
      toast.warn("Sản phẩm mới phải cùng nhà cung cấp đã chọn!");
      return;
    }
    setStockEntryData((prev) => ({
      ...prev,
      products: [...prev.products, { productId: '', quantity: 0 }],
    }));
  };


  // Remove a product entry
  const handleRemoveStockProduct = (index) => {
    const updatedProducts = stockEntryData.products.filter((_, i) => i !== index);
    setStockEntryData((prev) => ({
      ...prev,
      products: updatedProducts,
      supplierId: updatedProducts.length === 0 ? "" : prev.supplierId, // Reset supplierId nếu không còn sản phẩm nào
    }));
  };
  const applyFilters = () => {
    setAppliedFilters(filters);
    setShowFilterModal(false);
  };

  useEffect(() => {
    fetchFilteredProducts();
  }, [appliedFilters]);
  // Submit stock entry (API call to save stock)
  const handleStockEntrySubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `http://localhost:8083/api/v1/stockEntry`,
        stockEntryData
      );
      toast.success('Nhập kho thành công!');
      setShowStockEntryModal(false);
      setStockEntryData({
        warehouseId: '',
        products: [],
        supplierId: '',
        userId: admin.id,
      });
      fetchData();
    } catch (error) {
      console.error('Error adding stock entry:', error);
      toast.error('Nhập kho thất bại!');
    }
  };

  // Handle input change for product code
  const handleProductCodeChange = (e, index) => {
    const { value } = e.target;
    const updatedProducts = [...stockEntryData.products];

    // Cập nhật ngay lập tức productId để cho phép chỉnh sửa tiếp
    updatedProducts[index].productId = value;
    updatedProducts[index].isInvalid = false; // Mặc định không bị khóa

    // Nếu xóa mã sản phẩm, mở khóa nhập liệu
    if (!value) {
      updatedProducts[index].productName = "";
      updatedProducts[index].isInvalid = false;
      setStockEntryData((prev) => ({ ...prev, products: updatedProducts }));
      return;
    }

    // Tìm sản phẩm theo mã nhập vào
    const product = products.find((prod) => prod._id === value);

    if (product) {
      // Kiểm tra nếu nhà cung cấp không khớp
      if (stockEntryData.supplierId && product.supplierId !== stockEntryData.supplierId) {
        toast.warn(`Sản phẩm ${product.name} không thuộc nhà cung cấp đã chọn!`);
        updatedProducts[index].productName = "Không hợp lệ";
        updatedProducts[index].isInvalid = true; // Khóa ô số lượng và giá gốc
      } else {
        // Nếu hợp lệ, cập nhật thông tin sản phẩm
        updatedProducts[index].productName = product.name;
        updatedProducts[index].isInvalid = false; // Cho phép nhập
      }
    } else {
      updatedProducts[index].productName = "Sản phẩm không tìm thấy";
      updatedProducts[index].isInvalid = true; // Khóa ô nhập liệu
    }

    setStockEntryData((prev) => ({ ...prev, products: updatedProducts }));
  };


  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
      if (searchQuery.trim()) {
        fetchSearchResults(newPage);
      } else {
        fetchData(newPage);
      }
    }
  };
  const resetFilter = (field) => {
    setFilters((prev) => ({ ...prev, [field]: field === 'inStock' ? null : '' }));
  };
  const fetchSearchResults = async (page) => {
    try {
      const response = await axios.get('http://localhost:8083/api/v1/products', {
        params: { search: searchQuery, limit, page },
      });

      if (Array.isArray(response.data.data)) {
        setProducts(response.data.data);
        setTotal(response.data.total);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };
  const handleSelectProduct = (productId) => {
    const selectedProduct = products.find((p) => p._id === productId);

    if (!selectedProduct) return;

    if (selectedProducts.length > 0) {
      const firstProduct = products.find((p) => p._id === selectedProducts[0]);

      if (firstProduct.supplierId !== selectedProduct.supplierId) {
        toast.warn("Tất cả sản phẩm phải cùng một nhà cung cấp!");
        return;
      }
    }

    setSelectedProducts([...selectedProducts, productId]);
  };

  return (

    <div>
      <main className="app-content">
        <div className="app-title">
          <ul className="app-breadcrumb breadcrumb">
            <li className="breadcrumb-item active">Danh sách sản phẩm</li>
          </ul>

          <div id="clock" />
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className="tile">
              <div className="tile-body">
                <div className="row element-button">

                  <div className="col-sm-2">
                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                      <i className="fas fa-plus"></i>Tạo mới sản phẩm
                    </button>
                  </div>
                  <div className="col-sm-2">
                    <Button
                      className="btn nhap-tu-file"
                      onClick={handleStockEntryOpen}
                    >
                      <i className="fas fa-file-upload"></i> Nhập kho
                    </Button>
                  </div>
                  <div className="col-sm-2">
                    <button
                      className="btn btn-primary"
                      onClick={() => setShowSaleModal(true)}
                      disabled={selectedProducts.length === 0}
                    >
                      <i className="fas fa-tags"></i> Giảm giá
                    </button>
                  </div>
                  <div className="col-sm-2">
                    <button className="btn btn-danger" onClick={() => setShowDeletedModal(true)}>
                      <i class="fa fa-trash" aria-hidden="true"></i>  Đã xóa
                    </button>
                  </div>
                  <div className="col-sm-2">
                    <Button onClick={() => setShowFilterModal(true)} className="btn btn-primary">
                      <i class="fa fa-filter" aria-hidden="true"></i>   Bộ lọc
                    </Button>
                  </div>
                  <div className="col-sm-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Mã hoặc tên sản phẩm để tìm kiếm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)} // Chỉ cập nhật giá trị `searchQuery`, không gọi tìm kiếm.
                      style={{ height: '35px' }}
                    />
                  </div>
                  <div className="col-sm-2">
                    <Button
                      onClick={() => handleSearchById(searchQuery)} // Gọi tìm kiếm theo mã khi nhấn nút
                      className="btn btn-secondary"
                    >
                      Tìm kiếm theo mã
                    </Button>
                  </div>
                  <div className="col-sm-2">
                    <Button
                      onClick={() => handleSearchByName(searchQuery)} // Gọi tìm kiếm theo tên khi nhấn nút
                      className="btn btn-secondary"
                    >
                      Tìm kiếm theo tên
                    </Button>
                  </div>



                </div>
                {filteredProducts.length === 0 ? (
                  <div className="no-products1" style={{ textAlign: 'center' }}>
                    <img
                      src="https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/categoryfe/a60759ad1dabe909c46a.png"
                      alt="Không có sản phẩm"
                      className="no-products-image"
                    />
                    <p>Không có sản phẩm nào phù hợp với bộ lọc.</p>
                  </div>
                ) : (

                  <table className="table table-hover table-bordered" id='sampleTable' >
                    <thead>
                      <tr>
                        <th>
                          <input
                            type="checkbox"
                            onChange={(e) =>
                              setSelectedProducts(
                                e.target.checked ? products.map((p) => p._id) : []
                              )
                            }
                            checked={selectedProducts.length === products.length}
                          />
                        </th>
                        <th>ID</th>
                        <th>Tên sản phẩm</th>
                        <th>Ảnh</th>
                        <th>Số lượng</th>
                        <th>Tình trạng</th>
                        <th>Giá</th>
                        <th>Đã bán</th>
                        <th>Chức năng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.filter((product) => !product.isDelete).map((product) => (
                        <tr key={product._id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={Array.isArray(selectedProducts) && selectedProducts.includes(product._id)}
                              onChange={(e) => {
                                if (Array.isArray(selectedProducts)) {
                                  if (e.target.checked) {
                                    setSelectedProducts([...selectedProducts, product._id]);
                                  } else {
                                    setSelectedProducts(
                                      selectedProducts.filter((id) => id !== product._id)
                                    );
                                  }
                                }
                              }}
                            />

                          </td>
                          <td className="product-id" title={product._id}>{product._id}</td>
                          <td width={'250px'}>{product.name}</td>
                          <td>
                            <img src={product.image} alt={product.name} width="100" />
                          </td>
                          <td>{product.inventory ? product.inventory.quantity : 0}</td>
                          <td>
                            <span className={`badge ${product.inventory && product.inventory.quantity > 0 ? 'bg-success' : 'bg-danger'}`}>
                              {product.inventory && product.inventory.quantity > 0 ? 'Còn hàng' : 'Hết hàng'}
                            </span>
                          </td>

                          <td>     {product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                          <td>{product.sold ? product.sold : 0}</td>

                          <td>
                            <button
                              className='btn btn-danger'
                              onClick={() => handleDelete(product._id)}
                            >
                              Xóa
                            </button>

                            <button
                              className="btn btn-primary"
                              onClick={() => {
                                setProductToEdit(product);
                                setNewProduct({
                                  ...product, // Sao chép toàn bộ dữ liệu sản phẩm vào newProduct
                                  category: product.categoryId, // Đặt danh mục đúng định dạng
                                });
                                setShowEditModal(true);
                              }}
                            >
                              Sửa
                            </button>

                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <div className="pagination">

                  <a href="/admin/product">Tất cả</a>

                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Trước
                  </button>
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => handlePageChange(index + 1)}
                      className={index + 1 === currentPage ? "active" : ""}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Tiếp
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>
      <Modal show={showFilterModal} onHide={() => setShowFilterModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Bộ lọc</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>

            <Form.Group>
              <Form.Label>Danh mục</Form.Label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  value={filters.category}
                  onChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}
                >
                  {categories.map((category) => (
                    <Option key={category._id} value={category._id}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </div>
            </Form.Group>

            <Form.Group>
              <Form.Label>Nhà cung cấp</Form.Label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Select
                  style={{ width: '100%' }}
                  value={filters.supplier}
                  onChange={(value) => setFilters((prev) => ({ ...prev, supplier: value }))}
                >
                  {suppliers.map((supplier) => (
                    <Option key={supplier._id} value={supplier._id}>
                      {supplier.name}
                    </Option>
                  ))}
                </Select>
                <Button
                  variant="outline-secondary"
                  style={{ marginLeft: '10px' }}
                  onClick={() => resetFilter('supplier')}
                >
                  Xóa
                </Button>
              </div>
            </Form.Group>

            <Form.Group>
              <Form.Label>Giá tối thiểu</Form.Label>
              <Form.Control
                type="number"
                value={filters.minPrice}
                onChange={(e) => setFilters((prev) => ({ ...prev, minPrice: e.target.value }))}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Giá tối đa</Form.Label>
              <Form.Control
                type="number"
                value={filters.maxPrice}
                onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Tình trạng hàng</Form.Label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Select
                  placeholder="Tình trạng hàng"
                  style={{ width: '100%' }}
                  value={filters.inStock}
                  onChange={(value) => setFilters((prev) => ({ ...prev, inStock: value }))}
                >
                  <Option value={true}>Còn hàng</Option>
                  <Option value={false}>Hết hàng</Option>
                </Select>
                <Button
                  variant="outline-secondary"
                  style={{ marginLeft: '10px' }}
                  onClick={() => resetFilter('inStock')}
                >
                  Xóa
                </Button>
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFilterModal(false)}>
            Đóng
          </Button>
          <Button variant="primary" onClick={applyFilters}>
            Áp dụng
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showSaleModal} onHide={() => setShowSaleModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Giảm giá sản phẩm</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="salePercentage">
              <Form.Label>Nhập phần trăm giảm giá</Form.Label>
              <Form.Control
                type="number"
                value={salePercentage}  // Lấy trực tiếp từ state `salePercentage`
                onChange={(e) => setSalePercentage(Math.min(100, Math.max(0, e.target.value)))}
                min={0}
                max={100}
              />
            </Form.Group>

          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSaleModal(false)}>
            Đóng
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              applySaleToSelectedProducts();
              setShowSaleModal(false);
            }}
          >
            Áp dụng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Product Modal */}
      <Modal
        show={showAddModal}
        onHide={handleCloseAddModal}

      >
        <Modal.Header closeButton>
          <Modal.Title>Thêm sản phẩm mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddProduct}>
            <div className="row">
              {/* Cột dành cho hình ảnh */}
              {/* Cột dành cho thông tin sản phẩm */}
              <div className="col-md-7">
                <Form.Group controlId="formProductName">
                  <Form.Label>Tên sản phẩm</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />


                </Form.Group>
                <Form.Group controlId="formProductOriginalPrice">
                  <Form.Label>Giá gốc</Form.Label>
                  <Form.Control
                    type="number"
                    name="originalPrice"
                    value={newProduct.originalPrice}
                    onChange={(e) => handlePriceChange(e, "originalPrice")}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formProductSalePercentage">
                  <Form.Label>% Giảm giá</Form.Label>
                  <Form.Control
                    type="number"
                    name="salePercentage"
                    value={newProduct.salePercentage || ""}
                    onChange={(e) => handlePriceChange(e, "salePercentage")}
                    min={1}
                    max={100}
                  />
                </Form.Group>

                <Form.Group controlId="formProductPrice">
                  <Form.Label>Giá sau khi giảm</Form.Label>
                  <Form.Control
                    type="number"
                    value={
                      newProduct.originalPrice && newProduct.salePercentage
                        ? (
                          newProduct.originalPrice *
                          ((100 - newProduct.salePercentage) / 100)
                        ).toFixed(2)
                        : newProduct.originalPrice || 0
                    }
                    readOnly
                  />
                </Form.Group>

                <Form.Group controlId="formProductQuantity">
                  <Form.Label>Số lượng</Form.Label>
                  <Form.Control
                    type="number"
                    name="quantity"
                    value={newProduct.inventory ? newProduct.inventory.quantity : 0}
                    onChange={handleChange}
                    required
                    readOnly
                  />
                </Form.Group>

                {/* <Form.Group controlId="formProductPrice">
                  <Form.Label>Giá</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={newProduct.price}
                    onChange={handleChange}
                    required
                  />
                </Form.Group> */}

                <Form.Group controlId="formProductCategory">
                  <Form.Label>Danh mục</Form.Label>
                  <Select
                    mode="multiple"
                    style={{ width: '100%' }}
                    value={newProduct.category}
                    onChange={(value) => setNewProduct((prev) => ({ ...prev, category: value }))}
                    required
                  >
                    {categories.map((category) => (
                      <Option key={category._id} value={category._id}>
                        {category.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Group>

                <Form.Group controlId="formProductSupplier">
                  <Form.Label>Nhà cung cấp</Form.Label>
                  <select
                    className="form-control"
                    name="supplierId"
                    value={newProduct.supplierId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Chọn nhà cung cấp</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier._id} value={supplier._id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </Form.Group>

                <Form.Group controlId="formProductDescription">
                  <Form.Label>Mô tả</Form.Label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </Form.Group>
              </div>
              <div className="col-md-5">
                <Form.Group controlId="formProductImage">
                  <Form.Label style={{ marginLeft: '10px' }}>Ảnh chính</Form.Label>

                  <label htmlFor="file-upload-main" className="custom-file-upload">
                    <div className="file-box">
                      <span className="plus-sign">+</span>
                    </div>
                  </label>

                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} id='file-upload-main' />
                  {newProduct.image && (
                    <div style={{ margin: '10px' }}>
                      <img src={newProduct.image} alt="Preview" width="50%" />
                    </div>
                  )}
                </Form.Group>

                <Form.Group as={Col} controlId="formProductImages">
                  <Form.Label style={{ marginLeft: '5px' }}>Ảnh phụ</Form.Label>

                  <label htmlFor="file-upload-secondary" className="custom-file-upload">
                    <div className="file-box">
                      <span className="plus-sign">+</span>
                    </div>
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    id='file-upload-secondary'
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      if ((newProduct.images || productToEdit.images).length + files.length > 16) {
                        toast.warn("Chỉ được phép thêm tối đa 16 ảnh phụ.");
                        return;
                      }
                      Promise.all(
                        files.map((file) => {
                          return new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result);
                            reader.readAsDataURL(file);
                          });
                        })
                      ).then((images) => {
                        setNewProduct((prev) => ({
                          ...prev,
                          images: [...(prev.images || productToEdit.images), ...images],
                        }));
                      });
                    }}
                  />
                  <div style={{ margin: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {(newProduct.images || productToEdit.images).map((img, idx) => (
                      <div key={idx} style={{ position: 'relative', display: 'inline-block' }}>
                        <img src={img} alt={`Preview ${idx}`} width="100" style={{ height: '70px', objectFit: 'contain' }} />
                        <button
                          type="button"
                          style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            background: 'red',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            cursor: 'pointer',
                          }}
                          onClick={() => {
                            const updatedImages = (newProduct.images || productToEdit.images).filter(
                              (_, i) => i !== idx
                            );
                            setNewProduct((prev) => ({
                              ...prev,
                              images: updatedImages,
                            }));
                          }}
                        >
                          X
                        </button>
                      </div>
                    ))}
                  </div>
                </Form.Group>

              </div>
            </div>

            <div className="modal-footer">
              <Button variant="danger" onClick={deleteProduct}>
                Xóa tất cả
              </Button>
              <Button variant="secondary" onClick={handleCloseAddModal}>
                Đóng
              </Button>

              <Button variant="primary" type="submit">
                Thêm sản phẩm
              </Button>
            </div>
          </Form>
        </Modal.Body>

      </Modal>


      {/* Edit Product Modal */}
      {productToEdit && (
        <Modal show={showEditModal} onHide={handleCloseEditModal}>
          <Modal.Header closeButton>
            <Modal.Title>Chỉnh sửa sản phẩm</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleEditProduct}>
              <div className="row">
                {/* Cột dành cho thông tin sản phẩm */}
                <div className="col-md-7">
                  <Form.Group controlId="formProductName">
                    <Form.Label>Tên sản phẩm</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={newProduct.name || ''}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="formProductQuantity">
                    <Form.Label>Số lượng</Form.Label>
                    <Form.Control
                      type="number"
                      name="quantity"
                      value={newProduct.quantity || 0}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="formProductPrice">
                    <Form.Label>Giá</Form.Label>
                    <Form.Control
                      type="number"
                      name="price"
                      value={newProduct.price || 0}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="formProductCategory">
                    <Form.Label>Danh mục</Form.Label>
                    <Select
                      mode="multiple"
                      style={{ width: '100%' }}
                      value={newProduct.categoryId || []}
                      onChange={(value) => setNewProduct((prev) => ({ ...prev, categoryId: value }))}
                      required
                    >
                      {categories.map((category) => (
                        <Option key={category._id} value={category._id}>
                          {category.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Group>
                  <Form.Group controlId="formProductSupplier">
                    <Form.Label>Nhà cung cấp</Form.Label>
                    <select
                      className="form-control"
                      name="supplierId"
                      value={newProduct.supplierId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Chọn nhà cung cấp</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier._id} value={supplier._id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  </Form.Group>


                  <Form.Group controlId="formProductDescription">
                    <Form.Label>Mô tả</Form.Label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={newProduct.description || ''}
                      onChange={handleChange}
                    />
                  </Form.Group>

                </div>
                {/* Cột dành cho thông tin sản phẩm */}
                <div className="col-md-5">
                  <Form.Group as={Col} controlId="formProductImage">
                    <Form.Label>Ảnh chính</Form.Label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    {newProduct.image || productToEdit.image ? (
                      <div>
                        <img
                          src={newProduct.image || productToEdit.image}
                          alt="Product"
                          width="100"
                          style={{ marginTop: '10px' }}
                        />
                      </div>
                    ) : null}
                  </Form.Group>
                  <Form.Group as={Col} controlId="formProductImages">
                    <Form.Label>Ảnh phụ</Form.Label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        Promise.all(
                          files.map((file) => {
                            return new Promise((resolve) => {
                              const reader = new FileReader();
                              reader.onloadend = () => resolve(reader.result);
                              reader.readAsDataURL(file);
                            });
                          })
                        ).then((images) => {
                          setNewProduct((prev) => ({
                            ...prev,
                            images: [...prev.images, ...images],
                          }));
                        });
                      }}
                    />
                    <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {(newProduct.images || productToEdit.images).map((img, idx) => (
                        <div key={idx}>
                          <img src={img} alt={`Preview ${idx}`} width="100" />
                          <button
                            type="button"
                            onClick={() => {
                              const updatedImages = (newProduct.images || productToEdit.images).filter(
                                (_, i) => i !== idx
                              );
                              setNewProduct((prev) => ({
                                ...prev,
                                images: updatedImages,
                              }));
                            }}
                          >
                            X
                          </button>
                        </div>
                      ))}
                    </div>
                  </Form.Group>
                </div>
                <div className="modal-footer">
                  <Button variant="secondary" onClick={handleCloseEditModal}>
                    Đóng
                  </Button>
                  <Button variant="primary" type="submit">
                    Lưu thay đổi
                  </Button>
                </div>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      )}
      <Modal
        show={showStockEntryModal}
        onHide={handleStockEntryClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>Nhập Kho</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleStockEntrySubmit}>
            {/* Warehouse selection */}
            <Form.Group controlId="formProductWarehouse">
              <Form.Label>Kho</Form.Label>
              <Select
                style={{ width: '100%' }}
                value={stockEntryData.warehouseId}
                onChange={(value) => setStockEntryData((prev) => ({ ...prev, warehouseId: value }))}
                required
              >
                {warehouses.map((warehouse) => (
                  <Option key={warehouse._id} value={warehouse._id}>
                    {warehouse.name}
                  </Option>
                ))}
              </Select>
            </Form.Group>

            <Form.Group controlId={"formProductSupplier"}>
              <Form.Label>Nhà cung cấp</Form.Label>
              <Select
                style={{ width: '100%' }}
                value={stockEntryData.supplierId}
                onChange={(value) => setStockEntryData((prev) => ({ ...prev, supplierId: value }))}
                required
                disabled={stockEntryData.products.length > 0} // Nếu đã có sản phẩm, khóa chọn nhà cung cấp
              >
                {suppliers.map((supplier) => (
                  <Option key={supplier._id} value={supplier._id}>
                    {supplier.name}
                  </Option>
                ))}
              </Select>
            </Form.Group>

            {/* Multiple product entries */}
            {stockEntryData.products.map((product, index) => (
              <div key={index}>
                <hr />
                <Form.Group controlId={`formProductCode-${index}`}>
                  <Form.Label>Mã sản phẩm</Form.Label>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Form.Control
                      type="text"
                      name="productId"
                      value={stockEntryData.products[index].productId || ''}
                      onChange={(e) => handleProductCodeChange(e, index)}
                      placeholder="Nhập mã sản phẩm"
                      required
                    />

                    {/* Display the product name next to the code input */}
                    <span style={{ marginLeft: '10px', fontWeight: 'bold', width: '500px' }}>
                      {product.productName || "Không tìm thấy sản phẩm"}
                    </span>
                  </div>
                </Form.Group>

                <Form.Group controlId={`formProductQuantity-${index}`}>
                  <Form.Label>Số lượng nhập</Form.Label>
                  <Form.Control
                    type="number"
                    name="quantity"
                    value={product.quantity}
                    onChange={(e) => handleStockEntryChange(e, index)}
                    min="1"
                    required
                    disabled={product.isInvalid} // Khóa ô nhập nếu sản phẩm không hợp lệ
                  />
                </Form.Group>

                <Form.Group controlId={`formProductCapitalPrice-${index}`}>
                  <Form.Label>Giá vốn</Form.Label>
                  <Form.Control
                    type="number"
                    name="capitalPrice"
                    value={product.capitalPrice}
                    onChange={(e) => handleStockEntryChange(e, index)}
                    required
                    disabled={product.isInvalid} // Khóa ô nhập nếu sản phẩm không hợp lệ
                  />
                </Form.Group>



                {/* Remove product button */}
                <Button
                  variant="danger"
                  onClick={() => handleRemoveStockProduct(index)}
                  style={{ marginBottom: '10px' }}
                >
                  Xóa sản phẩm
                </Button>
              </div>
            ))}

            {/* Add product button */}
            <Button
              variant="secondary"
              onClick={handleAddStockProduct}
              style={{ marginTop: '20px' }}
            >
              Thêm sản phẩm
            </Button>

            <div className="modal-footer">
              <Button variant="secondary" onClick={handleStockEntryClose}>
                Đóng
              </Button>
              <Button variant="primary" type="submit">
                Nhập kho
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      <Modal show={showDeletedModal} onHide={() => setShowDeletedModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Sản phẩm đã xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên sản phẩm</th>
                <th>Ngày xóa</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {deletedProducts.map((product) => (
                <tr key={product._id}>
                  <td>{product._id}</td>
                  <td>{product.name}</td>
                  <td>{new Date(product.delete_at).toLocaleString()}</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => restoreProduct(product._id)}
                    >
                      Hoàn tác
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeletedModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>;

    </div>
  );
}
