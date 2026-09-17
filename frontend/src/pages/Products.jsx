import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");

        setProducts(response.data.products);
      } catch (error) {
        console.error("Failed to fetch products:", error);

        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-8 py-10">
      <h1 className="text-3xl font-bold text-[#384358] mb-8">
        Laptops
      </h1>

      {products.length === 0 ? (
        <p>No products available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
          <div
  key={product._id}
  onClick={() => navigate(`/products/${product._id}`)}
  className="bg-white rounded-xl p-5 shadow cursor-pointer hover:shadow-lg transition"
>
              <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-gray-400">
                  No Image
                </span>
              </div>

              <p className="text-sm text-gray-500">
                {product.brand}
              </p>

              <h2 className="text-lg font-semibold text-[#384358] mt-1">
                {product.name}
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {product.category}
              </p>

              <p className="text-xl font-bold text-[#b51a2b] mt-4">
                ₹{product.price.toLocaleString("en-IN")}
              </p>

              <p className="text-sm text-gray-500 mt-2">
                Stock: {product.stock}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Products;