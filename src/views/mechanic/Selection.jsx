import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../utils/firebase";
import "../../styles/selection.css";

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

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const querySnapshot = await getDocs(collection(db, "product"));
        const productList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productList);
      } catch (err) {
        console.error("Error fetching products: ", err);
        setError("Failed to fetch products. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
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

  const findCheapestOption = (selectedItems, products) => {
    let totalCost = 0;
    const details = [];
    selectedItems.forEach((item) => {
      let remainingQuantity = item.quantity;
      const matchingProducts = products
        .filter(
          (product) =>
            product.productCategory === item.category &&
            product.productSubcategory === item.subcategory
        )
        .sort((a, b) => {
          // First priority: Price (lower is better)
          if (parseFloat(a.productPrice) !== parseFloat(b.productPrice)) {
            return parseFloat(a.productPrice) - parseFloat(b.productPrice);
          }
          // Second priority: Quality (higher is better)
          if (parseInt(b.productQuality) !== parseInt(a.productQuality)) {
            return parseInt(b.productQuality) - parseInt(a.productQuality);
          }
          // Third priority: Originality (original over replica)
          return (
            (b.isOriginal === true ? 1 : 0) - (a.isOriginal === true ? 1 : 0)
          );
        });

      if (matchingProducts.length > 0) {
        matchingProducts.forEach((product) => {
          if (remainingQuantity <= 0) return;

          const availableQuantity = Math.min(
            remainingQuantity,
            parseInt(product.productStock)
          );
          const cost = availableQuantity * parseFloat(product.productPrice);
          totalCost += cost;
          remainingQuantity -= availableQuantity;

          details.push({
            product,
            quantity: availableQuantity,
            cost,
          });
        });

        if (remainingQuantity > 0) {
          console.log(
            `Still need ${remainingQuantity} more ${item.subcategory} in ${item.category}.`
          );
          const totalStock = matchingProducts.reduce(
            (sum, product) => sum + parseInt(product.productStock),
            0
          );
          if (totalStock < item.quantity) {
            console.log(
              `The required quantity of ${item.subcategory} exceeds the available stock in the entire database.`
            );
          }
        }
      } else {
        console.log(
          `No products found for ${item.subcategory} in ${item.category}.`
        );
      }
    });

    return { details, totalCost };
  };

  const findQualityOption = (selectedItems, products) => {
    let totalCost = 0;
    const details = [];
    selectedItems.forEach((item) => {
      let remainingQuantity = item.quantity;
      const matchingProducts = products
        .filter(
          (product) =>
            product.productCategory === item.category &&
            product.productSubcategory === item.subcategory
        )
        .sort((a, b) => {
          // First priority: Quality (higher is better)
          if (parseInt(b.productQuality) !== parseInt(a.productQuality)) {
            return parseInt(b.productQuality) - parseInt(a.productQuality);
          }
          // Second priority: Price (lower is better)
          if (parseFloat(a.productPrice) !== parseFloat(b.productPrice)) {
            return parseFloat(a.productPrice) - parseFloat(b.productPrice);
          }
          // Third priority: Originality (original over replica)
          return (
            (b.isOriginal === true ? 1 : 0) - (a.isOriginal === true ? 1 : 0)
          );
        });

      if (matchingProducts.length > 0) {
        matchingProducts.forEach((product) => {
          if (remainingQuantity <= 0) return;

          const availableQuantity = Math.min(
            remainingQuantity,
            parseInt(product.productStock)
          );
          const cost = availableQuantity * parseFloat(product.productPrice);
          totalCost += cost;
          remainingQuantity -= availableQuantity;

          details.push({
            product,
            quantity: availableQuantity,
            cost,
          });
        });

        if (remainingQuantity > 0) {
          console.log(
            `Still need ${remainingQuantity} more ${item.subcategory} in ${item.category}.`
          );
          const totalStock = matchingProducts.reduce(
            (sum, product) => sum + parseInt(product.productStock),
            0
          );
          if (totalStock < item.quantity) {
            console.log(
              `The required quantity of ${item.subcategory} exceeds the available stock in the entire database.`
            );
          }
        }
      } else {
        console.log(
          `No products found for ${item.subcategory} in ${item.category}.`
        );
      }
    });

    return { details, totalCost };
  };

  const findBalancedOption = (selectedItems, products) => {
    const maxQuality = 5; // Assuming the maximum quality is 5
    const minPrice = Math.min(
      ...products.map((product) => parseFloat(product.productPrice))
    );

    let totalCost = 0;
    const details = [];
    selectedItems.forEach((item) => {
      let remainingQuantity = item.quantity;
      const matchingProducts = products
        .filter(
          (product) =>
            product.productCategory === item.category &&
            product.productSubcategory === item.subcategory
        )
        .map((product) => {
          const normalizedQuality =
            parseInt(product.productQuality) / maxQuality;
          const normalizedPrice = minPrice / parseFloat(product.productPrice);
          const balancedScore = normalizedQuality * 0.5 + normalizedPrice * 0.5;
          return { ...product, balancedScore };
        })
        .sort((a, b) => b.balancedScore - a.balancedScore); // Sort by balanced score in descending order

      if (matchingProducts.length > 0) {
        matchingProducts.forEach((product) => {
          if (remainingQuantity <= 0) return;

          const availableQuantity = Math.min(
            remainingQuantity,
            parseInt(product.productStock)
          );
          const cost = availableQuantity * parseFloat(product.productPrice);
          totalCost += cost;
          remainingQuantity -= availableQuantity;

          details.push({
            product,
            quantity: availableQuantity,
            cost,
          });
        });

        if (remainingQuantity > 0) {
          console.log(
            `Still need ${remainingQuantity} more ${item.subcategory} in ${item.category}.`
          );
          const totalStock = matchingProducts.reduce(
            (sum, product) => sum + parseInt(product.productStock),
            0
          );
          if (totalStock < item.quantity) {
            console.log(
              `The required quantity of ${item.subcategory} exceeds the available stock in the entire database.`
            );
          }
        }
      } else {
        console.log(
          `No products found for ${item.subcategory} in ${item.category}.`
        );
      }
    });

    return { details, totalCost };
  };

  return (
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
                      {item.product.productPrice} each = ${item.cost.toFixed(2)}
                    </li>
                  ))}
                </ul>
                <p>Total: ${results.cheapest.totalCost.toFixed(2)}</p>
                <button>Select</button>
              </div>
            )}

            {results.quality && (
              <div className="result-card">
                <h3>Quality Option</h3>
                <ul>
                  {results.quality.details.map((item, index) => (
                    <li key={index}>
                      {item.quantity} x {item.product.productName} @ $
                      {item.product.productPrice} each = ${item.cost.toFixed(2)}
                    </li>
                  ))}
                </ul>
                <p>Total: ${results.quality.totalCost.toFixed(2)}</p>
                <button>Select</button>
              </div>
            )}

            {results.balanced && (
              <div className="result-card">
                <h3>Balanced Option</h3>
                <ul>
                  {results.balanced.details.map((item, index) => (
                    <li key={index}>
                      {item.quantity} x {item.product.productName} @ $
                      {item.product.productPrice} each = ${item.cost.toFixed(2)}
                    </li>
                  ))}
                </ul>
                <p>Total: ${results.balanced.totalCost.toFixed(2)}</p>
                <button>Select</button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Selection;
