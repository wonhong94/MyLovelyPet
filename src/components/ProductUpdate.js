import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProductRegister.css';

const ProductRegister = ({ product, closeModal }) => {
  const [formData, setFormData] = useState({
    ctgIdx: '',
    pdName: '',
    pdPrice: '',
    pdLimit: '',
    ctgNum2: '', // 상품 카테고리를 위한 필드 추가
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  useEffect(() => {
    if (product) {
      setFormData({
        ctgIdx: product.category ? product.category.ctgIdx : '',
        pdName: product.pdName,
        pdPrice: product.pdPrice,
        pdLimit: product.pdLimit,
        ctgNum2: product.category ? product.category.ctgNum2 : '', // 기본으로 상품 카테고리를 설정
      });
      setImagePreviewUrl(product.productInfo ? product.productInfo.pdImgUrl : null);
    }
  }, [product]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userIdx = localStorage.getItem('userIdx'); // Assuming userIdx is stored in localStorage

    const productData = {
      ctgIdx: formData.ctgIdx,
      pdName: formData.pdName,
      pdPrice: formData.pdPrice,
      pdLimit: formData.pdLimit,
      userIdx: userIdx,
    };

    const data = new FormData();
    data.append('product', new Blob([JSON.stringify(productData)], { type: 'application/json' }));
    if (selectedImage) {
      data.append('file', selectedImage);
    }

    try {
      if (product) {
        await axios.put(`/petShop/product/update/${product.pdIdx}`, data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        alert('상품이 성공적으로 수정되었습니다.');
      } else {
        await axios.post('/petShop/product/save', data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        alert('상품이 성공적으로 등록되었습니다.');
      }
      closeModal();
    } catch (error) {
      console.error('상품 등록/수정에 실패했습니다.', error);
      alert('상품 등록/수정에 실패했습니다.');
    }
  };

  return (
    <div className="product-register">
      <h2>{product ? '상품 수정' : '상품 등록'}</h2>
      <div className="title-divider"></div>
      <form onSubmit={handleSubmit} className="product-register-form">
        <div className="form-section">
          <div className="form-group">
            <label>카테고리:</label>
            <select name="ctgIdx" value={formData.ctgIdx} onChange={handleInputChange} required>
              <option value="">선택</option>
              <option value="1">강아지</option>
              <option value="2">고양이</option>
              <option value="3">공통</option>
            </select>
          </div>
          <div className="form-group">
            <label>상품 카테고리:</label>
            <select name="ctgNum2" value={formData.ctgNum2} onChange={handleInputChange} required>
              <option value="">선택</option>
              <option value="사료">사료</option>
              <option value="간식">간식</option>
              <option value="장난감">장난감</option>
              <option value="미용용품">미용용품</option>
              <option value="외출용품">외출용품</option>
              <option value="식기">식기</option>
              <option value="위생용품">위생용품</option>
            </select>
          </div>
          <div className="form-group">
            <label>상품명:</label>
            <input type="text" name="pdName" value={formData.pdName} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>상품 가격:</label>
            <input type="number" name="pdPrice" value={formData.pdPrice} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>최소 수량:</label>
            <input type="number" name="pdLimit" value={formData.pdLimit} onChange={handleInputChange} required />
          </div>

        </div>
        <div className="image-section">
          <div className="image-placeholder">
            {imagePreviewUrl ? <img src={imagePreviewUrl} alt="상품 이미지" /> : '상품 이미지 등록'}
          </div>
          <input type="file" onChange={handleImageChange} />
        </div>
        <div className="form-group">
            <button type="submit" className="submit-button">{product ? '수정' : '등록'}</button>
          </div>
      </form>
    </div>
  );
};

export default ProductRegister;
