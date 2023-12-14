import {
  faExclamation,
  faRightToBracket,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import styled from "styled-components";
import superagent from "superagent";
import { API_URL, APP_NAME, TOKEN_COOKIE } from "./environment";
import { Button, Input, Title } from "./styles";
import { setCookie } from "./token";

const LoginPage = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f7f7f7;
  overflow: auto;
  padding: 1rem 0;

  @media (prefers-color-scheme: dark) {
    background-color: #232323;
  }
`;

const LoginForm = styled.form`
  align-self: center;
  margin: auto;

  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 2rem 2rem 2rem;
  border-radius: 8px;
  background-color: white;

  @media (prefers-color-scheme: dark) {
    background-color: #161616;
  }
`;

const ErrorMessage = styled.p`
  min-width: 100%;
  max-width: 0px;
  font-size: 1em;
  font-family: inherit;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  box-shadow: inset 0 0px 1px hsla(0, 0%, 0%, 0.2),
    inset 0 1px 2px hsla(0, 0%, 0%, 0.2);
  color: white;
  background-color: hsla(0, 45%, 50%, 1);
  line-height: 1.5;
  margin: 0;

  i {
    color: inherit;
    margin-left: 0.75rem;
  }
`;

const Label = styled.label`
  display: flex;

  @media only screen and (max-width: 767px) {
    flex-direction: column;
    gap: 0.25rem;
  }

  input {
    flex-grow: 2;
  }
`;

const LabelText = styled.span`
  width: 8rem;
`;

const Buttons = styled.p`
  display: flex;
  gap: 0.5rem;
  margin: 0 0 0 8rem;

  button {
    flex-grow: 2;
  }
`;

function Login() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState(undefined);

  const handleUsernameChange = React.useCallback((event) => {
    setUsername(event.target.value || "");
  }, []);

  const handlePasswordChange = React.useCallback((event) => {
    setPassword(event.target.value || "");
  }, []);

  const handleSignIn = React.useCallback(
    (event) => {
      event.preventDefault();

      (async () => {
        try {
          const res = await superagent
            .post(`${API_URL}/auth`)
            .send({ username, password });

          const { accessToken, expires } = res.body || {};

          if (!accessToken) throw new Error("Invalid response from server");

          setCookie(TOKEN_COOKIE, accessToken, expires);
          window.location.reload();
        } catch (err) {
          if (err.status === 401) {
            setError(new Error("Invalid credentials"));
          } else {
            setError(err);
          }
        }
      })();
    },
    [username, password]
  );

  return (
    <LoginPage>
      <LoginForm onSubmit={handleSignIn}>
        <Title>{APP_NAME}</Title>

        {error ? (
          <ErrorMessage>
            <FontAwesomeIcon icon={faExclamation} fixedWidth />
            <i>{error.statusText || error.message}</i>
          </ErrorMessage>
        ) : null}

        <Label>
          <LabelText>Username</LabelText>

          <Input
            placeholder="Username"
            aria-label="Username"
            type="text"
            name="username"
            autoFocus
            value={username}
            onChange={handleUsernameChange}
          />
        </Label>

        <Label>
          <LabelText>Password</LabelText>

          <Input
            placeholder="Password"
            aria-label="Password"
            type="password"
            name="password"
            value={password}
            onChange={handlePasswordChange}
          />
        </Label>

        <Buttons>
          <Button type="submit">
            <FontAwesomeIcon icon={faRightToBracket} /> Sign in
          </Button>
        </Buttons>
      </LoginForm>
    </LoginPage>
  );
}

export default Login;
