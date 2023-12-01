import React, { useCallback, useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import axios, { AxiosInstance } from "axios";
import { access } from "fs";
import { stringify } from "querystring";

interface authResponseData {
  token_type: string;
  access_token: string;
  expire_in: number;
}
interface userResponseData {
  username: string;
  fullname: string;
  role: string;
  email: string;
  isAuthorized: boolean;
}
const initAuth: authResponseData = {
  token_type: "",
  access_token: "string",
  expire_in: 0,
};

const initUser: userResponseData = {
  username: "",
  fullname: "",
  role: "",
  email: "",
  isAuthorized: false,
};

function App() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [authResponse, setAuthResponse] = useState<authResponseData>(initAuth);
  const [userResponse, setUserResponse] = useState<userResponseData>(initUser);  

  const handleLogin = useCallback(() => {
    axios
      .request<authResponseData>({
        method: "post",
        url: "https://localhost:44384/api/auth",
        data: {
          grant_type: "password",
          username: username,
          password: password,
          role: "user", //custom parameter
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Cache-Control": "no-cache",
          "Accepted-Language": "TH",
        },
      })
      .then(function (response) {
        setAuthResponse(response.data);
        setUserResponse({ ...userResponse, isAuthorized: true });
          sessionStorage.setItem(
            "access_token",
            authResponse.access_token
          );
      })
      .catch(function (error) {
        console.log("Post Error : " + error);
      });
  }, [authResponse.access_token, password, userResponse, username]);

  const handleGetOTP = useCallback(() => {
    axios
      .request<userResponseData>({
        headers: {
          Authorization: `Bearer ${authResponse?.access_token === "" ? authResponse?.access_token : sessionStorage.getItem("access_token") }`,
        },
        method: "GET",
        url: `https://localhost:44384/api/otp-get`,
      })
      .then((response) => {
        // console.log(response.data);
        setUserResponse(response.data);
      });
  }, [authResponse?.access_token]);

  return (
    <div className="App" style={{ margin: 30 }}>
      <table>
        <tr>
          <td colSpan={2}>
            <h3>Sales Portal</h3>
          </td>
        </tr>
      </table>

      <table>
        <tr>
          <td colSpan={2} align="left">
            <b>Login</b>
          </td>
        </tr>
        <tr>
          <td width={100}>username : </td>
          <td>
            {" "}
            <input
              type="text"
              onChange={(e) => setUsername(e.target.value)}
            ></input>
          </td>
        </tr>
        <tr>
          <td>password : </td>
          <td>
            <input
              type="text"
              onChange={(e) => setPassword(e.target.value)}
            ></input>
          </td>
        </tr>
        <tr>
          <td colSpan={2} align="right">
            <input
              type="button"
              style={{ width: "100px" }}
              onClick={() => {
                handleLogin();
              }}
              value={"Login"}
            ></input>
          </td>
        </tr>
      </table>

      <table>
        <tr>
          <td colSpan={2} align="left">
            <b>Verify identity with OTP</b>
          </td>
        </tr>
        <tr>
          <td width={100}>OTP : </td>
          <td>
            <input
              type="text"
              onChange={(e) => setUsername(e.target.value)}
            ></input>
          </td>
        </tr>
        <tr>
          <td colSpan={2} align="right">
            <input
              type="button"
              style={{ width: "100px" }}
              onClick={() => {
                handleGetOTP();
              }}
              value={"Confirm"}
            ></input>
          </td>
        </tr>
      </table>

      {userResponse.isAuthorized ? <div></div> : <div></div>}
    </div>
  );
}

export default App;
