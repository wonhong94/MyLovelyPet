  // src/pages/ProductManagement.js
  import React, { useState, useEffect } from 'react';
  import axios from 'axios';
  import Modal from 'react-modal';
  import ProductRegister from '../components/ProductRegister';
  import ProductUpdate from '../components/ProductUpdate';
  import './ProductManagement.css';

  const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
      fetchProducts();
    }, []);

    const fetchProducts = async () => {
      try {
        const response = await axios.get('/petShop/product/findAll');
        setProducts(response.data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };

    const formatPrice = (price) => { // 금액에 , 찍는 코드
      return new Intl.NumberFormat('ko-KR').format(price);
    };

    const handleSearchChange = (e) => {
      setSearchTerm(e.target.value);
    };

    const openRegisterModal = () => {
      setIsRegisterModalOpen(true);
    };

    const closeRegisterModal = () => {
      setIsRegisterModalOpen(false);
    };

    const openUpdateModal = (product) => {
      setSelectedProduct(product);
      setIsUpdateModalOpen(true);
    };

    const closeUpdateModal = () => {
      setSelectedProduct(null);
      setIsUpdateModalOpen(false);
    };

    const handleDelete = async (pdIdx) => {
      try {
        await axios.delete(`/petShop/product/delete/${pdIdx}`);
        alert('상품이 성공적으로 삭제되었습니다.');
        fetchProducts();
      } catch (error) {
        console.error('상품 삭제에 실패했습니다.', error);
        alert('상품 삭제에 실패했습니다.');
      }
    };

    const filteredProducts = products.filter((product) =>
      product.pdName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    

    return (
      <div className="product-management">
        <h2>상품 관리</h2>
        <div className="search-bar">
          <label htmlFor="search">상품 검색:</label>
          <input
            id="search"
            type="text"
            placeholder="상품명으로 검색"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button onClick={openRegisterModal} className='openRegisterModal'>상품 등록</button>
        </div>
        <div className="product-list">
          <table>
            <thead>
              <tr>
                <th>상품 명</th>
                <th>카테고리</th>
                <th>상품 카테고리</th>
              
                <th>최소수량</th>
                <th>가격</th>
                <th>작업</th>
                {/* <th>이미지</th> */}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.pdIdx} className="product-item">
                  <td>{product.pdName}</td>
                  <td>{product.category ? product.category.ctgNum1 : 'N/A'}</td>
                  <td>{product.category ? product.category.ctgNum2 : 'N/A'}</td>
                  <td>{product.pdLimit}</td>
                  <td>{formatPrice(product.pdPrice)} 원</td> {/* 포맷팅된 가격 표시 */}
                  
                  <td>
                    <button onClick={() => openUpdateModal(product)}>수정</button>
                    <button onClick={() => handleDelete(product.pdIdx)}>삭제</button>
                  </td>
                  {/* <td>
                    {product.productInfo && product.productInfo.pdImgUrl ? (
                      <img src={product.productInfo.pdImgUrl} alt={product.pdName} className="product-image" />
                    ) : (
                      'N/A'
                    )}
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Modal
          isOpen={isRegisterModalOpen}
          onRequestClose={closeRegisterModal}
          className="product-modal"
          overlayClassName="product-modal-overlay"
        >
          <ProductRegister closeModal={closeRegisterModal} />
        </Modal>
        <Modal
          isOpen={isUpdateModalOpen}
          onRequestClose={closeUpdateModal}
          className="product-modal"
          overlayClassName="product-modal-overlay"
        >
          <ProductUpdate product={selectedProduct} closeModal={closeUpdateModal} />
        </Modal>
      </div>
    );
  };

  export default ProductManagement;
