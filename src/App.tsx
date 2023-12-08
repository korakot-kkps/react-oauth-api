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
  const [username, setUsername] = useState<string>("lonlekor");
  const [password, setPassword] = useState<string>("7hailand_8");
  const [otp, setOTP] = useState<string>("");
  const [authResponse, setAuthResponse] = useState<authResponseData>(initAuth);
  const [userResponse, setUserResponse] = useState<userResponseData>(initUser);

  const handleLogin = useCallback(
    (loginRole: string) => {
      axios
        .request<authResponseData>({
          method: "post",
          url: "https://localhost:44323/api/v1/auth",
          data: {
            grant_type: "password",
            username: username,
            password: password,
            role: loginRole, //custom parameter
            company:"phatra",
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
          sessionStorage.setItem("access_token", response.data.access_token);
        })
        .catch(function (error) {
          console.log("Post Error : " + error);
        });
    },
    [password, userResponse, username]
  );

  const handleRequestOTP = useCallback(() => {
    axios
      .request<userResponseData>({
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
        },
        method: "GET",
        url: `https://localhost:44323/api/v1/otp-request/`,
      })
      .then((response) => {
        // console.log(response.data);
        setUserResponse(response.data);
      });
  }, []);

  const handleSubmitOTP = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      console.log(otp);
      axios
        .request({
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
          },
          method: "post",
          url: `https://localhost:44323/api/v1/otp-submit`,
          data: { OTP: otp },
        })
        .then((response) => {
          // console.log(response.data);
          console.log("OTP is valid");
        });
    },
    [otp]
  );

  const handleLogout = useCallback(async () => {
    axios
      .request<userResponseData>({
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
        },
        method: "get",
        url: `https://localhost:44323/api/v1/logout`,
      })
      .then((response) => {
        sessionStorage.removeItem("access_token");
        console.log("logged off");
      });
  }, []);

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
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            ></input>
          </td>
        </tr>
        <tr>
          <td>password : </td>
          <td>
            <input
              type="password"
              value={password}
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
                handleLogin("admin");
              }}
              value={"Login as Admin"}
            ></input>
            &nbsp;&nbsp;
            <input
              type="button"
              style={{ width: "100px" }}
              onClick={() => {
                handleLogin("user");
              }}
              value={"Login as User"}
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
          <td colSpan={1} align="right">
            <input
              type="button"
              style={{ width: "100px" }}
              onClick={() => {
                handleRequestOTP();
              }}
              value={"Get OTP"}
            ></input>
          </td>
        </tr>
        <tr>
          <td width={100}>Confirm OTP : </td>
          <td>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOTP(e.target.value)}
            ></input>
          </td>
        </tr>
        <tr>
          <td></td>
          <td colSpan={1} align="right">
            <form id="formOTP" onSubmit={handleSubmitOTP}>
              <input
                type="submit"
                name="OTP"
                style={{ width: "100px" }}
                onClick={(e) => {
                  // e.preventDefault();
                }}
                value={"Submit OTP"}
              ></input>
            </form>
          </td>
        </tr>
      </table>

      {userResponse.isAuthorized ? <div></div> : <div></div>}

      <table>
        <tr>
          <td colSpan={2} align="left">
            <b>Test Logout</b>
          </td>
        </tr>
        <tr>
          <td colSpan={2} align="right">
            <input
              type="button"
              style={{ width: "100px" }}
              onClick={() => {
                handleLogout();
              }}
              value={"Logout"}
            ></input>
          </td>
        </tr>
      </table>

      <table>
        <tr>
          <td colSpan={2} align="left">
            <b>Sales Portal - API Call</b>
          </td>
        </tr>
        <tr>
          <td colSpan={2} align="right">
            <input
              type="button"
              style={{ width: "100%" }}
              onClick={() => {
                axios
                  .request<userResponseData>({
                    headers: {
                      Authorization: `Bearer ${sessionStorage.getItem(
                        "access_token"
                      )}`,
                    },
                    method: "get",
                    url: `https://localhost:44323/api/v1/announcers-list`,
                  })
                  .then((response) => {});
              }}
              value={"api/v1/announcers-list"}
            ></input>
          </td>
        </tr>
        <tr>
          <td colSpan={2} align="right">
            <input
              type="button"
              style={{ width: "100%" }}
              onClick={() => {
                axios
                  .request<userResponseData>({
                    headers: {
                      Authorization: `Bearer ${sessionStorage.getItem(
                        "access_token"
                      )}`,
                    },
                    method: "get",
                    url: `https://localhost:44323/api/admin/v1/announcers-list`,
                  })
                  .then((response) => {});
              }}
              value={"api/admin/v1/announcers-list"}
            ></input>
          </td>
        </tr>
      </table>
    </div>
  );
}

export default App;
