import { useState, useEffect, useContext } from "react";
import {
  fetchProducts,
  findCheapestOption,
  findQualityOption,
  findBalancedOption,
  createOrder,
} from "../../controllers/comparisonController.ts";
import "../../styles/selection.css";
import { AuthContext } from "../../models/contexts/AuthContext";
import MechanicSidebar from "../components/MechanicSidebar.jsx";

const categories = {
  Engine: ["Cylinder block", "Pistons", "Connecting rods"],
  "Electrical System": ["Starter Motor", "Battery", "Alternator"],
  Brakes: ["Brake Pads", "Brake Discs", "Brake Calipers"],
};

const Selection = () => {
  const [selectedSubcategories, setSelectedSubcategories] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState({
    cheapest: null,
    quality: null,
    balanced: null,
  });
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const productList = await fetchProducts();
        setProducts(productList);
      } catch (err) {
        console.error("Error fetching products: ", err);
        setError("Failed to fetch products. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const handleCheckboxChange = (category, subcategory) => {
    setSelectedSubcategories((prevState) => {
      const currentSubcategories = prevState[category] || {};
      const updatedSubcategories = {
        ...currentSubcategories,
        [subcategory]: currentSubcategories[subcategory] ? 0 : 1,
      };
      return {
        ...prevState,
        [category]: updatedSubcategories,
      };
    });
  };

  const handleQuantityChange = (category, subcategory, quantity) => {
    setSelectedSubcategories((prevState) => ({
      ...prevState,
      [category]: {
        ...prevState[category],
        [subcategory]: quantity,
      },
    }));
  };

  const renderSubcategoryCheckboxes = (category, subcategories) => {
    return subcategories.map((subcategory) => (
      <div key={subcategory} className="subcategory">
        <label>
          <input
            type="checkbox"
            checked={selectedSubcategories[category]?.[subcategory] > 0}
            onChange={() => handleCheckboxChange(category, subcategory)}
          />
          {subcategory}
        </label>
        <input
          type="number"
          value={selectedSubcategories[category]?.[subcategory] || ""}
          onChange={(e) =>
            handleQuantityChange(
              category,
              subcategory,
              parseInt(e.target.value)
            )
          }
          disabled={!selectedSubcategories[category]?.[subcategory]}
          min="0"
        />
      </div>
    ));
  };

  const handleAnalyseClick = () => {
    const selectedItems = Object.entries(selectedSubcategories).flatMap(
      ([category, subcategories]) =>
        Object.entries(subcategories)
          .filter(([_, quantity]) => quantity > 0)
          .map(([subcategory, quantity]) => ({
            category,
            subcategory,
            quantity,
          }))
    );

    const filteredProducts = products.filter((product) =>
      selectedItems.some(
        (item) =>
          product.productCategory === item.category &&
          product.productSubcategory === item.subcategory
      )
    );

    console.log("Selected Subcategories:", selectedItems);
    console.log("Cheapest Option:");
    findCheapestOption(selectedItems, filteredProducts);
    console.log("Balanced Option:");
    findBalancedOption(selectedItems, filteredProducts);
    console.log("Quality Option:");
    findQualityOption(selectedItems, filteredProducts);

    const cheapestResults = findCheapestOption(selectedItems, filteredProducts);
    const qualityResults = findQualityOption(selectedItems, filteredProducts);
    const balancedResults = findBalancedOption(selectedItems, filteredProducts);

    setResults({
      cheapest: cheapestResults,
      quality: qualityResults,
      balanced: balancedResults,
    });
  };

  const handleSelectOption = async (option) => {
    if (!results[option]) return;

    const orderDetails = results[option].details.map((item) => ({
      productName: item.product.productName,
      productPrice: item.product.productPrice,
      productSupplier: item.product.productSupplier,
      quantity: item.quantity,
    }));

    try {
      const mechanicId = currentUser.uid; //
      await createOrder(mechanicId, orderDetails);
      console.log("Order created successfully!");
    } catch (err) {
      console.error("Error creating order:", err);
    }
  };

  return (
    <div>
      <MechanicSidebar />
      <div className="selection">
        <h1>Select Needed Parts</h1>
        {loading && <p>Loading products...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && products.length === 0 && (
          <p>No products available.</p>
        )}
        {!loading && !error && (
          <>
            {Object.entries(categories).map(([category, subcategories]) => (
              <div key={category} className="category-section">
                <h2>{category}</h2>
                {renderSubcategoryCheckboxes(category, subcategories)}
              </div>
            ))}
            <button className="analyse-button" onClick={handleAnalyseClick}>
              Analyse
            </button>

            <div className="result-cards">
              {results.cheapest && (
                <div className="result-card">
                  <h3>Cheapest Option</h3>
                  <ul>
                    {results.cheapest.details.map((item, index) => (
                      <li key={index}>
                        {item.quantity} x {item.product.productName} @ $
                        {item.product.productPrice} each = $
                        {item.cost.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                  <p>Total: ${results.cheapest.totalCost.toFixed(2)}</p>
                  <button onClick={() => handleSelectOption("cheapest")}>
                    Select
                  </button>
                </div>
              )}

              {results.balanced && (
                <div className="result-card">
                  <h3>Balanced Option</h3>
                  <ul>
                    {results.balanced.details.map((item, index) => (
                      <li key={index}>
                        {item.quantity} x {item.product.productName} @ $
                        {item.product.productPrice} each = $
                        {item.cost.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                  <p>Total: ${results.balanced.totalCost.toFixed(2)}</p>
                  <button onClick={() => handleSelectOption("balanced")}>
                    Select
                  </button>
                </div>
              )}

              {results.quality && (
                <div className="result-card">
                  <h3>Quality Option</h3>
                  <ul>
                    {results.quality.details.map((item, index) => (
                      <li key={index}>
                        {item.quantity} x {item.product.productName} @ $
                        {item.product.productPrice} each = $
                        {item.cost.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                  <p>Total: ${results.quality.totalCost.toFixed(2)}</p>
                  <button onClick={() => handleSelectOption("quality")}>
                    Select
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Selection;
