import React, { useState } from "react";
import { Button, FormInput, FormLabel } from "../shared";
import { Link } from "react-router-dom";
import { login } from "../../http";
import { isValidEmail } from "../../utils";
import { useDispatch } from "react-redux";
import { setAuth } from "../../feature/user/userSlice";
import { enqueueSnackbar } from "notistack";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Validation
    if (!email || !password) {
      enqueueSnackbar("Please fill all the fields!", {
        variant: "warning",
        anchorOrigin: { vertical: "top", horizontal: "center" },
      });
      return;
    }

    if (!isValidEmail(email)) {
      enqueueSnackbar("Please enter a valid email address!", {
        variant: "warning",
        anchorOrigin: { vertical: "top", horizontal: "center" },
      });
      return;
    }

    try {
      setLoading(true);
      const { data } = await login({ email, password });

      // Set user data in redux store
      dispatch(setAuth(data.user));

      enqueueSnackbar(data.message || "Login successful!", {
        variant: "success",
        anchorOrigin: { vertical: "top", horizontal: "center" },
      });
    } catch (error) {
      console.log(error);
      enqueueSnackbar(
        error?.response?.data?.message || "Login failed!",
        {
          variant: "error",
          anchorOrigin: { vertical: "top", horizontal: "center" },
        }
      );
    } finally {
      setLoading(false);
      setEmail("");
      setPassword("");
    }
  };

  return (
    <div className="max-w-sm p-4 rounded-lg sm:p-6 md:p-8 bg-black-700 w-full">
      <form className="space-y-6" onSubmit={handleLogin}>
        <h5 className="text-xl font-medium text-white text-center">
          Sign in to our platform
        </h5>
        <div>
          <FormLabel htmlFor="email" labelHeading="Your email" />
          <FormInput
            type="email"
            name="email"
            id="email"
            value={email}
            setState={setEmail}
            placeholder="name@company.com"
          />
        </div>
        <div>
          <FormLabel htmlFor="password" labelHeading="Your password" />
          <FormInput
            type="password"
            name="password"
            id="password"
            value={password}
            setState={setPassword}
            placeholder="••••••••"
          />
        </div>
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="remember"
              type="checkbox"
              className="w-4 h-4 border border-gray-300 rounded bg-gray-700 focus:ring-blue-600"
            />
          </div>
          <label htmlFor="remember" className="ms-2 text-sm text-gray-300">
            Remember me
          </label>
          <a href="#" className="ms-auto text-sm text-indigo-500 hover:underline">
            Forgot Password?
          </a>
        </div>
        <Button
          content="Login to your account"
          handleInput={handleLogin}
          isloading={loading}
        />
        <div className="text-sm font-medium text-gray-300">
          Not registered?
          <Link to="/register" className="text-indigo-500 hover:underline ml-1">
            Create account
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
