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
  password: string;
  email: string;
  isAuthorized: boolean;
}

const initUser: userResponseData = {
  username: "",
  password: "",
  email: "",
  isAuthorized: false,
};

function App() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [authResponse, setAuthResponse] = useState<authResponseData>();
  const [userResponse, setUserResponse] = useState<userResponseData>(initUser);

  const handleLogin = useCallback(() => {
    axios
      .request<authResponseData>({
        method: "post",
        url: "https://localhost:44384/token",
        data: {
          grant_type: "password",
          username: username,
          password: password,
          app: "admin", //custom parameter
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
      })
      .catch(function (error) {
        console.log("Post Error : " + error);
      });
  }, [password, userResponse, username]);

  const getUser = useCallback(() => {
    axios
      .request<userResponseData>({
        headers: {
          Authorization: `Bearer ${authResponse?.access_token}`,
        },
        method: "GET",
        url: `https://localhost:44384/api/userinfo`,
      })
      .then((response) => {
        // console.log(response.data);
        setUserResponse(response.data);
      });
  }, [authResponse?.access_token]);

  useEffect(() => {
    if (userResponse.isAuthorized) {
      getUser();
    }
  }, [getUser, userResponse]);

  return (
    <div className="App" style={{ marginTop: 100 }}>
      Username :{" "}
      <input type="text" onChange={(e) => setUsername(e.target.value)}></input>
      <br />
      Password :{" "}
      <input type="text" onChange={(e) => setPassword(e.target.value)}></input>
      <br />
      <input
        type="button"
        onClick={() => {
          handleLogin();
        }}
        value={"Login"}
      ></input>
      <br />
      <br />
      <br />
      <small>User info : {userResponse.username}</small>
    </div>
  );
}

export default App;
