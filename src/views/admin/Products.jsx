import AdminSidebar from "../components/AdminSidebar";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import {
  fetchAllProducts,
  deleteProductById,
} from "../../controllers/adminController.ts";
import "../../styles/list.css";

const Products = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productList = await fetchAllProducts();
        setProducts(productList);
      } catch (err) {
        console.log(err);
      }
    };
    fetchProducts();
  }, []);

  const handleDelete = async (productId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await deleteProductById(productId);
        setProducts(products.filter((item) => item.productId !== productId));
        Swal.fire("Deleted!", "Your file has been deleted.", "success");
      } catch (err) {
        console.log(err);
        Swal.fire("Error", "Failed to delete the item.", "error");
      }
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      Swal.fire("Cancelled", "Your file is safe :)", "info");
    }
  };

  return (
    <div>
      <AdminSidebar />
      <div className="list-container">
        <button className="create-button">
          <Link to={`new`}>Create Product</Link>
        </button>
        <br />
        <h2>All Products</h2>
        <table className="product-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Category</th>
              <th>Subcategory</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Quality</th>
              <th>Original/Replica</th>
              <th>Supplier ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.productId}>
                <td>{product.productName}</td>
                <td>{product.productDescription}</td>
                <td>{product.productCategory}</td>
                <td>{product.productSubcategory}</td>
                <td>{product.productPrice}</td>
                <td>{product.productStock}</td>
                <td>{product.productQuality}</td>
                <td>{product.isOriginal ? "Original" : "Replica"}</td>
                <td>{product.productSupplier}</td>
                <td>
                  <button className="update-button">
                    <Link to={`update/${product.productId}`}>Update</Link>
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(product.productId)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Products;
