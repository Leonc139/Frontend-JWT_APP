import axios from "axios";
import React, { useState, useEffect } from "react";
import jwt_decode from "jwt-decode";
import { useNavigate, Link } from "react-router-dom";

const api = "http://localhost:5000";

const Dashboard = () => {
  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    refreshToken();
    getUsers();
  }, []);

  const refreshToken = async () => {
    try {
      const response = await axios.get(api + "/token");
      // set token kedalam state
      setToken(response.data.accessToken);
      const decoded = jwt_decode(response.data.accessToken);
      //console.log(decoded);
      setName(decoded.name);
      setExpire(decoded.exp);
    } catch (error) {
      if (error.response) {
        navigate("/");
      }
    }
  };

  const axiosJWT = axios.create();

  // axios interceptors berfungsi untuk melakukan pengecekan sebelum request
  axiosJWT.interceptors.request.use(
    async (config) => {
      // ambil waktu sekarang
      const currentDate = new Date();
      // bandingkan currentDate dengan expire
      if (expire * 1000 < currentDate.getTime()) {
        // panggil refresh token
        const response = await axios.get(api + "/token");
        // update headers
        config.headers.Authorization = `Bearer ${response.data.accessToken}`;
        setToken(response.data.accessToken);
        const decoded = jwt_decode(response.data.accessToken);
        //console.log(decoded);
        setName(decoded.name);
        setExpire(decoded.exp);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const getUsers = async () => {
    const response = await axiosJWT.get(api + "/users", {
      // mengirimkan token
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setUsers(response.data);
    console.log(response.data);
  };

  const deleteUser = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/users/${id}`);
      getUsers();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container mt-5">
      <h1>Welcome {name}</h1>
      <Link to={"/add"} className="button is-success">
        Add New
      </Link>
      <table className="table is-striped is-fullwidth">
        <thead>
          <tr>
            <th>No</th>
            <th>Name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user.id}>
              <td>{index + 1}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <Link
                  to={`/edit/${user.id}`}
                  className="button is-small is-info mr-2"
                >
                  Edit
                </Link>
                <button
                  onClick={() => deleteUser(user.id)}
                  className="button is-small is-danger"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
