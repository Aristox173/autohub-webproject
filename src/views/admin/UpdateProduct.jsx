import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getProductById,
  updateProductById,
  fetchSuppliers,
} from "../../controllers/adminController.ts";
import "../../styles/new.css";

const categories = {
  Engine: ["Cylinder block", "Pistons", "Connecting rods"],
  "Electrical System": ["Starter Motor", "Battery", "Alternator"],
  Brakes: ["Brake Pads", "Brake Discs", "Brake Calipers"],
};

const UpdateProduct = () => {
  const [data, setData] = useState({
    productName: "",
    productDescription: "",
    productCategory: "",
    productSubcategory: "",
    productPrice: 0,
    productStock: 0,
    productQuality: 1,
    isOriginal: false,
    productSupplier: "",
  });

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const { productId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductAndSuppliers = async () => {
      try {
        const productData = await getProductById(productId);
        const supplierList = await fetchSuppliers();
        setSuppliers(supplierList);

        if (productData) {
          setData(productData);
          setSelectedCategory(productData.productCategory);
          setSelectedSubcategory(productData.productSubcategory);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchProductAndSuppliers();
  }, [productId]);

  const handleInput = (e) => {
    const { id, value, type, checked } = e.target;
    setData({ ...data, [id]: type === "checkbox" ? checked : value });
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedSubcategory("");
  };

  const handleSubcategoryChange = (e) => {
    setSelectedSubcategory(e.target.value);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const updatedProductData = {
        ...data,
        productCategory: selectedCategory,
        productSubcategory: selectedSubcategory,
      };

      await updateProductById(productId, updatedProductData);
      navigate(-1);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="new-container">
      <h1 className="new-title">Update Product</h1>
      <form onSubmit={handleUpdate} className="new-form">
        <label className="new-label" htmlFor="productCategory">
          Category
        </label>
        <select
          id="productCategory"
          className="new-select"
          value={selectedCategory}
          onChange={handleCategoryChange}
        >
          <option value="">Select Category</option>
          {Object.keys(categories).map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {selectedCategory && (
          <>
            <label className="new-label" htmlFor="productSubcategory">
              Subcategory
            </label>
            <select
              id="productSubcategory"
              className="new-select"
              value={selectedSubcategory}
              onChange={handleSubcategoryChange}
            >
              <option value="">Select Subcategory</option>
              {categories[selectedCategory].map((subcategory) => (
                <option key={subcategory} value={subcategory}>
                  {subcategory}
                </option>
              ))}
            </select>
          </>
        )}
        <label className="new-label" htmlFor="productName">
          Name
        </label>
        <input
          id="productName"
          className="new-input"
          type="text"
          placeholder="Product 1"
          value={data.productName}
          onChange={handleInput}
          required
        />
        <label className="new-label" htmlFor="productDescription">
          Description
        </label>
        <input
          id="productDescription"
          className="new-input"
          type="text"
          placeholder="Description 1"
          value={data.productDescription}
          onChange={handleInput}
          required
        />
        <label className="new-label" htmlFor="productPrice">
          Price
        </label>
        <input
          id="productPrice"
          className="new-input"
          type="number"
          placeholder="Price"
          value={data.productPrice}
          onChange={handleInput}
          required
        />
        <label className="new-label" htmlFor="productStock">
          Stock
        </label>
        <input
          id="productStock"
          className="new-input"
          type="number"
          placeholder="Stock"
          value={data.productStock}
          onChange={handleInput}
          required
        />
        <label className="new-label" htmlFor="productQuality">
          Quality
        </label>
        <select
          id="productQuality"
          className="new-select"
          value={data.productQuality}
          onChange={handleInput}
          required
        >
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
          <option value={5}>5</option>
        </select>
        <label className="new-label" htmlFor="isOriginal">
          Original
        </label>
        <input
          id="isOriginal"
          className="new-checkbox"
          type="checkbox"
          checked={data.isOriginal}
          onChange={handleInput}
        />
        <label className="new-label" htmlFor="productSupplier">
          Supplier
        </label>
        <select
          id="productSupplier"
          className="new-select"
          value={data.productSupplier}
          onChange={handleInput}
        >
          <option value="">Select Supplier</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </select>
        <button type="submit" className="new-button">
          Update
        </button>
      </form>
      <button onClick={() => navigate(-1)} className="new-button">
        Back
      </button>
    </div>
  );
};

export default UpdateProduct;
