import { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./models/contexts/AuthContext";
import Register from "./views/Register";
import Login from "./views/Login";
import List from "./views/supplier/List";
import New from "./views/supplier/New";
import Selection from "./views/mechanic/Selection";
import Update from "./views/supplier/Update";
import Users from "./views/admin/Users";
import Products from "./views/admin/Products";
import Orders from "./views/admin/Orders";
import NewProduct from "./views/admin/NewProduct";
import UpdateProduct from "./views/admin/UpdateProduct";
import NewUser from "./views/admin/NewUser";
import UpdateUser from "./views/admin/UpdateUser";
import MechanicOrders from "./views/mechanic/MechanicOrders";
import RequireAuth from "./controllers/RequireAuth";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="admin">
            <Route path="users">
              <Route
                index
                element={
                  <RequireAuth>
                    <Users />
                  </RequireAuth>
                }
              />
              <Route
                path="new"
                element={
                  <RequireAuth>
                    <NewUser />
                  </RequireAuth>
                }
              />
              <Route
                path="update/:productId"
                element={
                  <RequireAuth>
                    <UpdateUser />
                  </RequireAuth>
                }
              />
            </Route>
            <Route path="products">
              <Route
                index
                element={
                  <RequireAuth>
                    <Products />
                  </RequireAuth>
                }
              />
              <Route
                path="new"
                element={
                  <RequireAuth>
                    <NewProduct />
                  </RequireAuth>
                }
              />
              <Route
                path="update/:productId"
                element={
                  <RequireAuth>
                    <UpdateProduct />
                  </RequireAuth>
                }
              />
            </Route>

            <Route
              path="orders"
              element={
                <RequireAuth>
                  <Orders />
                </RequireAuth>
              }
            />
          </Route>
          <Route path=":supplierId">
            <Route
              path="list"
              element={
                <RequireAuth>
                  <List />
                </RequireAuth>
              }
            />
            <Route
              path="new"
              element={
                <RequireAuth>
                  <New />
                </RequireAuth>
              }
            />
            <Route
              path="update/:productId"
              element={
                <RequireAuth>
                  <Update />
                </RequireAuth>
              }
            />
          </Route>
          <Route path=":mechanicId">
            <Route
              path="selection"
              element={
                <RequireAuth>
                  <Selection />
                </RequireAuth>
              }
            />
            <Route
              path="orders"
              element={
                <RequireAuth>
                  <MechanicOrders />
                </RequireAuth>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
