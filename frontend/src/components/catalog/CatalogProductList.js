import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const CatalogProductList = () => {
  const { catalogId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 8;

  useEffect(() => {
    fetchCatalogInfo();
  }, [catalogId]);

  useEffect(() => {
    fetchProducts();
  }, [catalogId, page]);

  const fetchCatalogInfo = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/catalogs/${catalogId}`);
      if (response.ok) {
        const data = await response.json();
        setCatalog(data);
      }
    } catch (error) {
      console.error("Lỗi khi tải thông tin danh mục:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const skip = (page - 1) * limit;
      const response = await fetch(`http://127.0.0.1:8000/api/v1/catalogs/${catalogId}/products?skip=${skip}&limit=${limit}`);
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Lỗi khi tải sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .list-container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; font-family: 'Segoe UI', Tahoma, sans-serif; }
        .list-header { display: flex; align-items: center; gap: 20px; margin-bottom: 30px; }
        .back-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #4b5563; transition: color 0.2s; padding: 0; }
        .back-btn:hover { color: #4f46e5; }
        .list-header h2 { font-size: 32px; color: #111827; margin: 0; }
        
        .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 30px; }
        .product-card { background: white; border-radius: 12px; border: 1px solid #f3f4f6; overflow: hidden; transition: box-shadow 0.3s; display: flex; flex-direction: column; cursor: pointer; }
        .product-card:hover { box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
        .product-image { height: 250px; position: relative; overflow: hidden; background-color: #f3f4f6; }
        .product-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
        .product-card:hover .product-image img { transform: scale(1.05); }
        .product-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s; }
        .product-card:hover .product-overlay { opacity: 1; }
        
        .btn-detail { padding: 10px 20px; background: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; color: #111827; }
        .product-info { padding: 20px; display: flex; flex-direction: column; flex-grow: 1; }
        .product-info h3 { font-size: 18px; margin-bottom: 5px; color: #111827; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; line-height: 1.4; height: 50px; }
        .price { color: #4f46e5; font-weight: bold; margin-bottom: 15px; font-size: 18px; }
        .btn-add-cart { margin-top: auto; padding: 10px; background-color: #eef2ff; color: #4f46e5; border: 1px solid #e0e7ff; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.3s; width: 100%; }
        .btn-add-cart:hover { background-color: #4f46e5; color: white; }
        
        .pagination { display: flex; justify-content: center; gap: 10px; margin-top: 40px; }
        .page-btn { padding: 8px 16px; border: 1px solid #d1d5db; background: white; border-radius: 6px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
        .page-btn:hover:not(:disabled) { border-color: #4f46e5; color: #4f46e5; }
        .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .loading { text-align: center; padding: 40px; font-size: 18px; color: #6b7280; }
        .empty-state { text-align: center; padding: 40px; color: #6b7280; font-size: 16px; }
      `}</style>
      
      <div className="list-container">
        <div className="list-header">
          <button className="back-btn" onClick={() => navigate(-1)} title="Quay lại">
            &larr;
          </button>
          <h2>{catalog ? catalog.product_type : 'Danh MụC Sản Phẩm'}</h2>
        </div>

        {loading ? (
          <div className="loading">Đang tải sản phẩm...</div>
        ) : (
          <>
            {products.length === 0 ? (
              <div className="empty-state">Danh mục này hiện chưa có sản phẩm nào.</div>
            ) : (
              <div className="product-grid">
                {products.map((product) => {
                  let imageSrc = "https://via.placeholder.com/250?text=No+Image";
                  if (product.images && product.images.length > 0) {
                     let firstImage = typeof product.images === 'string' ? null : product.images[0];
                     if (typeof product.images === 'string') {
                       try {
                         const parsed = JSON.parse(product.images);
                         if (Array.isArray(parsed) && parsed.length > 0) firstImage = parsed[0];
                       } catch(e) {}
                     }
                     if (firstImage) imageSrc = firstImage;
                  }
                  
                  return (
                    <div 
                      key={product.id} 
                      className="product-card"
                      onClick={() => navigate(`/product-detail/id=${product.id}`)}
                    >
                      <div className="product-image">
                        <img src={imageSrc} alt={product.name} />
                        <div className="product-overlay">
                          <button className="btn-detail">Xem chi tiết</button>
                        </div>
                      </div>
                      <div className="product-info">
                        <h3>{product.name}</h3>
                        <p className="price">{product.price.toLocaleString('vi-VN')}đ</p>
                        <button 
                          className="btn-add-cart"
                          onClick={(e) => { e.stopPropagation(); alert('Đã thêm thành công'); }}
                        >
                          Thêm vào giỏ
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            <div className="pagination">
              <button 
                className="page-btn" 
                disabled={page === 1} 
                onClick={() => setPage(page - 1)}
              >
                Trang trước
              </button>
              <span style={{ padding: '8px 16px', fontWeight: 'bold' }}>Trang {page}</span>
              <button 
                className="page-btn" 
                onClick={() => setPage(page + 1)}
                disabled={products.length < limit}
              >
                Trang sau
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CatalogProductList;
