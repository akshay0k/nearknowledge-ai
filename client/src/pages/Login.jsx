import { useEffect, useState } from "react";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { loginUser, registerUser } from "../api/authApi";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, token } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, token]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data =
        mode === "login"
          ? await loginUser({
              email: form.email,
              password: form.password,
            })
          : await registerUser(form);

      login(data.user, data.token);

      navigate("/dashboard", { replace: true });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const isRegister = mode === "register";

  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col lg:flex-row">
      <div className="flex min-h-[38vh] flex-1 items-center justify-center px-6 py-10 sm:px-10 lg:min-h-screen lg:p-16">
        <div className="max-w-xl">
          <h1 className="text-4xl font-bold">
            NearKnowledge
          </h1>

          <p className="text-slate-400 mt-5 text-base leading-relaxed">
            Knowledge, always within reach. Upload documents. Ask AI. Learn
            faster.
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-5 pb-10 sm:px-8 lg:p-10">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-[430px] rounded-lg border border-[#25314A] bg-[#141A26] p-6 sm:p-8 lg:p-10"
        >
          <h2 className="text-2xl font-bold">
            {isRegister ? "Create Account" : "Welcome Back"}
          </h2>

          <p className="mb-6 mt-2 text-sm text-slate-400">
            {isRegister
              ? "Create your workspace and start reading PDFs with AI."
              : "Sign in to your knowledge workspace."}
          </p>

          <div className="space-y-5">
            {isRegister && (
              <Input
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
              />
            )}

            <Input
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />

            <Input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
            />

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full">
              {loading
                ? "Please wait..."
                : isRegister
                  ? "Create Account"
                  : "Continue"}
            </Button>

            <button
              type="button"
              onClick={() => {
                setError("");
                setMode(isRegister ? "login" : "register");
              }}
              className="w-full text-center text-sm text-blue-300 hover:text-blue-200"
            >
              {isRegister
                ? "Already have an account? Sign in"
                : "New here? Create an account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
