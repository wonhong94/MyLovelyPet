import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProductRegister.css';

const ProductRegister = ({ closeModal }) => {
  const [formData, setFormData] = useState({
    mainCategory: '',
    subCategory: '',
    pdName: '',
    pdPrice: '',
    pdLimit: '',
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  // 카테고리 매핑 객체
  const categoryMapping = {
    공통: {
      미용용품: 1,
      외출용품: 2,
      '급식/급수기': 3,
    },
    강아지: {
      사료: 4,
      간식: 5,
      장난감: 6,
      위생용품: 7,
    },
    고양이: {
      사료: 8,
      간식: 9,
      장난감: 10,
      위생용품: 11,
    },
  };

  // 상위 카테고리 옵션
  const mainCategoryOptions = Object.keys(categoryMapping);

  // 하위 카테고리 옵션
  const subCategoryOptions = formData.mainCategory
    ? Object.keys(categoryMapping[formData.mainCategory])
    : [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // 메인 카테고리가 변경되면 서브 카테고리 초기화
    if (name === 'mainCategory') {
      setFormData((prevData) => ({
        ...prevData,
        mainCategory: value,
        subCategory: '',
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.mainCategory || !formData.subCategory) {
      alert('카테고리를 선택해주세요.');
      return;
    }

    const userIdx = localStorage.getItem('userIdx');
    if (!userIdx) {
      alert('로그인이 필요합니다.');
      return;
    }

    const ctgIdx = categoryMapping[formData.mainCategory][formData.subCategory];

    // 서버로 보낼 데이터 생성
    const productData = {
      ctgIdx: ctgIdx,
      pdName: formData.pdName,
      pdPrice: parseInt(formData.pdPrice, 10),
      pdLimit: parseInt(formData.pdLimit, 10),
      userIdx: parseInt(userIdx, 10),
    };

    const data = new FormData();
    data.append(
      'product',
      new Blob([JSON.stringify(productData)], { type: 'application/json' })
    );
    if (selectedImage) {
      data.append('file', selectedImage);
    }

    try {
      await axios.post('/petShop/product/save', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('상품이 성공적으로 등록되었습니다.');
      closeModal();
    } catch (error) {
      console.error('상품 등록에 실패했습니다.', error);
      if (error.response) {
        console.error('서버 응답:', error.response.data);
        alert(`상품 등록에 실패했습니다: ${error.response.data.message || '서버 오류'}`);
      } else {
        alert('상품 등록에 실패했습니다: 서버와의 연결에 문제가 있습니다.');
      }
    }
  };

  return (
    <div className="product-register">
      <h2>상품 등록</h2>
      <div className="title-divider"></div>
      <form onSubmit={handleSubmit} className="product-register-form">
        <div className="form-section">
          <div className="form-group">
            <label>상위 카테고리:</label>
            <select
              name="mainCategory"
              value={formData.mainCategory}
              onChange={handleInputChange}
              required
            >
              <option value="">선택</option>
              {mainCategoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>하위 카테고리:</label>
            <select
              name="subCategory"
              value={formData.subCategory}
              onChange={handleInputChange}
              required
              disabled={!formData.mainCategory}
            >
              <option value="">선택</option>
              {subCategoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>상품명:</label>
            <input
              type="text"
              name="pdName"
              value={formData.pdName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>상품 가격:</label>
            <input
              type="number"
              name="pdPrice"
              value={formData.pdPrice}
              onChange={handleInputChange}
              required
              min="0"
            />
          </div>
          <div className="form-group">
            <label>최소 수량:</label>
            <input
              type="number"
              name="pdLimit"
              value={formData.pdLimit}
              onChange={handleInputChange}
              required
              min="1"
            />
          </div>
         
        </div>
        <div className="image-section">
          <div className="image-placeholder">
            {imagePreviewUrl ? (
              <img src={imagePreviewUrl} alt="상품 이미지" />
            ) : (
              '상품 이미지를 등록해주세요.'
            )}
          </div>
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>
        <div className="form-group">
            <button type="submit" className="submit-button">
              등록
            </button>
          </div>
      </form>
    </div>
  );
};

export default ProductRegister;